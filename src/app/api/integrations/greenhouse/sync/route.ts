import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { GreenhouseClient } from '@/lib/greenhouse';

/**
 * Sync Assessment Results to Greenhouse
 * 
 * POST /api/integrations/greenhouse/sync
 * Body: { assessmentId: string }
 * 
 * This endpoint:
 * 1. Fetches the assessment from Supabase
 * 2. Gets the company's Greenhouse API key
 * 3. Pushes results to Greenhouse as a note on the candidate
 * 4. Marks the assessment as synced
 */

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { assessmentId } = body;

    if (!assessmentId) {
      return NextResponse.json({ error: 'assessmentId required' }, { status: 400 });
    }

    // Get the assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Check if already synced
    if (assessment.ats_webhook_sent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already synced',
        syncedAt: assessment.ats_webhook_sent_at 
      });
    }

    // Need ats_candidate_id to push to Greenhouse
    if (!assessment.ats_candidate_id) {
      return NextResponse.json({ 
        error: 'No Greenhouse candidate ID linked to this assessment' 
      }, { status: 400 });
    }

    // Get the company's Greenhouse API key
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, greenhouse_api_key')
      .eq('id', assessment.company_id)
      .single();

    if (companyError || !company?.greenhouse_api_key) {
      return NextResponse.json({ 
        error: 'Company Greenhouse API key not configured' 
      }, { status: 400 });
    }

    // Initialize Greenhouse client
    const greenhouse = new GreenhouseClient({ apiKey: company.greenhouse_api_key });

    // Push results to Greenhouse
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    
    await greenhouse.pushAssessmentResults(
      parseInt(assessment.ats_candidate_id),
      {
        candidateName: assessment.candidate_name,
        overallScore: assessment.overall_score,
        promptQualityScore: assessment.prompt_quality_score,
        contextScore: assessment.context_score,
        iterationScore: assessment.iteration_score,
        efficiencyScore: assessment.efficiency_score,
        summary: assessment.summary || '',
        assessmentUrl: `${baseUrl}/results/${assessment.id}`,
        duration: assessment.duration_seconds,
      }
    );

    // Mark as synced
    await supabase
      .from('assessments')
      .update({
        ats_webhook_sent: true,
        ats_webhook_sent_at: new Date().toISOString(),
      })
      .eq('id', assessmentId);

    return NextResponse.json({
      success: true,
      message: 'Assessment results synced to Greenhouse',
      candidateId: assessment.ats_candidate_id,
    });
  } catch (error) {
    console.error('Greenhouse sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

/**
 * Bulk sync all unsynced assessments for a company
 * 
 * POST /api/integrations/greenhouse/sync?bulk=true
 * Body: { companyId: string }
 */
export async function PUT(request: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    // Get company's Greenhouse config
    const { data: company } = await supabase
      .from('companies')
      .select('id, greenhouse_api_key')
      .eq('id', companyId)
      .single();

    if (!company?.greenhouse_api_key) {
      return NextResponse.json({ 
        error: 'Greenhouse API key not configured' 
      }, { status: 400 });
    }

    // Get all unsynced assessments with Greenhouse candidate IDs
    const { data: assessments } = await supabase
      .from('assessments')
      .select('*')
      .eq('company_id', companyId)
      .eq('ats_webhook_sent', false)
      .not('ats_candidate_id', 'is', null)
      .limit(50); // Process in batches

    if (!assessments || assessments.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No assessments to sync',
        synced: 0 
      });
    }

    const greenhouse = new GreenhouseClient({ apiKey: company.greenhouse_api_key });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    let synced = 0;
    const errors: string[] = [];

    for (const assessment of assessments) {
      try {
        await greenhouse.pushAssessmentResults(
          parseInt(assessment.ats_candidate_id),
          {
            candidateName: assessment.candidate_name,
            overallScore: assessment.overall_score,
            promptQualityScore: assessment.prompt_quality_score,
            contextScore: assessment.context_score,
            iterationScore: assessment.iteration_score,
            efficiencyScore: assessment.efficiency_score,
            summary: assessment.summary || '',
            assessmentUrl: `${baseUrl}/results/${assessment.id}`,
            duration: assessment.duration_seconds,
          }
        );

        await supabase
          .from('assessments')
          .update({
            ats_webhook_sent: true,
            ats_webhook_sent_at: new Date().toISOString(),
          })
          .eq('id', assessment.id);

        synced++;
      } catch (err) {
        errors.push(`${assessment.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      total: assessments.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Bulk sync error:', error);
    return NextResponse.json(
      { error: 'Bulk sync failed' },
      { status: 500 }
    );
  }
}
