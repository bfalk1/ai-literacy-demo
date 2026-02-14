import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyGreenhouseWebhook, GreenhouseWebhookEvent } from '@/lib/greenhouse';
import crypto from 'crypto';

/**
 * Greenhouse Webhook Handler
 * 
 * Set up in Greenhouse:
 * Configure > Dev Center > Webhooks > Create Webhook
 * 
 * Events to subscribe:
 * - Application stage changed
 * - Candidate hired
 * - Application updated
 * 
 * Endpoint URL: https://your-domain.com/api/integrations/greenhouse/webhook?company_id=xxx
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

    // Get company's Greenhouse settings
    const { data: company } = await supabase
      .from('companies')
      .select('id, greenhouse_secret_key, greenhouse_trigger_stage')
      .eq('id', companyId)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify webhook signature if secret key is configured
    if (company.greenhouse_secret_key) {
      const signature = request.headers.get('signature') || '';
      
      if (!verifyGreenhouseWebhook(signature, rawBody, company.greenhouse_secret_key)) {
        console.error('Greenhouse webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Parse the webhook event
    const event: GreenhouseWebhookEvent = JSON.parse(rawBody);
    
    console.log('Greenhouse webhook received:', event.action);

    // Handle different event types
    switch (event.action) {
      case 'application_updated':
      case 'candidate_stage_change':
        await handleStageChange(supabase, company, event);
        break;
      
      case 'candidate_hired':
        // Could track this for analytics
        console.log('Candidate hired:', event.payload.candidate?.id);
        break;

      default:
        console.log('Unhandled webhook action:', event.action);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Greenhouse webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleStageChange(
  supabase: ReturnType<typeof createServerClient>,
  company: { id: string; greenhouse_trigger_stage?: string },
  event: GreenhouseWebhookEvent
) {
  const application = event.payload.application;
  const candidate = event.payload.candidate;

  if (!application || !candidate) {
    console.log('Missing application or candidate data');
    return;
  }

  // Check if the stage matches our trigger stage
  const currentStageName = application.current_stage?.name?.toLowerCase() || '';
  const triggerStage = company.greenhouse_trigger_stage?.toLowerCase() || 'assessment';

  if (!currentStageName.includes(triggerStage)) {
    console.log(`Stage "${currentStageName}" doesn't match trigger "${triggerStage}"`);
    return;
  }

  // Get candidate email
  const email = candidate.email_addresses?.[0]?.value;
  if (!email) {
    console.error('No email found for candidate');
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
      candidate_name: `${candidate.first_name} ${candidate.last_name}`.trim(),
      expires_at: expiresAt.toISOString(),
      ats_provider: 'greenhouse',
      ats_job_id: String(application.job_id),
      ats_application_id: String(application.id),
      ats_candidate_id: String(candidate.id),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create invitation:', error);
    return;
  }

  console.log('Created invitation for', email, 'token:', token);

  // TODO: Send email to candidate with assessment link
  // For now, the invitation is created and can be fetched via API
  // Email integration would go here (SendGrid, Resend, etc.)

  // Optionally: Add a note to Greenhouse saying assessment was sent
  // This requires the company's Greenhouse API key
}

// Also handle GET for webhook verification (some webhooks do this)
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok', service: 'Telescopic Greenhouse Integration' });
}
