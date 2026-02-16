// Assessment Types & Industry Definitions

export type EnvironmentType = 
  | 'code'           // Terminal + code editor
  | 'spreadsheet'    // Excel/Sheets-like grid
  | 'document'       // Rich text editor
  | 'slides'         // Presentation builder
  | 'email'          // Email client interface
  | 'database'       // SQL query interface
  | 'canvas'         // Design/whiteboard
  | 'crm'            // CRM records interface
  | 'project-board'  // Kanban/task board
  | 'form-builder';  // Form/survey builder

export interface AssessmentType {
  id: string;
  name: string;
  industry: string;
  environment: EnvironmentType;
  description: string;
  icon: string;
  taskTemplate: string;
  systemPrompt: string;
  initialState: Record<string, unknown>;
}

// Environment action types - what the chat can do to each environment
export interface EnvironmentAction {
  type: string;
  [key: string]: unknown;
}

// Code environment actions
export interface CodeAction extends EnvironmentAction {
  type: 'writeFile' | 'deleteFile' | 'runCommand' | 'openFile' | 'highlight';
  path?: string;
  content?: string;
  command?: string;
  line?: number;
}

// Spreadsheet environment actions
export interface SpreadsheetAction extends EnvironmentAction {
  type: 'setCellValue' | 'setCellFormula' | 'formatCell' | 'addRow' | 'addColumn' | 'deleteRow' | 'deleteColumn' | 'highlight';
  cell?: string;
  range?: string;
  value?: string | number;
  formula?: string;
  format?: Record<string, unknown>;
}

// Document environment actions
export interface DocumentAction extends EnvironmentAction {
  type: 'insertText' | 'replaceText' | 'deleteText' | 'formatText' | 'addComment' | 'highlight';
  position?: number;
  text?: string;
  format?: Record<string, unknown>;
  comment?: string;
}

// Slides environment actions
export interface SlidesAction extends EnvironmentAction {
  type: 'addSlide' | 'deleteSlide' | 'editSlide' | 'addElement' | 'editElement' | 'reorderSlides';
  slideIndex?: number;
  element?: Record<string, unknown>;
  content?: string;
}

// Email environment actions
export interface EmailAction extends EnvironmentAction {
  type: 'draft' | 'editSubject' | 'editBody' | 'addRecipient' | 'addAttachment' | 'reply' | 'forward';
  to?: string[];
  cc?: string[];
  subject?: string;
  body?: string;
}

// Database environment actions
export interface DatabaseAction extends EnvironmentAction {
  type: 'runQuery' | 'explainQuery' | 'showSchema' | 'highlight';
  query?: string;
  table?: string;
}

// Canvas environment actions
export interface CanvasAction extends EnvironmentAction {
  type: 'addShape' | 'addText' | 'addImage' | 'moveElement' | 'resizeElement' | 'deleteElement' | 'group';
  elementId?: string;
  shape?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  content?: string;
}

// CRM environment actions
export interface CRMAction extends EnvironmentAction {
  type: 'createRecord' | 'updateRecord' | 'addNote' | 'logActivity' | 'updateStage' | 'addTask';
  recordType?: 'contact' | 'company' | 'deal' | 'ticket';
  recordId?: string;
  fields?: Record<string, unknown>;
  note?: string;
}

// Project board environment actions
export interface ProjectBoardAction extends EnvironmentAction {
  type: 'createTask' | 'moveTask' | 'editTask' | 'addComment' | 'assignUser' | 'setDueDate' | 'createColumn';
  taskId?: string;
  column?: string;
  title?: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
}

// Form builder environment actions
export interface FormBuilderAction extends EnvironmentAction {
  type: 'addField' | 'editField' | 'deleteField' | 'reorderFields' | 'setValidation' | 'addSection';
  fieldId?: string;
  fieldType?: 'text' | 'number' | 'email' | 'select' | 'multiselect' | 'date' | 'file' | 'rating';
  label?: string;
  options?: string[];
  required?: boolean;
  validation?: Record<string, unknown>;
}

// ============================================
// ASSESSMENT TYPE DEFINITIONS BY INDUSTRY
// ============================================

export const ASSESSMENT_TYPES: AssessmentType[] = [
  // TECHNOLOGY / ENGINEERING
  {
    id: 'backend-engineer',
    name: 'Backend Engineering',
    industry: 'Technology',
    environment: 'code',
    icon: '⚙️',
    description: 'Build and debug backend services with AI assistance',
    taskTemplate: 'Implement a rate-limited API endpoint that handles concurrent requests safely. The endpoint should limit each user to 100 requests per minute.',
    systemPrompt: `You are an AI pair programmer. Help the candidate write code, but don't do everything for them.
- If they give vague instructions, write generic code that needs refinement
- If they provide specifics (edge cases, constraints), incorporate them
- Ask clarifying questions when requirements are ambiguous
- Point out potential issues only if they ask for review`,
    initialState: {
      files: {
        'src/index.ts': `import express from 'express';
import { RateLimiter } from './rateLimiter';
import { UserService } from './services/userService';

const app = express();
app.use(express.json());

// TODO: Implement rate limiting middleware
// Requirements:
// - 100 requests per minute per user
// - Return 429 when limit exceeded
// - Include X-RateLimit-Remaining header

app.get('/api/data', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  
  // TODO: Check rate limit before processing
  
  const data = await UserService.getData(userId);
  res.json(data);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
`,
        'src/rateLimiter.ts': `// Implement your rate limiter here
// 
// Consider:
// - How to track request counts per user
// - How to handle the sliding window
// - Thread safety for concurrent requests
// - Memory management for tracking data

export class RateLimiter {
  constructor(private maxRequests: number, private windowMs: number) {
    // TODO: Initialize rate limiter
  }

  async isAllowed(userId: string): Promise<boolean> {
    // TODO: Implement rate limiting logic
    throw new Error('Not implemented');
  }

  async getRemainingRequests(userId: string): Promise<number> {
    // TODO: Return remaining requests in current window
    throw new Error('Not implemented');
  }
}
`,
        'src/services/userService.ts': `// This service is provided - do not modify
export class UserService {
  static async getData(userId: string): Promise<{ id: string; data: string }> {
    // Simulates a database call with 50ms latency
    await new Promise(resolve => setTimeout(resolve, 50));
    return { id: userId, data: 'User data here' };
  }
}
`,
        'tests/rateLimiter.test.ts': `import { RateLimiter } from '../src/rateLimiter';

describe('RateLimiter', () => {
  it('should allow requests under the limit', async () => {
    // TODO: Test that requests under 100/min are allowed
  });

  it('should block requests over the limit', async () => {
    // TODO: Test that request 101 is blocked
  });

  it('should reset after the window expires', async () => {
    // TODO: Test that limits reset after 1 minute
  });

  it('should handle concurrent requests correctly', async () => {
    // TODO: Test that concurrent requests don't cause race conditions
  });
});
`,
      },
      openFile: 'src/rateLimiter.ts',
    },
  },
  {
    id: 'frontend-engineer',
    name: 'Frontend Engineering',
    industry: 'Technology',
    environment: 'code',
    icon: '🎨',
    description: 'Build UI components with AI assistance',
    taskTemplate: 'Create a responsive data table component with sorting and filtering. The table should handle 1000+ rows efficiently.',
    systemPrompt: `You are an AI pair programmer specializing in frontend development.
- Help with React/Vue/component architecture
- If instructions are vague, create basic implementations
- Consider accessibility and responsive design when prompted`,
    initialState: {
      files: {
        'src/components/DataTable.tsx': `import React, { useState, useMemo } from 'react';
import './DataTable.css';

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

// TODO: Implement the DataTable component
// Requirements:
// 1. Sortable columns (click header to sort asc/desc)
// 2. Filterable columns (text input above each column)
// 3. Pagination (handle 1000+ rows efficiently)
// 4. Responsive design (stack on mobile)
// 5. Accessible (keyboard navigation, screen reader support)

export function DataTable<T extends Record<string, unknown>>({ 
  data, 
  columns, 
  pageSize = 20 
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{key: keyof T; direction: 'asc' | 'desc'} | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // TODO: Implement sorting logic
  const sortedData = useMemo(() => {
    return data; // Replace with sorted data
  }, [data, sortConfig]);

  // TODO: Implement filtering logic
  const filteredData = useMemo(() => {
    return sortedData; // Replace with filtered data
  }, [sortedData, filters]);

  // TODO: Implement pagination
  const paginatedData = useMemo(() => {
    return filteredData; // Replace with paginated data
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="data-table-container">
      {/* TODO: Implement table UI */}
      <p>Implement DataTable here</p>
    </div>
  );
}
`,
        'src/components/DataTable.css': `/* DataTable Styles */

.data-table-container {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.data-table th:hover {
  background: #f3f4f6;
}

/* TODO: Add styles for:
   - Sort indicators
   - Filter inputs
   - Pagination controls
   - Mobile responsive layout
   - Loading state
   - Empty state
*/

@media (max-width: 768px) {
  /* TODO: Mobile styles - consider stacking rows */
}
`,
        'src/App.tsx': `import React from 'react';
import { DataTable } from './components/DataTable';

// Sample data for testing
const sampleData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: \`User \${i + 1}\`,
  email: \`user\${i + 1}@example.com\`,
  role: ['Admin', 'Editor', 'Viewer'][i % 3],
  status: ['Active', 'Inactive'][i % 2],
  createdAt: new Date(2024, 0, (i % 28) + 1).toISOString(),
}));

const columns = [
  { key: 'id' as const, header: 'ID', sortable: true },
  { key: 'name' as const, header: 'Name', sortable: true, filterable: true },
  { key: 'email' as const, header: 'Email', sortable: true, filterable: true },
  { key: 'role' as const, header: 'Role', sortable: true, filterable: true },
  { key: 'status' as const, header: 'Status', sortable: true },
  { key: 'createdAt' as const, header: 'Created', sortable: true },
];

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>User Management</h1>
      <DataTable data={sampleData} columns={columns} pageSize={10} />
    </div>
  );
}
`,
      },
      openFile: 'src/components/DataTable.tsx',
    },
  },
  {
    id: 'data-engineer',
    name: 'Data Engineering',
    industry: 'Technology',
    environment: 'database',
    icon: '🗄️',
    description: 'Write and optimize SQL queries with AI assistance',
    taskTemplate: 'Write a query to identify customers at risk of churn based on activity patterns. Define churn risk as: no orders in 60 days AND declining login frequency.',
    systemPrompt: `You are an AI assistant for SQL and data analysis.
- Help write queries but let them think through the logic
- If they ask for "the query," give a basic version that may need optimization
- Explain query plans only when asked
- Point out performance issues only if they ask for review`,
    initialState: {
      schema: {
        users: ['id (PK)', 'email', 'name', 'plan_type', 'created_at', 'last_login'],
        orders: ['id (PK)', 'user_id (FK)', 'amount', 'status', 'created_at'],
        events: ['id (PK)', 'user_id (FK)', 'event_type', 'properties', 'timestamp'],
        subscriptions: ['id (PK)', 'user_id (FK)', 'plan', 'status', 'started_at', 'cancelled_at'],
      },
      sampleData: true,
    },
  },

  // FINANCE / ACCOUNTING
  {
    id: 'financial-analyst',
    name: 'Financial Analysis',
    industry: 'Finance',
    environment: 'spreadsheet',
    icon: '📊',
    description: 'Build financial models with AI assistance',
    taskTemplate: 'Create a 3-year revenue projection model with sensitivity analysis. Use the historical data provided to build your assumptions.',
    systemPrompt: `You are an AI assistant for financial modeling.
- Help build formulas and models but let them structure the approach
- If they say "create the model," build a basic template that needs customization
- Don't volunteer assumptions - let them specify
- Point out modeling errors only if asked to review`,
    initialState: {
      sheets: ['Model', 'Assumptions', 'Output'],
      activeSheet: 'Model',
      data: {
        A1: 'Revenue Projection Model', B1: '', C1: '', D1: '', E1: '',
        A2: '($ in thousands)', B2: '', C2: '', D2: '', E2: '',
        A3: '', B3: '', C3: '', D3: '', E3: '',
        A4: 'Historical Data', B4: '2022', C4: '2023', D4: '2024', E4: '',
        A5: 'Revenue', B5: '2,450', C5: '3,120', D5: '3,890', E5: '',
        A6: 'Growth Rate', B6: '', C6: '27.3%', D6: '24.7%', E6: '',
        A7: 'Customers', B7: '145', C7: '203', D7: '276', E7: '',
        A8: 'Avg Revenue/Customer', B8: '16.9', C8: '15.4', D8: '14.1', E8: '',
        A9: '', B9: '', C9: '', D9: '', E9: '',
        A10: 'Projections', B10: '2025', C10: '2026', D10: '2027', E10: '',
        A11: 'Revenue', B11: '', C11: '', D11: '', E11: '',
        A12: 'Growth Rate', B12: '', C12: '', D12: '', E12: '',
        A13: 'Customers', B13: '', C13: '', D13: '', E13: '',
        A14: 'Avg Revenue/Customer', B14: '', C14: '', D14: '', E14: '',
        A15: '', B15: '', C15: '', D15: '', E15: '',
        A16: 'Key Assumptions:', B16: '', C16: '', D16: '', E16: '',
        A17: '- Customer growth rate:', B17: '[INPUT]', C17: '', D17: '', E17: '',
        A18: '- Pricing change:', B18: '[INPUT]', C18: '', D18: '', E18: '',
        A19: '- Churn rate:', B19: '[INPUT]', C19: '', D19: '', E19: '',
      },
    },
  },
  {
    id: 'accountant',
    name: 'Accounting',
    industry: 'Finance',
    environment: 'spreadsheet',
    icon: '🧮',
    description: 'Reconcile accounts and prepare reports with AI assistance',
    taskTemplate: 'Reconcile the bank statement with the general ledger and identify the 3 discrepancies. Document each discrepancy and recommend how to resolve it.',
    systemPrompt: `You are an AI assistant for accounting tasks.
- Help with reconciliation, formulas, and formatting
- If instructions are vague, create basic structures
- Let them identify discrepancies themselves
- Explain accounting principles only when asked`,
    initialState: {
      sheets: ['Bank Statement', 'General Ledger', 'Reconciliation'],
      activeSheet: 'Bank Statement',
      data: {
        A1: 'First National Bank - Account Statement', B1: '', C1: '', D1: '',
        A2: 'Account: 4521-7890 | Period: January 2025', B2: '', C2: '', D2: '',
        A3: '', B3: '', C3: '', D3: '',
        A4: 'Date', B4: 'Description', C4: 'Amount', D4: 'Balance',
        A5: '01/02', B5: 'Opening Balance', C5: '', D5: '24,500.00',
        A6: '01/03', B6: 'Check #1042', C6: '-1,200.00', D6: '23,300.00',
        A7: '01/05', B7: 'Wire Transfer - Client ABC', C7: '5,000.00', D7: '28,300.00',
        A8: '01/08', B8: 'ACH - Payroll', C8: '-8,450.00', D8: '19,850.00',
        A9: '01/10', B9: 'Check #1043', C9: '-750.00', D9: '19,100.00',
        A10: '01/12', B10: 'Deposit', C10: '3,200.00', D10: '22,300.00',
        A11: '01/15', B11: 'Wire Transfer - Client XYZ', C11: '7,500.00', D11: '29,800.00',
        A12: '01/18', B12: 'Check #1045', C12: '-2,100.00', D12: '27,700.00',
        A13: '01/22', B13: 'Bank Fee', C13: '-35.00', D13: '27,665.00',
        A14: '01/25', B14: 'ACH - Rent', C14: '-4,500.00', D14: '23,165.00',
        A15: '01/28', B15: 'Deposit', C15: '2,800.00', D15: '25,965.00',
        A16: '01/31', B16: 'Interest', C16: '12.50', D16: '25,977.50',
        A17: '', B17: '', C17: '', D17: '',
        A18: 'Ending Balance:', B18: '', C18: '', D18: '25,977.50',
      },
    },
  },
  {
    id: 'investment-analyst',
    name: 'Investment Analysis',
    industry: 'Finance',
    environment: 'spreadsheet',
    icon: '📈',
    description: 'Analyze investments and build valuation models',
    taskTemplate: 'Build a DCF model to value CloudTech Inc using the provided financials. Determine a fair value per share and provide your investment recommendation.',
    systemPrompt: `You are an AI assistant for investment analysis.
- Help with valuation models and financial analysis
- Let them drive assumptions and methodology
- Create basic templates when asked, but require their input for specifics`,
    initialState: {
      sheets: ['Company Data', 'DCF Model', 'Sensitivity'],
      activeSheet: 'Company Data',
      data: {
        A1: 'CloudTech Inc - Financial Summary', B1: '', C1: '', D1: '', E1: '',
        A2: '($ in millions, except per share)', B2: '', C2: '', D2: '', E2: '',
        A3: '', B3: '', C3: '', D3: '', E3: '',
        A4: 'Income Statement', B4: '2022', C4: '2023', D4: '2024', E4: 'Notes',
        A5: 'Revenue', B5: '156.2', C5: '198.4', D5: '247.3', E5: '',
        A6: 'Cost of Revenue', B6: '48.4', C6: '59.5', D6: '71.7', E6: '~29% of rev',
        A7: 'Gross Profit', B7: '107.8', C7: '138.9', D7: '175.6', E7: '',
        A8: 'Operating Expenses', B8: '89.2', C8: '105.6', D8: '124.8', E8: '',
        A9: 'Operating Income', B9: '18.6', C9: '33.3', D9: '50.8', E9: '',
        A10: 'Net Income', B10: '14.2', C10: '25.4', D10: '38.7', E10: '',
        A11: '', B11: '', C11: '', D11: '', E11: '',
        A12: 'Cash Flow', B12: '2022', C12: '2023', D12: '2024', E12: '',
        A13: 'Operating Cash Flow', B13: '22.1', C13: '38.5', D13: '56.2', E13: '',
        A14: 'CapEx', B14: '-8.3', C14: '-12.1', D14: '-15.8', E14: '',
        A15: 'Free Cash Flow', B15: '13.8', C15: '26.4', D15: '40.4', E15: '',
        A16: '', B16: '', C16: '', D16: '', E16: '',
        A17: 'Other Data', B17: '', C17: '', D17: '', E17: '',
        A18: 'Shares Outstanding', B18: '42.5M', C18: '', D18: '', E18: '',
        A19: 'Current Stock Price', B19: '$45.20', C19: '', D19: '', E19: '',
        A20: 'Market Cap', B20: '$1.92B', C20: '', D20: '', E20: '',
        A21: 'Net Debt', B21: '-$28.4M', C21: '', D21: '', E21: 'Net cash position',
        A22: 'Beta', B22: '1.35', C22: '', D22: '', E22: '',
      },
    },
  },

  // MARKETING / CONTENT
  {
    id: 'content-writer',
    name: 'Content Writing',
    industry: 'Marketing',
    environment: 'document',
    icon: '✍️',
    description: 'Create and refine content with AI assistance',
    taskTemplate: 'Write a blog post about AI in healthcare that drives organic traffic. Target keyword: "AI healthcare applications". Aim for 1,200-1,500 words.',
    systemPrompt: `You are an AI writing assistant.
- Help draft and refine content but don't produce polished work immediately
- If they say "write the post," create a generic first draft
- Incorporate their feedback and specifics when provided
- Let them guide tone, structure, and key messages`,
    initialState: {
      content: `CONTENT BRIEF

Target Keyword: "AI healthcare applications"
Word Count: 1,200-1,500 words
Audience: Healthcare administrators, IT decision-makers
Goal: Drive organic traffic, establish thought leadership

COMPETITOR ANALYSIS:
- Top 3 ranking articles focus on: diagnostics, admin efficiency, patient care
- Gap opportunity: Real implementation challenges and ROI data

SUGGESTED OUTLINE:
1. Hook: Start with a compelling statistic or scenario
2. Current State: Where AI is being used today
3. Key Applications: 3-4 specific use cases with examples
4. Implementation Challenges: What organizations face
5. ROI & Results: Data from real implementations
6. Future Outlook: Where this is heading
7. CTA: What readers should do next

NOTES FROM EDITOR:
- Include at least 2 real case studies/examples
- Add expert quotes if possible
- Keep paragraphs short for scannability
- Include a compelling meta description

---

[Start writing your article below]

`,
      title: 'AI Healthcare Applications: [Your Headline Here]',
    },
  },
  {
    id: 'marketing-manager',
    name: 'Marketing Strategy',
    industry: 'Marketing',
    environment: 'slides',
    icon: '📣',
    description: 'Build marketing presentations with AI assistance',
    taskTemplate: 'Create a go-to-market strategy presentation for launching "FlowMetrics" - an analytics dashboard for e-commerce. Target: mid-market retailers ($10M-$100M revenue).',
    systemPrompt: `You are an AI assistant for marketing presentations.
- Help structure and create slides
- If they're vague, create generic slides that need customization
- Let them define messaging, positioning, and strategy`,
    initialState: {
      slides: [
        { 
          id: '1',
          title: 'FlowMetrics GTM Strategy', 
          content: 'Go-to-Market Plan\nQ2 2025 Launch\n\n[Your Name]\nMarketing Lead' 
        },
        { 
          id: '2',
          title: 'Product Overview', 
          content: 'FlowMetrics: Real-time e-commerce analytics\n\n• Unified dashboard for all sales channels\n• AI-powered inventory predictions\n• Customer behavior insights\n• Pricing: $299-$899/month based on GMV\n\nCurrent Status: Beta with 12 pilot customers' 
        },
        { 
          id: '3',
          title: 'Target Market', 
          content: 'Define your ICP:\n\n• Company size/revenue?\n• Industry vertical focus?\n• Geographic priority?\n• Key pain points we solve?\n• Decision maker persona?' 
        },
        { 
          id: '4',
          title: 'Competitive Landscape', 
          content: 'How do we differentiate?\n\n[Add competitor analysis]\n[Define unique value prop]\n[Position against alternatives]' 
        },
        { 
          id: '5',
          title: 'GTM Channels', 
          content: 'Which channels will we prioritize?\n\n• Paid acquisition?\n• Content/SEO?\n• Partnerships?\n• Sales-led vs product-led?\n• Events/conferences?' 
        },
        { 
          id: '6',
          title: 'Launch Timeline', 
          content: '[Build out 90-day launch plan]\n\nPhase 1: ...\nPhase 2: ...\nPhase 3: ...' 
        },
        { 
          id: '7',
          title: 'Success Metrics', 
          content: 'How will we measure success?\n\n• Pipeline generated?\n• Customers acquired?\n• Revenue target?\n• CAC/LTV goals?' 
        },
      ],
      activeSlide: 0,
    },
  },

  // SALES
  {
    id: 'sales-rep',
    name: 'Sales',
    industry: 'Sales',
    environment: 'email',
    icon: '🤝',
    description: 'Craft outreach and manage deals with AI assistance',
    taskTemplate: 'Write a follow-up sequence for Sarah Chen (VP Ops at Meridian Logistics) who went cold after a demo 2 weeks ago. She was interested but mentioned budget timing concerns.',
    systemPrompt: `You are an AI sales assistant.
- Help craft emails and outreach
- If they say "write the email," create something generic
- Incorporate context about the prospect when provided
- Let them drive the sales strategy`,
    initialState: {
      inbox: [
        {
          id: '1',
          from: 'sarah.chen@meridianlogistics.com',
          to: ['you@company.com'],
          subject: 'Re: Meridian x [Your Company] - Next Steps',
          body: `Thanks for the demo last week. The team was impressed with the routing optimization features.

I need to be honest - we're in the middle of our Q1 budget cycle and any new vendor spend needs to wait until Q2 starts (April 1). 

Can we reconnect then?

Sarah Chen
VP Operations | Meridian Logistics
`,
          timestamp: '2 weeks ago',
          read: true,
        },
        {
          id: '2',
          from: 'notifications@crm.com',
          to: ['you@company.com'],
          subject: 'Deal Alert: Meridian Logistics',
          body: `DEAL UPDATE

Company: Meridian Logistics
Contact: Sarah Chen (VP Ops)
Deal Size: $48,000/year
Stage: Demo Completed → Stalled

Notes from demo:
- 3 decision makers attended (Sarah, CFO, IT Director)
- Strong interest in routing optimization
- Pain point: current system causing 12% delivery delays
- Timeline concern: budget freeze until Q2

Competitors in evaluation: None identified

Next action needed: Re-engagement strategy`,
          timestamp: '1 week ago',
          read: true,
        },
      ],
      drafts: [],
      currentDraft: null,
    },
  },
  {
    id: 'account-executive',
    name: 'Account Management',
    industry: 'Sales',
    environment: 'crm',
    icon: '💼',
    description: 'Manage accounts and pipeline with AI assistance',
    taskTemplate: 'You just finished a call with TechFlow Inc about expanding their contract. Update the CRM with call notes, update the deal stage, and create follow-up tasks.',
    systemPrompt: `You are an AI assistant for CRM and account management.
- Help log activities, update records, and plan next steps
- Let them drive the strategy and relationship approach
- Suggest actions only when asked`,
    initialState: {
      records: [
        {
          id: 'deal-1',
          type: 'deal',
          name: 'TechFlow Inc - Expansion',
          email: 'j.martinez@techflow.io',
          company: 'TechFlow Inc',
          stage: 'Negotiation',
          value: 125000,
          notes: [
            'Current customer since 2023, using Basic plan',
            'Expressed interest in Enterprise features',
            'Key contact: James Martinez (CTO)',
            'Previous call: Discussed API limits and SSO requirements',
          ],
          activities: [
            { type: 'call', date: '2025-01-28', note: 'Intro call - discussed expansion needs' },
            { type: 'email', date: '2025-01-30', note: 'Sent Enterprise pricing proposal' },
            { type: 'call', date: '2025-02-05', note: 'Pricing review call - asked for 15% discount' },
          ],
          createdAt: '2025-01-28',
        },
        {
          id: 'contact-1',
          type: 'contact',
          name: 'James Martinez',
          email: 'j.martinez@techflow.io',
          company: 'TechFlow Inc',
          notes: ['CTO, reports to CEO', 'Technical decision maker', 'Prefers async communication'],
          activities: [],
          createdAt: '2023-06-15',
        },
      ],
      currentRecord: null,
    },
  },

  // OPERATIONS / PROJECT MANAGEMENT
  {
    id: 'project-manager',
    name: 'Project Management',
    industry: 'Operations',
    environment: 'project-board',
    icon: '📋',
    description: 'Plan and manage projects with AI assistance',
    taskTemplate: 'Break down the mobile app launch into tasks. Launch date is April 15th. Key milestones: Beta release (March 15), App store submission (April 1), Marketing campaign (April 8).',
    systemPrompt: `You are an AI assistant for project management.
- Help break down projects and create tasks
- If they're vague, create high-level tasks that need refinement
- Let them assign priorities and dependencies
- Suggest improvements only when asked`,
    initialState: {
      columns: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
      tasks: [
        { id: '1', title: 'Finalize app features for beta', column: 'In Progress', description: 'Lock feature set for March 15 beta', assignee: 'Dev Team', dueDate: '2025-03-01' },
        { id: '2', title: 'Create app store assets', column: 'To Do', description: 'Screenshots, description, keywords', dueDate: '2025-03-20' },
        { id: '3', title: 'Beta testing plan', column: 'Backlog', description: 'Define test cases and beta user group' },
        { id: '4', title: 'Marketing launch plan', column: 'Backlog', description: 'Coordinate with marketing on April 8 campaign' },
      ],
    },
  },
  {
    id: 'operations-analyst',
    name: 'Operations Analysis',
    industry: 'Operations',
    environment: 'spreadsheet',
    icon: '⚡',
    description: 'Analyze processes and optimize operations',
    taskTemplate: 'Analyze the fulfillment data to identify bottlenecks. The target is 95% same-day shipping, but we\'re currently at 78%. Find the root causes and recommend improvements.',
    systemPrompt: `You are an AI assistant for operations analysis.
- Help analyze data and identify patterns
- Create basic analyses when asked, but let them interpret results
- Don't jump to conclusions - let them drive insights`,
    initialState: {
      sheets: ['Fulfillment Data', 'Analysis', 'Recommendations'],
      activeSheet: 'Fulfillment Data',
      data: {
        A1: 'Fulfillment Center Performance - January 2025', B1: '', C1: '', D1: '', E1: '', F1: '',
        A2: '', B2: '', C2: '', D2: '', E2: '', F2: '',
        A3: 'Order ID', B3: 'Received', C3: 'Picked', D3: 'Packed', E3: 'Shipped', F3: 'Same-Day?',
        A4: 'ORD-001', B4: '08:15', C4: '08:42', D4: '09:15', E4: '10:30', F4: 'Yes',
        A5: 'ORD-002', B5: '08:22', C5: '09:30', D5: '10:45', E5: '14:20', F5: 'Yes',
        A6: 'ORD-003', B6: '08:45', C6: '11:20', D6: '12:30', E6: '17:45', F6: 'No - missed cutoff',
        A7: 'ORD-004', B7: '09:10', C7: '09:35', D7: '10:00', E7: '11:15', F7: 'Yes',
        A8: 'ORD-005', B8: '09:30', C8: '12:45', D8: '14:20', E8: 'Next day', F8: 'No - picking delay',
        A9: 'ORD-006', B9: '10:00', C9: '10:28', D9: '11:15', E9: '12:30', F9: 'Yes',
        A10: 'ORD-007', B10: '10:15', C10: '10:40', D10: '15:30', E10: '17:50', F10: 'No - packing delay',
        A11: 'ORD-008', B11: '10:45', C11: '13:20', D11: '14:45', E11: 'Next day', F11: 'No - picking delay',
        A12: 'ORD-009', B12: '11:00', C12: '11:25', D12: '12:00', E12: '13:30', F12: 'Yes',
        A13: 'ORD-010', B13: '11:30', C13: '14:15', D13: '15:45', E13: 'Next day', F13: 'No - picking delay',
        A14: '', B14: '', C14: '', D14: '', E14: '', F14: '',
        A15: 'Summary:', B15: '', C15: '', D15: '', E15: '', F15: '',
        A16: 'Same-day rate:', B16: '50%', C16: '(5/10 sample)', D16: '', E16: '', F16: '',
        A17: 'Avg pick time:', B17: '?', C17: '', D17: '', E17: '', F17: '',
        A18: 'Avg pack time:', B18: '?', C18: '', D18: '', E18: '', F18: '',
        A19: 'Cutoff time:', B19: '16:00', C19: '', D19: '', E19: '', F19: '',
      },
    },
  },

  // HR / RECRUITING
  {
    id: 'recruiter',
    name: 'Recruiting',
    industry: 'Human Resources',
    environment: 'email',
    icon: '👥',
    description: 'Source and engage candidates with AI assistance',
    taskTemplate: 'Write a personalized outreach to Alex Rivera for the Senior Product Manager role. Alex is currently at Spotify and has 6 years of PM experience. Make it compelling but not pushy.',
    systemPrompt: `You are an AI recruiting assistant.
- Help craft outreach and communication
- If they're vague, write generic messages
- Incorporate candidate research when provided
- Let them drive the recruiting strategy`,
    initialState: {
      inbox: [
        {
          id: '1',
          from: 'hiring-manager@company.com',
          to: ['recruiting@company.com'],
          subject: 'Priority Hire: Senior Product Manager',
          body: `Hi team,

We need to fill the Senior PM role ASAP. Here's what we're looking for:

MUST HAVES:
- 5+ years product management experience
- B2B SaaS background
- Experience with data/analytics products
- Strong stakeholder management

NICE TO HAVES:
- Music/media tech experience
- Has scaled products from 0→1
- Remote work experience

Comp: $180-220K + equity

Top candidate from LinkedIn research:

ALEX RIVERA
Current: Product Manager at Spotify (3 years)
Previous: PM at Mixpanel (3 years)  
Education: Stanford MBA
LinkedIn: Shows they led Spotify's podcast analytics dashboard
Recent post: Wrote about "data-driven product decisions"

This person looks perfect. Can you reach out?

Thanks,
Jamie`,
          timestamp: 'Today',
          read: true,
        },
      ],
      drafts: [],
      currentDraft: null,
    },
  },
  {
    id: 'hr-manager',
    name: 'HR Management',
    industry: 'Human Resources',
    environment: 'form-builder',
    icon: '📝',
    description: 'Create HR processes and forms with AI assistance',
    taskTemplate: 'Design an employee onboarding feedback survey. We want to understand how new hires feel about their first 30 days. Keep it under 10 questions, mix of ratings and open-ended.',
    systemPrompt: `You are an AI assistant for HR processes.
- Help design forms and surveys
- If they're vague, create basic templates
- Let them define the questions and flow
- Consider employee experience when prompted`,
    initialState: {
      title: 'New Hire Onboarding Survey (30-Day)',
      fields: [
        { id: '1', type: 'rating', label: 'Overall, how would you rate your onboarding experience?', required: true },
        { id: '2', type: 'select', label: 'Did you receive all necessary equipment on your first day?', options: ['Yes', 'No', 'Partially'], required: true },
        { id: '3', type: 'rating', label: 'How clear were your role expectations?', required: true },
      ],
    },
  },

  // CUSTOMER SUCCESS / SUPPORT
  {
    id: 'customer-success',
    name: 'Customer Success',
    industry: 'Customer Success',
    environment: 'email',
    icon: '🌟',
    description: 'Manage customer relationships with AI assistance',
    taskTemplate: 'Respond to this frustrated customer while maintaining the relationship. Acknowledge their concerns, explain the situation, and propose a path forward.',
    systemPrompt: `You are an AI customer success assistant.
- Help craft empathetic, professional responses
- If they're vague, write decent but improvable responses
- Let them handle escalation decisions
- Incorporate customer context when provided`,
    initialState: {
      inbox: [
        {
          id: '1',
          from: 'michael.torres@acmecorp.com',
          to: ['success@company.com'],
          subject: 'Extremely frustrated - promised feature still missing',
          body: `Hi,

I'm writing because I'm at my wit's end. When we signed our Enterprise contract 6 months ago, your sales team PROMISED that the bulk export feature would be ready by Q1. It's now mid-February and I'm still hearing "it's on the roadmap."

We chose your platform over competitors specifically because of this promise. My team has been manually exporting data for months, wasting hours every week. This is unacceptable for what we're paying ($85K/year).

I have a board meeting next week and need to justify this expense. Right now, I can't. 

If this feature isn't delivered by end of March, we'll be evaluating alternatives. I really don't want to do that - the rest of the platform works well - but I need something concrete.

What can you do?

Michael Torres
Director of Operations
Acme Corp

---
Account Info:
- Customer since: August 2024
- Plan: Enterprise ($85K ARR)
- Health Score: At Risk
- Last QBR: November 2024
- CSM: You`,
          timestamp: 'Today, 9:15 AM',
          read: false,
        },
      ],
      drafts: [],
      currentDraft: null,
    },
  },

  // LEGAL
  {
    id: 'legal-analyst',
    name: 'Legal Analysis',
    industry: 'Legal',
    environment: 'document',
    icon: '⚖️',
    description: 'Review and draft legal documents with AI assistance',
    taskTemplate: 'Review this SaaS vendor contract and identify key risks, missing clauses, and terms that should be negotiated. Summarize your findings with specific recommendations.',
    systemPrompt: `You are an AI legal assistant.
- Help review documents and draft language
- Don't provide legal advice - help with analysis
- Let them identify the important issues
- Flag potential concerns only when asked to review`,
    initialState: {
      title: 'Vendor Contract Review - CloudStore Inc',
      content: `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of February 1, 2025 ("Effective Date") by and between:

CloudStore Inc., a Delaware corporation ("Vendor")
and
[Your Company Name] ("Customer")

1. SERVICES
Vendor shall provide Customer with access to its cloud storage platform ("Service") as described in the Order Form attached hereto.

2. TERM
The initial term of this Agreement shall be three (3) years from the Effective Date. Thereafter, this Agreement shall automatically renew for successive one (1) year periods unless either party provides written notice of non-renewal at least thirty (30) days prior to the end of the then-current term.

3. FEES AND PAYMENT
3.1 Customer shall pay Vendor the fees set forth in the Order Form.
3.2 All fees are non-refundable.
3.3 Vendor may increase fees upon thirty (30) days notice at any renewal.

4. DATA AND SECURITY
4.1 Vendor shall implement reasonable security measures to protect Customer data.
4.2 Customer grants Vendor a worldwide, royalty-free license to use Customer data for purposes of providing and improving the Service.
4.3 Upon termination, Vendor shall delete Customer data within ninety (90) days.

5. SERVICE LEVELS
Vendor targets 99% uptime but makes no guarantees regarding availability. Vendor shall not be liable for any downtime or service interruptions.

6. LIMITATION OF LIABILITY
IN NO EVENT SHALL VENDOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. VENDOR'S TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID BY CUSTOMER IN THE THREE (3) MONTHS PRECEDING THE CLAIM.

7. INDEMNIFICATION
Customer shall indemnify and hold harmless Vendor from any claims arising from Customer's use of the Service.

8. CONFIDENTIALITY
Both parties agree to maintain the confidentiality of the other party's confidential information. This obligation shall survive for two (2) years after termination.

9. TERMINATION
9.1 Either party may terminate for material breach with thirty (30) days written notice.
9.2 Vendor may terminate immediately if Customer fails to pay any fees when due.
9.3 Vendor may suspend Service immediately if Customer violates acceptable use policies.

10. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Delaware.

11. GENERAL
This Agreement constitutes the entire agreement between the parties. Vendor may modify these terms at any time by posting updated terms on its website.

[Signature blocks]

---
REVIEW NOTES:
Identify risks, missing protections, and negotiation points.
Consider: IP ownership, data rights, SLAs, termination, liability caps, compliance (SOC2, GDPR), insurance requirements.
`,
    },
  },

  // DESIGN
  {
    id: 'product-designer',
    name: 'Product Design',
    industry: 'Design',
    environment: 'canvas',
    icon: '🎯',
    description: 'Create wireframes and mockups with AI assistance',
    taskTemplate: 'Design a mobile checkout flow that reduces cart abandonment. The current flow has 5 steps with 68% drop-off. Target: 3 steps or less with clear progress indication.',
    systemPrompt: `You are an AI design assistant.
- Help create wireframes and layouts
- If they're vague, create basic structures
- Let them drive the design decisions
- Suggest UX improvements only when asked`,
    initialState: {
      elements: [
        { id: '1', type: 'rectangle', x: 20, y: 20, width: 335, height: 60, fill: '#f3f4f6', content: 'Header' },
        { id: '2', type: 'text', x: 20, y: 100, width: 200, height: 30, content: 'Current flow: 68% abandon' },
        { id: '3', type: 'rectangle', x: 20, y: 150, width: 150, height: 100, fill: '#fee2e2', content: 'Step 1\nCart Review' },
        { id: '4', type: 'rectangle', x: 190, y: 150, width: 150, height: 100, fill: '#fee2e2', content: 'Step 2\nShipping' },
        { id: '5', type: 'rectangle', x: 20, y: 270, width: 150, height: 100, fill: '#fee2e2', content: 'Step 3\nPayment' },
        { id: '6', type: 'rectangle', x: 190, y: 270, width: 150, height: 100, fill: '#fee2e2', content: 'Step 4\nReview' },
        { id: '7', type: 'rectangle', x: 20, y: 390, width: 150, height: 100, fill: '#fee2e2', content: 'Step 5\nConfirm' },
        { id: '8', type: 'text', x: 20, y: 520, width: 320, height: 60, content: 'Goal: Redesign to 3 steps max\nAdd progress indicator\nReduce friction points' },
      ],
      artboards: [{ name: 'Checkout Redesign', width: 375, height: 812 }],
    },
  },

  // CONSULTING
  {
    id: 'consultant',
    name: 'Management Consulting',
    industry: 'Consulting',
    environment: 'slides',
    icon: '📊',
    description: 'Build client presentations with AI assistance',
    taskTemplate: 'Create a strategic recommendation deck for Coastal Retail (struggling big-box retailer). They need a turnaround plan covering: cost reduction, digital transformation, and store optimization.',
    systemPrompt: `You are an AI consulting assistant.
- Help structure analyses and presentations
- Create frameworks when asked, but let them fill in specifics
- Don't make strategic recommendations - help them develop their own
- Ensure slide structure follows consulting best practices`,
    initialState: {
      slides: [
        { 
          id: '1',
          title: 'Coastal Retail: Turnaround Strategy', 
          content: 'Strategic Recommendations\nFebruary 2025\n\n[Consultant Name]\n[Firm Name]' 
        },
        { 
          id: '2',
          title: 'Executive Summary', 
          content: '[Summarize the situation, key findings, and recommendations in 3-4 bullets]\n\n[This should be the "so what" that an executive can read in 30 seconds]' 
        },
        { 
          id: '3',
          title: 'Situation Overview', 
          content: 'Coastal Retail: Key Facts\n\n• Revenue: $4.2B (down 15% YoY)\n• 180 stores across Southeast US\n• 12,000 employees\n• Core categories: Home goods, furniture, appliances\n• Challenges: Amazon competition, aging stores, high inventory costs\n• Cash runway: 18 months at current burn' 
        },
        { 
          id: '4',
          title: 'Problem Diagnosis', 
          content: 'What\'s driving the decline?\n\n[Analyze root causes across:]\n• Market/competitive factors\n• Operational issues\n• Strategic gaps\n\n[Use data to support each point]' 
        },
        { 
          id: '5',
          title: 'Strategic Options', 
          content: 'Three paths forward:\n\n1. Cost Reduction Focus\n   - Pros/cons?\n   - Impact?\n\n2. Digital Transformation\n   - Pros/cons?\n   - Impact?\n\n3. Store Network Optimization\n   - Pros/cons?\n   - Impact?' 
        },
        { 
          id: '6',
          title: 'Recommendation', 
          content: '[What do you recommend and why?]\n\n[Be specific: which stores, what costs, what digital investments]\n\n[Quantify the expected impact]' 
        },
        { 
          id: '7',
          title: 'Implementation Roadmap', 
          content: '[90-day quick wins]\n\n[6-month milestones]\n\n[12-month targets]\n\n[Key risks and mitigation]' 
        },
        { 
          id: '8',
          title: 'Financial Impact', 
          content: '[Show projected P&L improvement]\n\n[Investment required vs. savings/revenue generated]\n\n[Payback period]' 
        },
      ],
      activeSlide: 2,
    },
  },

  // RESEARCH / ACADEMIA
  {
    id: 'researcher',
    name: 'Research',
    industry: 'Research',
    environment: 'document',
    icon: '🔬',
    description: 'Write and analyze research with AI assistance',
    taskTemplate: 'Write an abstract for a research paper based on these findings. The study examined remote work productivity across 50 companies (n=2,847 employees) over 18 months.',
    systemPrompt: `You are an AI research assistant.
- Help with writing and analysis
- Create basic drafts when asked, but let them refine
- Don't make up data or citations
- Help structure arguments when prompted`,
    initialState: {
      title: 'Research Paper Draft',
      content: `STUDY DATA AND FINDINGS

Title: "Productivity Patterns in Hybrid Work Environments: An 18-Month Longitudinal Study"

METHODOLOGY:
- 50 companies (tech, finance, professional services)
- 2,847 employees tracked
- 18-month period (Jan 2023 - June 2024)
- Mixed methods: productivity metrics, surveys, interviews
- Controlled for role type, tenure, and pre-pandemic performance

KEY FINDINGS:

1. Overall Productivity
   - Fully remote: +7.2% vs pre-pandemic baseline
   - Hybrid (2-3 days office): +12.4% vs baseline  
   - Fully in-office: -2.1% vs baseline
   - p < 0.01 for all comparisons

2. Collaboration Metrics
   - Async communication up 340% across all groups
   - Synchronous meetings down 28% for remote/hybrid
   - Cross-team collaboration: hybrid showed highest scores

3. Employee Wellbeing
   - Remote: highest work-life satisfaction (4.2/5)
   - Hybrid: highest overall job satisfaction (4.4/5)
   - In-office: highest team connection scores (4.1/5)

4. Moderating Factors
   - Manager training in remote leadership: +18% team productivity
   - Home office stipend: +8% remote worker satisfaction
   - Mandatory office days: -12% satisfaction vs flexible

LIMITATIONS:
- Self-selection bias in work arrangement
- Industry concentration (mostly knowledge work)
- Pandemic-era confounds

---

Write an abstract (250 words max) that:
1. States the research question
2. Describes methodology briefly
3. Summarizes key findings
4. Notes implications

`,
    },
  },
];

// Helper to get assessment by ID
export function getAssessmentType(id: string): AssessmentType | undefined {
  return ASSESSMENT_TYPES.find((a) => a.id === id);
}

// Helper to get assessments by industry
export function getAssessmentsByIndustry(industry: string): AssessmentType[] {
  return ASSESSMENT_TYPES.filter((a) => a.industry === industry);
}

// Helper to get assessments by environment
export function getAssessmentsByEnvironment(env: EnvironmentType): AssessmentType[] {
  return ASSESSMENT_TYPES.filter((a) => a.environment === env);
}

// Get unique industries
export function getIndustries(): string[] {
  return [...new Set(ASSESSMENT_TYPES.map((a) => a.industry))];
}

// Get unique environments
export function getEnvironments(): EnvironmentType[] {
  return [...new Set(ASSESSMENT_TYPES.map((a) => a.environment))];
}
