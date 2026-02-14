-- Ashby ATS Integration
-- Adds fields to companies table for Ashby integration config

-- Add Ashby columns to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS ashby_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ashby_api_key TEXT,
ADD COLUMN IF NOT EXISTS ashby_secret_key TEXT,
ADD COLUMN IF NOT EXISTS ashby_trigger_stage TEXT DEFAULT 'assessment';

-- Add comments
COMMENT ON COLUMN companies.ashby_enabled IS 'Whether Ashby integration is enabled for this company';
COMMENT ON COLUMN companies.ashby_api_key IS 'Encrypted Ashby API key for Harvest API access';
COMMENT ON COLUMN companies.ashby_secret_key IS 'Webhook secret for verifying Ashby webhooks';
COMMENT ON COLUMN companies.ashby_trigger_stage IS 'Interview stage name that triggers assessment invitations';

-- Add Ashby as a valid ATS provider if using enum
-- (If ats_provider is TEXT, this is not needed)

-- Update invitations table to support Ashby
-- Should already have ats_provider column from Greenhouse migration

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_companies_ashby_enabled 
ON companies(ashby_enabled) 
WHERE ashby_enabled = TRUE;

-- Add ats_jobs table if it doesn't exist (for job syncing)
CREATE TABLE IF NOT EXISTS ats_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  ats_provider TEXT NOT NULL,
  ats_job_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT,
  department TEXT,
  location TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Composite unique constraint
  CONSTRAINT ats_jobs_unique UNIQUE (company_id, ats_provider, ats_job_id)
);

-- Index for job lookups
CREATE INDEX IF NOT EXISTS idx_ats_jobs_company 
ON ats_jobs(company_id, ats_provider);

-- RLS policies for ats_jobs
ALTER TABLE ats_jobs ENABLE ROW LEVEL SECURITY;

-- Companies can see their own jobs
CREATE POLICY IF NOT EXISTS "Companies can view own ats_jobs"
ON ats_jobs FOR SELECT
USING (company_id IN (
  SELECT company_id FROM api_keys WHERE key_hash = current_setting('request.jwt.claims', true)::json->>'key_hash'
));
