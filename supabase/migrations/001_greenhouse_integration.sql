-- Greenhouse Integration Migration
-- Run this in Supabase SQL Editor after the initial schema

-- ============================================
-- Companies Table (if not exists)
-- ============================================
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Basic info
  name text not null,
  slug text unique,
  
  -- Contact
  admin_email text,
  
  -- Greenhouse Integration
  greenhouse_api_key text,           -- Harvest API key (encrypted in production)
  greenhouse_secret_key text,        -- Webhook signature verification
  greenhouse_trigger_stage text default 'assessment',  -- Stage name that triggers assessment
  greenhouse_enabled boolean default false,
  
  -- Other ATS integrations (future)
  lever_api_key text,
  workday_api_key text,
  
  -- Settings
  settings jsonb default '{}'::jsonb
);

-- Enable RLS
alter table companies enable row level security;

-- Policy: Service role has full access
create policy "Service role full access on companies" on companies
  for all using (auth.role() = 'service_role');

-- ============================================
-- API Keys Table (if not exists)
-- ============================================
create table if not exists api_keys (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  company_id uuid references companies(id) on delete cascade not null,
  key_hash text not null,  -- base64 encoded key for lookup
  name text,               -- Human readable name
  last_used_at timestamp with time zone
);

create index if not exists idx_api_keys_key_hash on api_keys(key_hash);
create index if not exists idx_api_keys_company_id on api_keys(company_id);

alter table api_keys enable row level security;

create policy "Service role full access on api_keys" on api_keys
  for all using (auth.role() = 'service_role');

-- ============================================
-- Invitations Table Updates
-- ============================================
-- Add ATS fields to invitations if they don't exist
do $$
begin
  -- Add company_id if not exists
  if not exists (select 1 from information_schema.columns 
    where table_name = 'invitations' and column_name = 'company_id') then
    alter table invitations add column company_id uuid references companies(id);
  end if;

  -- Add ATS provider field
  if not exists (select 1 from information_schema.columns 
    where table_name = 'invitations' and column_name = 'ats_provider') then
    alter table invitations add column ats_provider text;  -- 'greenhouse', 'lever', etc.
  end if;

  -- Add ATS candidate ID
  if not exists (select 1 from information_schema.columns 
    where table_name = 'invitations' and column_name = 'ats_candidate_id') then
    alter table invitations add column ats_candidate_id text;
  end if;
end $$;

-- ============================================
-- Assessments Table Updates
-- ============================================
do $$
begin
  -- Add company_id if not exists
  if not exists (select 1 from information_schema.columns 
    where table_name = 'assessments' and column_name = 'company_id') then
    alter table assessments add column company_id uuid references companies(id);
  end if;

  -- Add ATS provider
  if not exists (select 1 from information_schema.columns 
    where table_name = 'assessments' and column_name = 'ats_provider') then
    alter table assessments add column ats_provider text;
  end if;

  -- Add ATS candidate ID (for pushing results back)
  if not exists (select 1 from information_schema.columns 
    where table_name = 'assessments' and column_name = 'ats_candidate_id') then
    alter table assessments add column ats_candidate_id text;
  end if;

  -- Add invitation_id to link assessment to invitation
  if not exists (select 1 from information_schema.columns 
    where table_name = 'assessments' and column_name = 'invitation_id') then
    alter table assessments add column invitation_id uuid;
  end if;
end $$;

-- Indexes for ATS queries
create index if not exists idx_assessments_company_id on assessments(company_id);
create index if not exists idx_assessments_ats_provider on assessments(ats_provider);
create index if not exists idx_assessments_ats_candidate_id on assessments(ats_candidate_id);
create index if not exists idx_invitations_company_id on invitations(company_id);
create index if not exists idx_invitations_ats_provider on invitations(ats_provider);

-- ============================================
-- Helper function to auto-sync on assessment completion
-- ============================================
create or replace function notify_assessment_completed()
returns trigger as $$
begin
  -- Only fire when status changes to 'completed'
  if NEW.status = 'completed' and (OLD.status is null or OLD.status != 'completed') then
    -- You could trigger a webhook here or queue a job
    -- For now, we'll handle sync via API call
    raise notice 'Assessment completed: %', NEW.id;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Create trigger
drop trigger if exists assessment_completed_trigger on assessments;
create trigger assessment_completed_trigger
  after insert or update on assessments
  for each row
  execute function notify_assessment_completed();
