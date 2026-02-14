/**
 * Greenhouse Harvest API Client
 * Docs: https://developers.greenhouse.io/harvest.html
 */

const GREENHOUSE_API_BASE = 'https://harvest.greenhouse.io/v1';

export interface GreenhouseConfig {
  apiKey: string;
}

export interface GreenhouseCandidate {
  id: number;
  first_name: string;
  last_name: string;
  emails: { value: string; type: string }[];
  phone_numbers: { value: string; type: string }[];
  applications: GreenhouseApplication[];
}

export interface GreenhouseApplication {
  id: number;
  candidate_id: number;
  job_id: number;
  status: string;
  current_stage: { id: number; name: string } | null;
}

export interface GreenhouseJob {
  id: number;
  name: string;
  status: string;
  departments: { id: number; name: string }[];
  offices: { id: number; name: string }[];
}

export class GreenhouseClient {
  private apiKey: string;

  constructor(config: GreenhouseConfig) {
    this.apiKey = config.apiKey;
  }

  private getAuthHeader(): string {
    // Greenhouse uses Basic Auth with API key as username, blank password
    const credentials = Buffer.from(`${this.apiKey}:`).toString('base64');
    return `Basic ${credentials}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${GREENHOUSE_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        'On-Behalf-Of': options.headers?.['On-Behalf-Of'] || '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Greenhouse API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  // ============ Candidates ============

  async getCandidate(candidateId: number): Promise<GreenhouseCandidate> {
    return this.request(`/candidates/${candidateId}`);
  }

  async getCandidateByEmail(email: string): Promise<GreenhouseCandidate | null> {
    const candidates = await this.request<GreenhouseCandidate[]>(
      `/candidates?email=${encodeURIComponent(email)}`
    );
    return candidates[0] || null;
  }

  // ============ Applications ============

  async getApplication(applicationId: number): Promise<GreenhouseApplication> {
    return this.request(`/applications/${applicationId}`);
  }

  async advanceApplication(applicationId: number, fromStageId?: number): Promise<void> {
    await this.request(`/applications/${applicationId}/advance`, {
      method: 'POST',
      body: JSON.stringify({ from_stage_id: fromStageId }),
    });
  }

  async rejectApplication(
    applicationId: number, 
    rejectionReasonId?: number,
    notes?: string
  ): Promise<void> {
    await this.request(`/applications/${applicationId}/reject`, {
      method: 'POST',
      body: JSON.stringify({
        rejection_reason_id: rejectionReasonId,
        notes,
      }),
    });
  }

  // ============ Jobs ============

  async getJob(jobId: number): Promise<GreenhouseJob> {
    return this.request(`/jobs/${jobId}`);
  }

  async listJobs(status: 'open' | 'closed' | 'draft' = 'open'): Promise<GreenhouseJob[]> {
    return this.request(`/jobs?status=${status}`);
  }

  // ============ Notes & Attachments ============

  async addNote(
    candidateId: number,
    note: string,
    visibility: 'admin_only' | 'private' | 'public' = 'public',
    userId?: number
  ): Promise<void> {
    await this.request(`/candidates/${candidateId}/activity_feed/notes`, {
      method: 'POST',
      headers: userId ? { 'On-Behalf-Of': String(userId) } : {},
      body: JSON.stringify({
        body: note,
        visibility,
      }),
    });
  }

  async addAttachment(
    candidateId: number,
    filename: string,
    content: string, // base64 encoded
    contentType: string,
    type: 'resume' | 'cover_letter' | 'admin_only' | 'take_home_test' | 'offer_packet' | 'other' = 'other'
  ): Promise<void> {
    await this.request(`/candidates/${candidateId}/attachments`, {
      method: 'POST',
      body: JSON.stringify({
        filename,
        type,
        content,
        content_type: contentType,
      }),
    });
  }

  // ============ Assessment Results ============

  /**
   * Push Telescopic assessment results to Greenhouse
   */
  async pushAssessmentResults(
    candidateId: number,
    assessment: {
      candidateName: string;
      overallScore: number;
      promptQualityScore: number;
      contextScore: number;
      iterationScore: number;
      efficiencyScore: number;
      summary: string;
      assessmentUrl?: string;
      duration: number;
    }
  ): Promise<void> {
    const scoreEmoji = (score: number) => {
      if (score >= 80) return '🟢';
      if (score >= 60) return '🟡';
      return '🔴';
    };

    const note = `
## 🎯 Telescopic AI Literacy Assessment Results

**Candidate:** ${assessment.candidateName}
**Overall Score:** ${scoreEmoji(assessment.overallScore)} ${assessment.overallScore}/100

### Breakdown:
- **Prompt Quality:** ${scoreEmoji(assessment.promptQualityScore)} ${assessment.promptQualityScore}/100
- **Context Usage:** ${scoreEmoji(assessment.contextScore)} ${assessment.contextScore}/100
- **Iteration Skills:** ${scoreEmoji(assessment.iterationScore)} ${assessment.iterationScore}/100
- **Efficiency:** ${scoreEmoji(assessment.efficiencyScore)} ${assessment.efficiencyScore}/100

### Summary:
${assessment.summary || 'No summary available.'}

---
⏱️ Duration: ${Math.round(assessment.duration / 60)} minutes
${assessment.assessmentUrl ? `🔗 [View Full Results](${assessment.assessmentUrl})` : ''}
    `.trim();

    await this.addNote(candidateId, note);
  }
}

// ============ Webhook Verification ============

export function verifyGreenhouseWebhook(
  signature: string,
  payload: string,
  secretKey: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}

// ============ Webhook Event Types ============

export interface GreenhouseWebhookEvent {
  action: string;
  payload: {
    application?: {
      id: number;
      candidate_id: number;
      job_id: number;
      current_stage?: { id: number; name: string };
    };
    candidate?: {
      id: number;
      first_name: string;
      last_name: string;
      email_addresses: { value: string; type: string }[];
    };
  };
}
