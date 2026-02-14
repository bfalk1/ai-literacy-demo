import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyLeverWebhook, LeverWebhookPayload, LeverClient } from '@/lib/lever';
import { sendAssessmentInvite } from '@/lib/email';
import crypto from 'crypto';

/**
 * Lever Webhook Handler
 * 
 * Set up in Lever:
 * Settings > Integrations and API > Webhooks
 * Enable "Candidate Stage Change" and paste your webhook URL
 * 
 * Endpoint URL: https://your-domain.com/api/integrations/lever/webhook?company_id=xxx
 */

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // Get company ID from query params
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 });
    }

    // Get company's Lever settings
    const { data: company } = await supabase
      .from('companies')
      .select('id, lever_api_key, lever_signing_token, lever_trigger_stage')
      .eq('id', companyId)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Parse the webhook event
    const event: LeverWebhookPayload = await request.json();
    
    console.log('Lever webhook received:', event.event);
    console.log('Lever webhook payload:', JSON.stringify(event, null, 2));

    // Verify webhook signature if signing token is configured
    if (company.lever_signing_token && event.signature && event.token) {
      if (!verifyLeverWebhook(event.signature, event.token, company.lever_signing_token)) {
        console.error('Lever webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Handle different event types
    switch (event.event) {
      case 'candidateStageChange':
        await handleStageChange(supabase, company, event);
        break;
      
      case 'candidateHired':
        console.log('Candidate hired:', event.data.candidateId);
        break;

      case 'candidateArchiveChange':
        console.log('Candidate archive changed:', event.data.candidateId);
        break;

      default:
        console.log('Unhandled Lever webhook event:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lever webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleStageChange(
  supabase: ReturnType<typeof createServerClient>,
  company: { id: string; lever_api_key?: string; lever_trigger_stage?: string },
  event: LeverWebhookPayload
) {
  const { opportunityId, toStageId } = event.data;

  if (!opportunityId || !toStageId) {
    console.log('Missing opportunityId or toStageId');
    return;
  }

  // We need to fetch the stage name and candidate info from Lever API
  if (!company.lever_api_key) {
    console.log('No Lever API key configured');
    return;
  }

  const lever = new LeverClient({ apiKey: company.lever_api_key });

  // Get stage info
  let stageName = '';
  try {
    const stage = await lever.getStage(toStageId);
    stageName = stage.text.toLowerCase();
  } catch (err) {
    console.error('Failed to fetch stage:', err);
    return;
  }

  // Check if the stage matches our trigger stage
  const triggerStage = company.lever_trigger_stage?.toLowerCase() || 'assessment';

  if (!stageName.includes(triggerStage)) {
    console.log(`Stage "${stageName}" doesn't match trigger "${triggerStage}"`);
    return;
  }

  // Get opportunity (candidate) info
  let opportunity;
  try {
    opportunity = await lever.getOpportunity(opportunityId);
  } catch (err) {
    console.error('Failed to fetch opportunity:', err);
    return;
  }

  // Get candidate email
  const email = opportunity.emails?.[0];
  if (!email) {
    console.error('No email found for candidate:', opportunity.name);
    return;
  }

  // Generate invitation token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

  // Create invitation in Supabase
  const { data: invitation, error } = await supabase!
    .from('invitations')
    .insert({
      company_id: company.id,
      token,
      candidate_email: email,
      candidate_name: opportunity.name || '',
      expires_at: expiresAt.toISOString(),
      ats_provider: 'lever',
      ats_job_id: '', // Lever uses opportunities, not direct job IDs in webhook
      ats_application_id: opportunityId,
      ats_candidate_id: event.data.candidateId,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create invitation:', error);
    return;
  }

  console.log('Created invitation for', email, 'token:', token);

  // Send email to candidate
  const assessmentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/assess/${token}`;
  
  try {
    await sendAssessmentInvite({
      to: email,
      candidateName: opportunity.name || 'Candidate',
      companyName: 'Telescopic Demo', // TODO: Get from company record
      jobTitle: opportunity.headline,
      assessmentUrl,
      expiresAt,
    });
    console.log('Assessment invite email sent to', email);
  } catch (emailError) {
    console.error('Failed to send assessment invite email:', emailError);
  }
}

// Handle GET for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok', service: 'Telescopic Lever Integration' });
}
