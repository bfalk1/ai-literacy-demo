/**
 * Lever ATS API Client
 * Docs: https://hire.lever.co/developer/documentation
 */

const LEVER_API_BASE = 'https://api.lever.co/v1';

export interface LeverConfig {
  apiKey: string;
}

export interface LeverOpportunity {
  id: string;
  name: string;
  contact: string;
  headline: string;
  stage: string;
  stageChanges: { toStageId: string; updatedAt: number }[];
  emails: string[];
  phones: { value: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface LeverStage {
  id: string;
  text: string;
}

export interface LeverPosting {
  id: string;
  text: string;
  state: 'published' | 'internal' | 'closed' | 'draft' | 'pending';
  categories: {
    team?: string;
    department?: string;
    location?: string;
  };
}

export class LeverClient {
  private apiKey: string;

  constructor(config: LeverConfig) {
    this.apiKey = config.apiKey;
  }

  private getAuthHeader(): string {
    // Lever uses Basic Auth with API key as username, blank password
    const credentials = Buffer.from(`${this.apiKey}:`).toString('base64');
    return `Basic ${credentials}`;
  }

  private async request<T>(
    endpoint: string,
    options: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> } = {}
  ): Promise<T> {
    const url = `${LEVER_API_BASE}${endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': this.getAuthHeader(),
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Lever API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============ Opportunities (Candidates in a pipeline) ============

  async getOpportunity(opportunityId: string): Promise<LeverOpportunity> {
    return this.request(`/opportunities/${opportunityId}?expand=stage&expand=contact`);
  }

  async listOpportunities(params?: {
    limit?: number;
    offset?: string;
    stage_id?: string;
    posting_id?: string;
  }): Promise<{ data: LeverOpportunity[]; hasNext: boolean; next?: string }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset);
    if (params?.stage_id) searchParams.set('stage_id', params.stage_id);
    if (params?.posting_id) searchParams.set('posting_id', params.posting_id);
    
    const query = searchParams.toString();
    return this.request(`/opportunities${query ? `?${query}` : ''}`);
  }

  // ============ Stages ============

  async listStages(): Promise<LeverStage[]> {
    return this.request('/stages');
  }

  async getStage(stageId: string): Promise<LeverStage> {
    return this.request(`/stages/${stageId}`);
  }

  // ============ Postings (Jobs) ============

  async listPostings(params?: {
    state?: 'published' | 'internal' | 'closed' | 'draft' | 'pending';
    limit?: number;
  }): Promise<LeverPosting[]> {
    const searchParams = new URLSearchParams();
    if (params?.state) searchParams.set('state', params.state);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/postings${query ? `?${query}` : ''}`);
  }

  // ============ Notes ============

  async addNote(
    opportunityId: string,
    note: string,
    notifyFollowers?: boolean
  ): Promise<void> {
    await this.request(`/opportunities/${opportunityId}/notes`, {
      method: 'POST',
      body: JSON.stringify({
        value: note,
        notifyFollowers: notifyFollowers ?? false,
      }),
    });
  }

  // ============ Assessment Results ============

  /**
   * Push Telescopic assessment results to Lever as a note
   */
  async pushAssessmentResults(
    opportunityId: string,
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

    const note = `## 🎯 Telescopic AI Literacy Assessment Results

**Candidate:** ${assessment.candidateName}
**Overall Score:** ${scoreEmoji(assessment.overallScore)} ${assessment.overallScore}/100

### Breakdown:
- **Prompt Quality:** ${scoreEmoji(assessment.promptQualityScore)} ${assessment.promptQualityScore}/100
- **Context Usage:** ${scoreEmoji(assessment.contextScore)} ${assessment.contextScore}/100
- **Iteration Skills:** ${scoreEmoji(assessment.iterationScore)} ${assessment.iterationScore}/100
- **Efficiency:** ${scoreEmoji(assessment.efficiencyScore)} ${assessment.efficiencyScore}/100

### Summary:
${assessment.summary || 'Assessment completed.'}

---
⏱️ Duration: ${Math.round(assessment.duration / 60)} minutes
${assessment.assessmentUrl ? `🔗 View Full Results: ${assessment.assessmentUrl}` : ''}`.trim();

    await this.addNote(opportunityId, note, false);
  }

  // ============ Connection Test ============

  async testConnection(): Promise<boolean> {
    try {
      await this.listStages();
      return true;
    } catch {
      return false;
    }
  }
}

// ============ Webhook Verification ============

export function verifyLeverWebhook(
  signature: string,
  token: string,
  signingToken: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', signingToken)
    .update(token)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ============ Webhook Event Types ============

export interface LeverWebhookPayload {
  triggeredAt: number;
  event: 'candidateStageChange' | 'candidateHired' | 'candidateArchiveChange';
  signature: string;
  token: string;
  data: {
    opportunityId: string;
    candidateId: string;
    contactId?: string;
    toStageId?: string;
    fromStageId?: string;
    toArchived?: { archivedAt: number; reason: string } | null;
  };
}
