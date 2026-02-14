# Greenhouse Integration

Telescopic integrates with Greenhouse to automatically send AI literacy assessments when candidates reach a specific stage, and push results back to the candidate's profile.

## How It Works

```
┌─────────────┐     Webhook      ┌─────────────┐     Email      ┌─────────────┐
│  Greenhouse │ ───────────────► │  Telescopic │ ─────────────► │  Candidate  │
│   (Stage)   │                  │   (Server)  │                │   (Inbox)   │
└─────────────┘                  └─────────────┘                └─────────────┘
       ▲                               │                               │
       │                               │                               │
       │         Results               │         Completes             │
       └───────────────────────────────┴───────────────────────────────┘
```

1. **Webhook Trigger**: When a candidate reaches the "Assessment" stage in Greenhouse, a webhook fires
2. **Invitation Created**: Telescopic creates an assessment invitation and emails the candidate
3. **Candidate Completes**: Candidate takes the AI literacy assessment
4. **Results Synced**: Scores and summary are pushed back to the candidate's Greenhouse profile as a note

## Setup

### 1. Configure Telescopic

```bash
# Set your Greenhouse API key and webhook secret
curl -X POST https://your-telescopic-url.com/api/integrations/greenhouse/config \
  -H "Authorization: Bearer YOUR_TELESCOPIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "greenhouseApiKey": "YOUR_GREENHOUSE_HARVEST_API_KEY",
    "greenhouseSecretKey": "YOUR_WEBHOOK_SECRET",
    "triggerStage": "assessment",
    "enabled": true
  }'
```

### 2. Create Greenhouse Harvest API Key

1. Go to **Greenhouse > Configure > Dev Center > API Credential Management**
2. Click **Create New API Key**
3. Select:
   - **API Type**: Harvest
   - **Partner**: Unlisted vendor (or Telescopic if available)
4. **Permissions needed**:
   - `GET Candidates`
   - `GET Applications`
   - `POST Candidates/Activity Feed/Notes`
   - `POST Candidates/Attachments` (optional)

### 3. Create Webhook in Greenhouse

1. Go to **Greenhouse > Configure > Dev Center > Webhooks**
2. Click **Create Webhook**
3. Configure:
   - **Name**: Telescopic Assessment
   - **Endpoint URL**: `https://your-telescopic-url.com/api/integrations/greenhouse/webhook?company_id=YOUR_COMPANY_ID`
   - **Secret Key**: Same secret you set in Telescopic config
   - **Events**: 
     - ✅ Candidate stage change
     - ✅ Application updated

### 4. Create Assessment Stage

In your Greenhouse job's hiring plan, create a stage named "Assessment" (or whatever you set as `triggerStage`).

## API Endpoints

### Configure Integration

```
POST /api/integrations/greenhouse/config
Authorization: Bearer <telescopic_api_key>

{
  "greenhouseApiKey": "string",      // Harvest API key
  "greenhouseSecretKey": "string",   // Webhook verification secret
  "triggerStage": "string",          // Stage name that triggers assessment (default: "assessment")
  "enabled": boolean
}
```

### Get Configuration

```
GET /api/integrations/greenhouse/config
Authorization: Bearer <telescopic_api_key>

Response:
{
  "enabled": true,
  "triggerStage": "assessment",
  "apiKeyConfigured": true,
  "apiKeyPreview": "abc1...xyz9",
  "secretKeyConfigured": true,
  "webhookUrl": "https://..."
}
```

### Manual Sync

Push results for a specific assessment to Greenhouse:

```
POST /api/integrations/greenhouse/sync
Content-Type: application/json

{
  "assessmentId": "uuid"
}
```

### Bulk Sync

Sync all unsynced assessments for a company:

```
PUT /api/integrations/greenhouse/sync
Content-Type: application/json

{
  "companyId": "uuid"
}
```

### Webhook (Greenhouse → Telescopic)

```
POST /api/integrations/greenhouse/webhook?company_id=<uuid>
X-Greenhouse-Signature: sha256=<signature>

{
  "action": "candidate_stage_change",
  "payload": {
    "application": {...},
    "candidate": {...}
  }
}
```

## Database Schema

The integration adds/uses these fields:

### Companies Table
| Column | Type | Description |
|--------|------|-------------|
| `greenhouse_api_key` | text | Harvest API key |
| `greenhouse_secret_key` | text | Webhook signature secret |
| `greenhouse_trigger_stage` | text | Stage name that triggers assessment |
| `greenhouse_enabled` | boolean | Integration enabled/disabled |

### Assessments Table
| Column | Type | Description |
|--------|------|-------------|
| `ats_provider` | text | "greenhouse" |
| `ats_candidate_id` | text | Greenhouse candidate ID |
| `ats_application_id` | text | Greenhouse application ID |
| `ats_job_id` | text | Greenhouse job ID |
| `ats_webhook_sent` | boolean | Whether results were synced |
| `ats_webhook_sent_at` | timestamp | When results were synced |

## What Gets Pushed to Greenhouse

When an assessment is completed, a note is added to the candidate's activity feed:

```
## 🎯 Telescopic AI Literacy Assessment Results

**Candidate:** Jane Smith
**Overall Score:** 🟢 85/100

### Breakdown:
- **Prompt Quality:** 🟢 88/100
- **Context Usage:** 🟢 82/100
- **Iteration Skills:** 🟡 78/100
- **Efficiency:** 🟢 90/100

### Summary:
Jane demonstrated strong AI collaboration skills, particularly in crafting 
clear prompts and efficiently reaching solutions. Room for improvement in 
iterative refinement techniques.

---
⏱️ Duration: 12 minutes
🔗 [View Full Results](https://telescopic.app/results/xxx)
```

## Troubleshooting

### Webhook not firing
- Verify the webhook is enabled in Greenhouse
- Check the endpoint URL includes `?company_id=YOUR_ID`
- Verify the secret key matches

### Results not syncing
- Check `ats_candidate_id` is populated on the assessment
- Verify `greenhouse_api_key` is set for the company
- Check API key has `POST Candidates/Activity Feed/Notes` permission

### Invalid signature errors
- Ensure `greenhouse_secret_key` matches what's set in Greenhouse webhook
- Check for any whitespace in the secret key
