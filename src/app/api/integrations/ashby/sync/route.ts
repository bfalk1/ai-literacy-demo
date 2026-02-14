import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { AshbyClient } from '@/lib/ashby';

/**
 * Sync jobs from Ashby
 * 
 * POST - Manually trigger a sync of jobs from Ashby
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
    // Get company's Ashby API key
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('ashby_api_key, ashby_enabled')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (!company.ashby_enabled || !company.ashby_api_key) {
      return NextResponse.json({ 
        error: 'Ashby integration not configured' 
      }, { status: 400 });
    }

    // Create Ashby client and fetch jobs
    const client = new AshbyClient({ apiKey: company.ashby_api_key });

    // Test connection first
    const isConnected = await client.testConnection();
    if (!isConnected) {
      return NextResponse.json({ 
        error: 'Failed to connect to Ashby - check API key' 
      }, { status: 400 });
    }

    // Fetch all open jobs
    let allJobs: Awaited<ReturnType<typeof client.listJobs>>['results'] = [];
    let cursor: string | undefined;

    do {
      const { results, nextCursor } = await client.listJobs({ 
        cursor, 
        status: 'Open',
        perPage: 100 
      });
      allJobs = allJobs.concat(results);
      cursor = nextCursor;
    } while (cursor);

    // Sync jobs to database (upsert)
    let synced = 0;
    for (const job of allJobs) {
      const { error } = await supabase
        .from('ats_jobs')
        .upsert({
          company_id: companyId,
          ats_provider: 'ashby',
          ats_job_id: job.id,
          title: job.title,
          status: job.status.toLowerCase(),
          department: job.department?.name,
          location: job.location?.name,
          synced_at: new Date().toISOString(),
        }, {
          onConflict: 'company_id,ats_provider,ats_job_id',
        });

      if (!error) synced++;
    }

    return NextResponse.json({
      success: true,
      jobsFound: allJobs.length,
      jobsSynced: synced,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Ashby sync error:', error);
    return NextResponse.json({ 
      error: 'Sync failed' 
    }, { status: 500 });
  }
}
