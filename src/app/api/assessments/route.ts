import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createServerClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    
    const {
      candidateName,
      candidateEmail,
      task,
      duration,
      messages,
      analysis,
      atsJobId,
      atsApplicationId,
      companyId: providedCompanyId,
      invitationToken,
    } = body;
    
    let companyId = providedCompanyId || null;

    const { data, error } = await supabase
      .from('assessments')
      .insert({
        company_id: companyId,
        candidate_name: candidateName,
        candidate_email: candidateEmail || null,
        task,
        duration_seconds: duration,
        message_count: messages?.length || 0,
        overall_score: analysis.score,
        prompt_quality_score: analysis.promptQuality.score,
        prompt_quality_feedback: analysis.promptQuality.feedback,
        context_score: analysis.contextProvided.score,
        context_feedback: analysis.contextProvided.feedback,
        iteration_score: analysis.iteration.score,
        iteration_feedback: analysis.iteration.feedback,
        efficiency_score: analysis.efficiency.score,
        efficiency_feedback: analysis.efficiency.feedback,
        summary: analysis.summary,
        transcript: messages,
        ats_job_id: atsJobId || null,
        ats_application_id: atsApplicationId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mark invitation as used if token provided
    if (invitationToken && data) {
      await supabase
        .from('invitations')
        .update({ 
          used_at: new Date().toISOString(),
          assessment_id: data.id,
        })
        .eq('token', invitationToken);
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Assessment save error:', error);
    return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
  }
}

// GET assessments (for admin/ATS integration)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    
    const { searchParams } = new URL(request.url);
    
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    let query = supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (jobId) {
      query = query.eq('ats_job_id', jobId);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ assessments: data, count });
  } catch (error) {
    console.error('Assessment fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}
