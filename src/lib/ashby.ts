/**
 * Ashby ATS API Client
 * Docs: https://developers.ashbyhq.com/reference
 */

const ASHBY_API_BASE = 'https://api.ashbyhq.com';

export interface AshbyConfig {
  apiKey: string;
}

export interface AshbyCandidate {
  id: string;
  name: string;
  primaryEmailAddress?: { value: string; type: string };
  phoneNumbers?: { value: string; type: string }[];
  createdAt: string;
}

export interface AshbyApplication {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  currentInterviewStage?: { id: string; name: string };
}

export interface AshbyJob {
  id: string;
  title: string;
  status: 'Open' | 'Closed' | 'Draft' | 'Archived';
  department?: { id: string; name: string };
  location?: { id: string; name: string };
}

export class AshbyClient {
  private apiKey: string;

  constructor(config: AshbyConfig) {
    this.apiKey = config.apiKey;
  }

  private getAuthHeader(): string {
    // Ashby uses Basic Auth with API key as username, blank password
    const credentials = Buffer.from(`${this.apiKey}:`).toString('base64');
    return `Basic ${credentials}`;
  }

  private async request<T>(
    endpoint: string,
    body: Record<string, unknown> = {}
  ): Promise<T> {
    const url = `${ASHBY_API_BASE}/${endpoint}`;

    const response = await fetch(url, {
      method: 'POST', // Ashby uses POST for all endpoints
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ashby API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Ashby API error: ${data.errors?.join(', ') || 'Unknown error'}`);
    }

    return data.results;
  }

  // ============ API Key Info ============

  async getApiKeyInfo(): Promise<{ permissions: string[] }> {
    return this.request('apiKey.info');
  }

  // ============ Candidates ============

  async getCandidate(candidateId: string): Promise<AshbyCandidate> {
    return this.request('candidate.info', { candidateId });
  }

  async searchCandidates(email: string): Promise<AshbyCandidate[]> {
    return this.request('candidate.search', { email });
  }

  async listCandidates(params?: { 
    cursor?: string; 
    perPage?: number;
    includeArchived?: boolean;
  }): Promise<{ results: AshbyCandidate[]; nextCursor?: string }> {
    return this.request('candidate.list', {
      cursor: params?.cursor,
      per_page: params?.perPage || 100,
      includeArchived: params?.includeArchived || false,
    });
  }

  async createCandidateNote(
    candidateId: string,
    note: string,
    sendNotification?: boolean
  ): Promise<void> {
    await this.request('candidate.createNote', {
      candidateId,
      note,
      sendNotification: sendNotification ?? false,
    });
  }

  // ============ Applications ============

  async getApplication(applicationId: string): Promise<AshbyApplication> {
    return this.request('application.info', { applicationId });
  }

  async listApplications(params?: {
    cursor?: string;
    perPage?: number;
    candidateId?: string;
    jobId?: string;
  }): Promise<{ results: AshbyApplication[]; nextCursor?: string }> {
    return this.request('application.list', {
      cursor: params?.cursor,
      per_page: params?.perPage || 100,
      candidateId: params?.candidateId,
      jobId: params?.jobId,
    });
  }

  async changeApplicationStage(
    applicationId: string,
    interviewStageId: string
  ): Promise<void> {
    await this.request('application.changeStage', {
      applicationId,
      interviewStageId,
    });
  }

  // ============ Jobs ============

  async getJob(jobId: string): Promise<AshbyJob> {
    return this.request('job.info', { jobId });
  }

  async listJobs(params?: {
    cursor?: string;
    perPage?: number;
    status?: 'Open' | 'Closed' | 'Draft' | 'Archived';
  }): Promise<{ results: AshbyJob[]; nextCursor?: string }> {
    return this.request('job.list', {
      cursor: params?.cursor,
      per_page: params?.perPage || 100,
      status: params?.status,
    });
  }

  // ============ Assessments ============

  /**
   * Add a completed assessment to a candidate
   * This is the primary method for Telescopic integration
   */
  async addCompletedAssessment(
    candidateId: string,
    assessment: {
      title: string;
      score?: number;
      maxScore?: number;
      result?: 'Passed' | 'Failed' | 'Completed';
      completedAt?: string;
      summaryHtml?: string;
      detailsHtml?: string;
      linkUrl?: string;
      linkText?: string;
    }
  ): Promise<void> {
    await this.request('assessment.addCompletedToCandidate', {
      candidateId,
      title: assessment.title,
      score: assessment.score,
      maxScore: assessment.maxScore,
      result: assessment.result,
      completedAt: assessment.completedAt || new Date().toISOString(),
      summaryHtml: assessment.summaryHtml,
      detailsHtml: assessment.detailsHtml,
      linkUrl: assessment.linkUrl,
      linkText: assessment.linkText,
    });
  }

  /**
   * Push Telescopic assessment results to Ashby
   */
  async pushAssessmentResults(
    candidateId: string,
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

    const summaryHtml = `
      <p><strong>Overall Score:</strong> ${scoreEmoji(assessment.overallScore)} ${assessment.overallScore}/100</p>
      <p>${assessment.summary || 'Assessment completed.'}</p>
    `;

    const detailsHtml = `
      <h4>Score Breakdown</h4>
      <ul>
        <li><strong>Prompt Quality:</strong> ${scoreEmoji(assessment.promptQualityScore)} ${assessment.promptQualityScore}/100</li>
        <li><strong>Context Usage:</strong> ${scoreEmoji(assessment.contextScore)} ${assessment.contextScore}/100</li>
        <li><strong>Iteration Skills:</strong> ${scoreEmoji(assessment.iterationScore)} ${assessment.iterationScore}/100</li>
        <li><strong>Efficiency:</strong> ${scoreEmoji(assessment.efficiencyScore)} ${assessment.efficiencyScore}/100</li>
      </ul>
      <p><strong>Duration:</strong> ${Math.round(assessment.duration / 60)} minutes</p>
    `;

    await this.addCompletedAssessment(candidateId, {
      title: 'Telescopic AI Literacy Assessment',
      score: assessment.overallScore,
      maxScore: 100,
      result: assessment.overallScore >= 60 ? 'Passed' : 'Failed',
      summaryHtml,
      detailsHtml,
      linkUrl: assessment.assessmentUrl,
      linkText: 'View Full Results',
    });
  }

  // ============ Connection Test ============

  async testConnection(): Promise<boolean> {
    try {
      await this.getApiKeyInfo();
      return true;
    } catch {
      return false;
    }
  }
}

// ============ Webhook Verification ============

export function verifyAshbyWebhook(
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
    Buffer.from(expectedSignature)
  );
}

// ============ Webhook Event Types ============

export type AshbyWebhookEvent =
  | 'applicationSubmitted'
  | 'applicationStageChanged'
  | 'candidateHired'
  | 'candidateArchived'
  | 'jobOpened'
  | 'jobClosed';

export interface AshbyWebhookPayload {
  eventType: AshbyWebhookEvent;
  data: {
    application?: AshbyApplication;
    candidate?: AshbyCandidate;
    job?: AshbyJob;
  };
}
