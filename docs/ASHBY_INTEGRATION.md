# Ashby ATS Integration

Telescopic integrates with Ashby to automatically trigger AI literacy assessments when candidates reach a specific interview stage, and push results back to Ashby.

## Features

- **Automatic Assessment Triggers**: When a candidate moves to a configured stage (e.g., "Assessment"), Telescopic automatically sends them an assessment invitation
- **Results Sync**: Assessment scores and summaries are pushed back to Ashby as completed assessments
- **Job Sync**: Optionally sync open jobs from Ashby for reporting

## Setup

### 1. Get Your Ashby API Key

1. Log into Ashby as an admin
2. Go to **Admin** → **Integrations** → **API Keys**
3. Click **Create API Key**
4. Name it "Telescopic Integration"
5. Grant permissions:
   - `candidatesRead`
   - `candidatesWrite` (for adding assessment results)
   - `applicationsRead`
   - `jobsRead`
6. Copy the API key (you won't see it again)

### 2. Configure Telescopic

```bash
curl -X POST https://telescopic.ca/api/integrations/ashby/config \
  -H "Authorization: Bearer YOUR_TELESCOPIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ashbyApiKey": "YOUR_ASHBY_API_KEY",
    "triggerStage": "Assessment",
    "enabled": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Ashby integration configured",
  "webhookUrl": "https://telescopic.ca/api/integrations/ashby/webhook?company_id=xxx",
  "instructions": { ... }
}
```

### 3. Set Up Webhook in Ashby

1. Go to **Admin** → **Integrations** → **Webhooks**
2. Click **Add Webhook**
3. Configure:
   - **URL**: Use the `webhookUrl` from the config response
   - **Events**: Select `applicationStageChanged`
   - **Secret**: Generate one and save it
4. Save the webhook

### 4. Update Telescopic with Webhook Secret

```bash
curl -X POST https://telescopic.ca/api/integrations/ashby/config \
  -H "Authorization: Bearer YOUR_TELESCOPIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ashbySecretKey": "YOUR_WEBHOOK_SECRET"
  }'
```

## API Endpoints

### Get Configuration

```bash
GET /api/integrations/ashby/config
Authorization: Bearer YOUR_API_KEY
```

Returns current Ashby configuration with masked API keys.

### Update Configuration

```bash
POST /api/integrations/ashby/config
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "ashbyApiKey": "...",        # Ashby API key
  "ashbySecretKey": "...",     # Webhook signature secret
  "triggerStage": "Assessment", # Stage name to trigger assessments
  "enabled": true               # Enable/disable integration
}
```

### Remove Integration

```bash
DELETE /api/integrations/ashby/config
Authorization: Bearer YOUR_API_KEY
```

### Sync Jobs

```bash
POST /api/integrations/ashby/sync
Authorization: Bearer YOUR_API_KEY
```

Manually sync open jobs from Ashby.

### Webhook Endpoint

```
POST /api/integrations/ashby/webhook?company_id=YOUR_COMPANY_ID
```

Receives webhook events from Ashby. Configured automatically.

## How It Works

### Assessment Flow

1. Recruiter moves candidate to "Assessment" stage in Ashby
2. Ashby sends webhook to Telescopic
3. Telescopic creates invitation and emails candidate
4. Candidate completes AI literacy assessment
5. Telescopic pushes results back to Ashby via `assessment.addCompletedToCandidate`
6. Results appear on candidate profile in Ashby

### Assessment Results in Ashby

Results are displayed as a completed assessment with:
- **Title**: "Telescopic AI Literacy Assessment"
- **Score**: Overall score out of 100
- **Result**: Passed (≥60) or Failed (<60)
- **Summary**: Brief score overview
- **Details**: Breakdown by category (Prompt Quality, Context, Iteration, Efficiency)
- **Link**: Direct link to full results

## Troubleshooting

### "Invalid Ashby API key"
- Verify the API key is correct
- Check that required permissions are granted
- API keys can't be viewed again after creation; generate a new one if lost

### Webhooks not triggering
- Verify webhook URL is correct
- Check Ashby webhook logs for delivery failures
- Ensure the trigger stage name matches exactly (case-insensitive)

### Assessment results not appearing
- Verify `candidatesWrite` permission is granted
- Check Telescopic logs for API errors
- Ensure candidate ID is valid

## Security

- API keys are stored encrypted
- Webhook signatures are verified using HMAC-SHA256
- All API calls use HTTPS
- API keys are masked in responses

## Support

For integration issues:
- Email: support@telescopic.ca
- Ashby API docs: https://developers.ashbyhq.com
