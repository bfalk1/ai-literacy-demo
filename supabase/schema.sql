-- Telescopic AI Literacy Assessment Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Assessments table
create table if not exists assessments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Candidate info
  candidate_name text not null,
  candidate_email text,
  
  -- Assessment metadata
  task text not null,
  duration_seconds integer not null,
  message_count integer not null,
  
  -- Scores (0-100)
  overall_score integer not null,
  prompt_quality_score integer not null,
  prompt_quality_feedback text,
  context_score integer not null,
  context_feedback text,
  iteration_score integer not null,
  iteration_feedback text,
  efficiency_score integer not null,
  efficiency_feedback text,
  
  -- Summary
  summary text,
  
  -- Full transcript (JSONB for flexibility)
  transcript jsonb not null,
  
  -- ATS Integration fields
  ats_job_id text,           -- Link to job posting
  ats_application_id text,   -- Link to application
  ats_webhook_sent boolean default false,
  ats_webhook_sent_at timestamp with time zone,
  
  -- Status
  status text default 'completed' check (status in ('completed', 'in_progress', 'error'))
);

-- Indexes for common queries
create index if not exists idx_assessments_created_at on assessments(created_at desc);
create index if not exists idx_assessments_candidate_email on assessments(candidate_email);
create index if not exists idx_assessments_overall_score on assessments(overall_score desc);
create index if not exists idx_assessments_ats_job_id on assessments(ats_job_id);

-- Row Level Security (RLS)
alter table assessments enable row level security;

-- Policy: Service role can do everything
create policy "Service role has full access" on assessments
  for all using (auth.role() = 'service_role');

-- Policy: Anon can insert (for assessment submission)
create policy "Anyone can submit assessments" on assessments
  for insert with check (true);

-- Policy: Authenticated users can view (for admin dashboard later)
create policy "Authenticated users can view" on assessments
  for select using (auth.role() = 'authenticated');
