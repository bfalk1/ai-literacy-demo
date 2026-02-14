-- Lever ATS Integration
-- Adds fields to companies table for Lever integration config

-- Add Lever columns to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS lever_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lever_api_key TEXT,
ADD COLUMN IF NOT EXISTS lever_signing_token TEXT,
ADD COLUMN IF NOT EXISTS lever_trigger_stage TEXT DEFAULT 'assessment';

-- Add comments
COMMENT ON COLUMN companies.lever_enabled IS 'Whether Lever integration is enabled for this company';
COMMENT ON COLUMN companies.lever_api_key IS 'Lever API key for API access';
COMMENT ON COLUMN companies.lever_signing_token IS 'Webhook signing token for verifying Lever webhooks';
COMMENT ON COLUMN companies.lever_trigger_stage IS 'Stage name that triggers assessment invitations';

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_companies_lever_enabled 
ON companies(lever_enabled) 
WHERE lever_enabled = TRUE;
