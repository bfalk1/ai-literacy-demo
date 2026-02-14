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
    taskTemplate: 'Implement a rate-limited API endpoint that handles concurrent requests safely.',
    systemPrompt: `You are an AI pair programmer. Help the candidate write code, but don't do everything for them.
- If they give vague instructions, write generic code that needs refinement
- If they provide specifics (edge cases, constraints), incorporate them
- Ask clarifying questions when requirements are ambiguous
- Point out potential issues only if they ask for review`,
    initialState: {
      files: {
        'src/index.ts': '// Your code here\n',
        'src/types.ts': 'export interface Request {\n  // Define your types\n}\n',
      },
      openFile: 'src/index.ts',
    },
  },
  {
    id: 'frontend-engineer',
    name: 'Frontend Engineering',
    industry: 'Technology',
    environment: 'code',
    icon: '🎨',
    description: 'Build UI components with AI assistance',
    taskTemplate: 'Create a responsive data table component with sorting and filtering.',
    systemPrompt: `You are an AI pair programmer specializing in frontend development.
- Help with React/Vue/component architecture
- If instructions are vague, create basic implementations
- Consider accessibility and responsive design when prompted`,
    initialState: {
      files: {
        'src/components/DataTable.tsx': '// Implement your component\n',
        'src/styles/table.css': '/* Your styles */\n',
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
    taskTemplate: 'Write a query to identify customers at risk of churn based on activity patterns.',
    systemPrompt: `You are an AI assistant for SQL and data analysis.
- Help write queries but let them think through the logic
- If they ask for "the query," give a basic version that may need optimization
- Explain query plans only when asked
- Point out performance issues only if they ask for review`,
    initialState: {
      schema: {
        users: ['id', 'email', 'created_at', 'last_login'],
        orders: ['id', 'user_id', 'amount', 'created_at'],
        events: ['id', 'user_id', 'event_type', 'timestamp'],
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
    taskTemplate: 'Create a 3-year revenue projection model with sensitivity analysis.',
    systemPrompt: `You are an AI assistant for financial modeling.
- Help build formulas and models but let them structure the approach
- If they say "create the model," build a basic template that needs customization
- Don't volunteer assumptions - let them specify
- Point out modeling errors only if asked to review`,
    initialState: {
      sheets: ['Model', 'Assumptions', 'Output'],
      activeSheet: 'Model',
      data: {
        A1: 'Revenue Model',
        A3: 'Year',
        B3: '2024',
        C3: '2025',
        D3: '2026',
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
    taskTemplate: 'Reconcile the bank statement with the general ledger and identify discrepancies.',
    systemPrompt: `You are an AI assistant for accounting tasks.
- Help with reconciliation, formulas, and formatting
- If instructions are vague, create basic structures
- Let them identify discrepancies themselves
- Explain accounting principles only when asked`,
    initialState: {
      sheets: ['Bank Statement', 'General Ledger', 'Reconciliation'],
      activeSheet: 'Reconciliation',
      data: {},
    },
  },
  {
    id: 'investment-analyst',
    name: 'Investment Analysis',
    industry: 'Finance',
    environment: 'spreadsheet',
    icon: '📈',
    description: 'Analyze investments and build valuation models',
    taskTemplate: 'Build a DCF model to value a SaaS company with the provided financials.',
    systemPrompt: `You are an AI assistant for investment analysis.
- Help with valuation models and financial analysis
- Let them drive assumptions and methodology
- Create basic templates when asked, but require their input for specifics`,
    initialState: {
      sheets: ['Inputs', 'DCF', 'Comparables', 'Output'],
      activeSheet: 'DCF',
      data: {},
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
    taskTemplate: 'Write a blog post about AI in healthcare that drives organic traffic.',
    systemPrompt: `You are an AI writing assistant.
- Help draft and refine content but don't produce polished work immediately
- If they say "write the post," create a generic first draft
- Incorporate their feedback and specifics when provided
- Let them guide tone, structure, and key messages`,
    initialState: {
      content: '',
      title: 'Untitled Document',
    },
  },
  {
    id: 'marketing-manager',
    name: 'Marketing Strategy',
    industry: 'Marketing',
    environment: 'slides',
    icon: '📣',
    description: 'Build marketing presentations with AI assistance',
    taskTemplate: 'Create a go-to-market strategy presentation for a new product launch.',
    systemPrompt: `You are an AI assistant for marketing presentations.
- Help structure and create slides
- If they're vague, create generic slides that need customization
- Let them define messaging, positioning, and strategy`,
    initialState: {
      slides: [
        { title: 'Go-to-Market Strategy', content: '' },
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
    taskTemplate: 'Write a follow-up sequence for a prospect who went cold after a demo.',
    systemPrompt: `You are an AI sales assistant.
- Help craft emails and outreach
- If they say "write the email," create something generic
- Incorporate context about the prospect when provided
- Let them drive the sales strategy`,
    initialState: {
      inbox: [],
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
    taskTemplate: 'Update the CRM with notes from your last call and plan next steps for the deal.',
    systemPrompt: `You are an AI assistant for CRM and account management.
- Help log activities, update records, and plan next steps
- Let them drive the strategy and relationship approach
- Suggest actions only when asked`,
    initialState: {
      records: [],
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
    taskTemplate: 'Break down a product launch into tasks and create a project timeline.',
    systemPrompt: `You are an AI assistant for project management.
- Help break down projects and create tasks
- If they're vague, create high-level tasks that need refinement
- Let them assign priorities and dependencies
- Suggest improvements only when asked`,
    initialState: {
      columns: ['Backlog', 'To Do', 'In Progress', 'Done'],
      tasks: [],
    },
  },
  {
    id: 'operations-analyst',
    name: 'Operations Analysis',
    industry: 'Operations',
    environment: 'spreadsheet',
    icon: '⚡',
    description: 'Analyze processes and optimize operations',
    taskTemplate: 'Analyze the fulfillment data to identify bottlenecks and recommend improvements.',
    systemPrompt: `You are an AI assistant for operations analysis.
- Help analyze data and identify patterns
- Create basic analyses when asked, but let them interpret results
- Don't jump to conclusions - let them drive insights`,
    initialState: {
      sheets: ['Raw Data', 'Analysis', 'Recommendations'],
      activeSheet: 'Analysis',
      data: {},
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
    taskTemplate: 'Write a personalized outreach to a passive candidate for a senior role.',
    systemPrompt: `You are an AI recruiting assistant.
- Help craft outreach and communication
- If they're vague, write generic messages
- Incorporate candidate research when provided
- Let them drive the recruiting strategy`,
    initialState: {
      inbox: [],
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
    taskTemplate: 'Design an employee onboarding survey to gather feedback on the first-week experience.',
    systemPrompt: `You are an AI assistant for HR processes.
- Help design forms and surveys
- If they're vague, create basic templates
- Let them define the questions and flow
- Consider employee experience when prompted`,
    initialState: {
      fields: [],
      title: 'New Form',
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
    taskTemplate: 'Write a response to a customer expressing frustration about a delayed feature.',
    systemPrompt: `You are an AI customer success assistant.
- Help craft empathetic, professional responses
- If they're vague, write decent but improvable responses
- Let them handle escalation decisions
- Incorporate customer context when provided`,
    initialState: {
      inbox: [
        {
          from: 'customer@example.com',
          subject: 'Frustrated with feature delay',
          body: 'We were promised this feature 3 months ago...',
        },
      ],
      drafts: [],
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
    taskTemplate: 'Review this contract and identify key risks and missing clauses.',
    systemPrompt: `You are an AI legal assistant.
- Help review documents and draft language
- Don't provide legal advice - help with analysis
- Let them identify the important issues
- Flag potential concerns only when asked to review`,
    initialState: {
      content: '',
      title: 'Contract Review',
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
    taskTemplate: 'Design a mobile checkout flow that reduces cart abandonment.',
    systemPrompt: `You are an AI design assistant.
- Help create wireframes and layouts
- If they're vague, create basic structures
- Let them drive the design decisions
- Suggest UX improvements only when asked`,
    initialState: {
      elements: [],
      artboards: [{ name: 'Screen 1', width: 375, height: 812 }],
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
    taskTemplate: 'Create a strategic recommendation deck for a client considering market expansion.',
    systemPrompt: `You are an AI consulting assistant.
- Help structure analyses and presentations
- Create frameworks when asked, but let them fill in specifics
- Don't make strategic recommendations - help them develop their own
- Ensure slide structure follows consulting best practices`,
    initialState: {
      slides: [
        { title: 'Strategic Recommendations', content: '' },
      ],
      activeSlide: 0,
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
    taskTemplate: 'Write an abstract for a research paper on your recent findings.',
    systemPrompt: `You are an AI research assistant.
- Help with writing and analysis
- Create basic drafts when asked, but let them refine
- Don't make up data or citations
- Help structure arguments when prompted`,
    initialState: {
      content: '',
      title: 'Research Document',
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
