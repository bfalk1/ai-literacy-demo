import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

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
    // Update last used
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKey.id);

    return apiKey.company_id;
  }

  return null;
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

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');
  const since = searchParams.get('since'); // ISO date string

  let query = supabase
    .from('assessments')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (since) {
    query = query.gte('created_at', since);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    assessments: data,
    pagination: {
      limit,
      offset,
      count: data?.length || 0,
    },
  });
}
