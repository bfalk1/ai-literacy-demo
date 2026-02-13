import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  // Check if already used
  if (invitation.used_at) {
    return NextResponse.json({ error: 'This invitation has already been used' }, { status: 410 });
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invitation has expired' }, { status: 410 });
  }

  return NextResponse.json({
    invitation: {
      id: invitation.id,
      candidate_email: invitation.candidate_email,
      candidate_name: invitation.candidate_name,
      company_id: invitation.company_id,
      expires_at: invitation.expires_at,
      ats_job_id: invitation.ats_job_id,
      ats_application_id: invitation.ats_application_id,
    },
  });
}
