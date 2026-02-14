import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { GreenhouseClient } from '@/lib/greenhouse';

/**
 * Configure Greenhouse Integration for a Company
 * 
 * GET - Get current config (with API key masked)
 * POST - Set/update Greenhouse config
 * DELETE - Remove Greenhouse integration
 */

// Verify API key and get company (same as other routes)
async function verifyApiKey(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const key = authHeader.substring(7);
  const keyHash = btoa(key);

  const supabase = createServerClient();
  if (!supabase) return null;

  const { data: apiKey } = await supabase
    .from('api_keys')
    .select('id, company_id')
    .eq('key_hash', keyHash)
    .single();

  return apiKey?.company_id || null;
}

export async function GET(request: NextRequest) {
  const companyId = await verifyApiKey(request);
  
  if (!companyId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { data: company, error } = await supabase
    .from('companies')
    .select('greenhouse_enabled, greenhouse_trigger_stage, greenhouse_api_key, greenhouse_secret_key')
    .eq('id', companyId)
    .single();

  if (error || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  // Mask API keys for security
  const maskKey = (key: string | null) => {
    if (!key) return null;
    if (key.length <= 8) return '****';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  };

  return NextResponse.json({
    enabled: company.greenhouse_enabled,
    triggerStage: company.greenhouse_trigger_stage,
    apiKeyConfigured: !!company.greenhouse_api_key,
    apiKeyPreview: maskKey(company.greenhouse_api_key),
    secretKeyConfigured: !!company.greenhouse_secret_key,
    webhookUrl: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/api/integrations/greenhouse/webhook?company_id=${companyId}`,
  });
}

export async function POST(request: NextRequest) {
  const companyId = await verifyApiKey(request);
  
  if (!companyId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { 
      greenhouseApiKey, 
      greenhouseSecretKey, 
      triggerStage,
      enabled 
    } = body;

    // Validate API key by making a test request
    if (greenhouseApiKey) {
      try {
        const testClient = new GreenhouseClient({ apiKey: greenhouseApiKey });
        await testClient.listJobs(); // Simple test call
      } catch (err) {
        return NextResponse.json({ 
          error: 'Invalid Greenhouse API key - could not authenticate' 
        }, { status: 400 });
      }
    }

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {};
    
    if (greenhouseApiKey !== undefined) {
      updates.greenhouse_api_key = greenhouseApiKey || null;
    }
    if (greenhouseSecretKey !== undefined) {
      updates.greenhouse_secret_key = greenhouseSecretKey || null;
    }
    if (triggerStage !== undefined) {
      updates.greenhouse_trigger_stage = triggerStage || 'assessment';
    }
    if (enabled !== undefined) {
      updates.greenhouse_enabled = !!enabled;
    }

    const { error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate webhook URL for them to use in Greenhouse
    const webhookUrl = `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/api/integrations/greenhouse/webhook?company_id=${companyId}`;

    return NextResponse.json({
      success: true,
      message: 'Greenhouse integration configured',
      webhookUrl,
      instructions: {
        step1: 'Go to Greenhouse > Configure > Dev Center > Webhooks',
        step2: 'Click "Create Webhook"',
        step3: `Set endpoint URL to: ${webhookUrl}`,
        step4: 'Select events: "Candidate stage change"',
        step5: greenhouseSecretKey 
          ? 'Set the secret key to the one you provided'
          : 'Generate a secret key and update your config here',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const companyId = await verifyApiKey(request);
  
  if (!companyId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { error } = await supabase
    .from('companies')
    .update({
      greenhouse_enabled: false,
      greenhouse_api_key: null,
      greenhouse_secret_key: null,
    })
    .eq('id', companyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Greenhouse integration removed',
  });
}
