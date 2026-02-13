import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import crypto from 'crypto';

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

  if (apiKey) {
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKey.id);

    return apiKey.company_id;
  }

  return null;
}

// POST - Create invitation
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
      candidateEmail, 
      candidateName, 
      expiresInHours = 72,
      atsJobId,
      atsApplicationId,
    } = body;

    if (!candidateEmail) {
      return NextResponse.json({ error: 'candidateEmail is required' }, { status: 400 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        company_id: companyId,
        token,
        candidate_email: candidateEmail,
        candidate_name: candidateName || null,
        expires_at: expiresAt.toISOString(),
        ats_job_id: atsJobId || null,
        ats_application_id: atsApplicationId || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build assessment URL
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const assessmentUrl = `${baseUrl}/assess/${token}`;

    return NextResponse.json({
      success: true,
      invitation: {
        id: data.id,
        token,
        assessmentUrl,
        expiresAt: expiresAt.toISOString(),
        candidateEmail,
        candidateName,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}

// GET - List invitations
export async function GET(request: NextRequest) {
  const companyId = await verifyApiKey(request);
  
  if (!companyId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const status = searchParams.get('status'); // pending, used, expired

  let query = supabase
    .from('invitations')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status === 'pending') {
    query = query.is('used_at', null).gte('expires_at', new Date().toISOString());
  } else if (status === 'used') {
    query = query.not('used_at', 'is', null);
  } else if (status === 'expired') {
    query = query.is('used_at', null).lt('expires_at', new Date().toISOString());
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invitations: data });
}
