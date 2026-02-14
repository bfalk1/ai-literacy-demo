import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { AshbyClient } from '@/lib/ashby';

/**
 * Configure Ashby Integration for a Company
 * 
 * GET - Get current config (with API key masked)
 * POST - Set/update Ashby config
 * DELETE - Remove Ashby integration
 */

// Verify API key and get company
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
    .select('ashby_enabled, ashby_trigger_stage, ashby_api_key, ashby_secret_key')
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
    enabled: company.ashby_enabled,
    triggerStage: company.ashby_trigger_stage,
    apiKeyConfigured: !!company.ashby_api_key,
    apiKeyPreview: maskKey(company.ashby_api_key),
    secretKeyConfigured: !!company.ashby_secret_key,
    webhookUrl: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/api/integrations/ashby/webhook?company_id=${companyId}`,
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
      ashbyApiKey, 
      ashbySecretKey, 
      triggerStage,
      enabled 
    } = body;

    // Validate API key by making a test request
    if (ashbyApiKey) {
      try {
        const testClient = new AshbyClient({ apiKey: ashbyApiKey });
        const isValid = await testClient.testConnection();
        if (!isValid) {
          throw new Error('Connection test failed');
        }
      } catch (err) {
        return NextResponse.json({ 
          error: 'Invalid Ashby API key - could not authenticate' 
        }, { status: 400 });
      }
    }

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {};
    
    if (ashbyApiKey !== undefined) {
      updates.ashby_api_key = ashbyApiKey || null;
    }
    if (ashbySecretKey !== undefined) {
      updates.ashby_secret_key = ashbySecretKey || null;
    }
    if (triggerStage !== undefined) {
      updates.ashby_trigger_stage = triggerStage || 'assessment';
    }
    if (enabled !== undefined) {
      updates.ashby_enabled = !!enabled;
    }

    const { error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate webhook URL
    const webhookUrl = `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/api/integrations/ashby/webhook?company_id=${companyId}`;

    return NextResponse.json({
      success: true,
      message: 'Ashby integration configured',
      webhookUrl,
      instructions: {
        step1: 'Go to Ashby > Admin > Integrations > Webhooks',
        step2: 'Click "Add Webhook"',
        step3: `Set URL to: ${webhookUrl}`,
        step4: 'Select events: "Application Stage Changed"',
        step5: ashbySecretKey 
          ? 'Set the secret to the one you provided'
          : 'Copy the webhook secret and update your config here',
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
      ashby_enabled: false,
      ashby_api_key: null,
      ashby_secret_key: null,
    })
    .eq('id', companyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Ashby integration removed',
  });
}
