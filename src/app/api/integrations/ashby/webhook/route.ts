import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyAshbyWebhook, AshbyWebhookPayload } from '@/lib/ashby';
import crypto from 'crypto';

/**
 * Ashby Webhook Handler
 * 
 * Set up in Ashby:
 * Admin > Integrations > Webhooks > Add Webhook
 * 
 * Events to subscribe:
 * - applicationStageChanged
 * - candidateHired
 * - candidateArchived
 * 
 * Endpoint URL: https://your-domain.com/api/integrations/ashby/webhook?company_id=xxx
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

    // Get company's Ashby settings
    const { data: company } = await supabase
      .from('companies')
      .select('id, ashby_secret_key, ashby_trigger_stage')
      .eq('id', companyId)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify webhook signature if secret key is configured
    if (company.ashby_secret_key) {
      const signature = request.headers.get('x-ashby-signature') || 
                        request.headers.get('signature') || '';
      
      if (!verifyAshbyWebhook(signature, rawBody, company.ashby_secret_key)) {
        console.error('Ashby webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Parse the webhook event
    const event = JSON.parse(rawBody);
    
    // Log full payload to debug structure
    console.log('Ashby webhook payload:', JSON.stringify(event, null, 2));
    
    // Ashby uses different field names - try common ones
    const eventType = event.eventType || event.type || event.action || event.event;
    console.log('Ashby webhook received:', eventType);

    // Handle different event types
    switch (eventType) {
      case 'applicationStageChanged':
      case 'application.stage.changed':
      case 'candidateApplicationChangedStage':
        await handleStageChange(supabase, company, event);
        break;
      
      case 'candidateHired':
        // Could track this for analytics
        console.log('Candidate hired:', event.data.candidate?.id);
        break;

      case 'candidateArchived':
        console.log('Candidate archived:', event.data.candidate?.id);
        break;

      default:
        console.log('Unhandled webhook event:', event.eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ashby webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleStageChange(
  supabase: ReturnType<typeof createServerClient>,
  company: { id: string; ashby_trigger_stage?: string },
  event: Record<string, unknown>
) {
  // Ashby payload structure varies - try multiple paths
  const data = (event.data || event.payload || event) as Record<string, unknown>;
  const application = (data.application || data.candidateApplication || event.application) as Record<string, unknown> | undefined;
  const candidate = (data.candidate || event.candidate) as Record<string, unknown> | undefined;

  console.log('Processing stage change - application:', application, 'candidate:', candidate);

  if (!application && !candidate) {
    console.log('Missing application and candidate data');
    return;
  }

  // Check if the stage matches our trigger stage
  const stage = (application?.currentInterviewStage || application?.interviewStage || application?.stage) as Record<string, unknown> | undefined;
  const currentStageName = (stage?.name || stage?.title || application?.stageName || '')?.toString().toLowerCase();
  const triggerStage = company.ashby_trigger_stage?.toLowerCase() || 'assessment';

  if (!currentStageName.includes(triggerStage)) {
    console.log(`Stage "${currentStageName}" doesn't match trigger "${triggerStage}"`);
    return;
  }

  // Get candidate email - try multiple paths
  const primaryEmail = candidate?.primaryEmailAddress as Record<string, unknown> | undefined;
  const emailAddresses = candidate?.emailAddresses as Array<Record<string, unknown>> | undefined;
  const email = primaryEmail?.value || emailAddresses?.[0]?.value || candidate?.email;
  
  if (!email) {
    console.error('No email found for candidate:', candidate);
    return;
  }

  // Generate invitation token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

  // Get IDs safely
  const candidateName = (candidate?.name || candidate?.fullName || '')?.toString();
  const jobId = (application?.jobId || application?.job_id || '')?.toString();
  const applicationId = (application?.id || '')?.toString();
  const candidateId = (candidate?.id || '')?.toString();

  // Create invitation in Supabase
  const { data: invitation, error } = await supabase!
    .from('invitations')
    .insert({
      company_id: company.id,
      token,
      candidate_email: email.toString(),
      candidate_name: candidateName,
      expires_at: expiresAt.toISOString(),
      ats_provider: 'ashby',
      ats_job_id: jobId,
      ats_application_id: applicationId,
      ats_candidate_id: candidateId,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create invitation:', error);
    return;
  }

  console.log('Created invitation for', email, 'token:', token);

  // TODO: Send email to candidate with assessment link
  // Email integration would go here (SendGrid, Resend, etc.)
}

// Handle GET for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok', service: 'Telescopic Ashby Integration' });
}
