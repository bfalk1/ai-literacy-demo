import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 30;

// Environment-specific action instructions
const ENVIRONMENT_INSTRUCTIONS: Record<string, string> = {
  code: `
When you write or modify code, output it as an action that updates the editor directly.
Use this format at the END of your response:

\`\`\`actions
[{"type": "writeFile", "path": "src/index.ts", "content": "// your code here"}]
\`\`\`

Available actions:
- writeFile: {"type": "writeFile", "path": "file/path.ts", "content": "code"}
- runCommand: {"type": "runCommand", "command": "npm test"}
- openFile: {"type": "openFile", "path": "file/path.ts"}

Keep your chat response brief - explain what you're doing, but put the actual code in actions.
Do NOT paste large code blocks in your chat text. Use writeFile actions instead.`,

  spreadsheet: `
When you modify the spreadsheet, output actions to update cells directly.
Use this format at the END of your response:

\`\`\`actions
[{"type": "setCellValue", "cell": "A1", "value": "Revenue"},
 {"type": "setCellFormula", "cell": "B10", "formula": "=SUM(B1:B9)"}]
\`\`\`

Available actions:
- setCellValue: {"type": "setCellValue", "cell": "A1", "value": "text or number"}
- setCellFormula: {"type": "setCellFormula", "cell": "A1", "formula": "=SUM(A1:A10)"}
- formatCell: {"type": "formatCell", "cell": "A1", "format": {"bold": true}}
- highlight: {"type": "highlight", "range": "A1:B10"}

Keep chat responses brief - describe what you're doing, but update cells via actions.`,

  document: `
When you write or edit the document, output actions to update it directly.
Use this format at the END of your response:

\`\`\`actions
[{"type": "replaceText", "text": "Your full document content here"}]
\`\`\`

Available actions:
- replaceText: {"type": "replaceText", "text": "new content"} - replaces entire document
- insertText: {"type": "insertText", "position": 0, "text": "text to insert"}

Keep chat responses brief - explain your approach, but put the actual content in actions.`,

  email: `
When you draft or edit emails, output actions to update the email directly.
Use this format at the END of your response:

\`\`\`actions
[{"type": "draft", "to": ["email@example.com"], "subject": "Subject", "body": "Email body"}]
\`\`\`

Available actions:
- draft: {"type": "draft", "to": ["email"], "subject": "...", "body": "..."}
- editSubject: {"type": "editSubject", "subject": "new subject"}
- editBody: {"type": "editBody", "body": "new body"}

Keep chat brief - explain your approach, put the email content in actions.`,

  database: `
When you write SQL queries, output actions to run them in the query editor.
Use this format at the END of your response:

\`\`\`actions
[{"type": "runQuery", "query": "SELECT * FROM users WHERE..."}]
\`\`\`

Available actions:
- runQuery: {"type": "runQuery", "query": "SELECT ..."}
- explainQuery: {"type": "explainQuery", "query": "SELECT ..."}

Keep chat brief - explain the query logic, but put the SQL in actions.`,

  slides: `
When you create or edit slides, output actions to update them directly.
Use this format at the END of your response:

\`\`\`actions
[{"type": "editSlide", "slideIndex": 0, "content": "Slide content here"}]
\`\`\`

Available actions:
- addSlide: {"type": "addSlide"}
- editSlide: {"type": "editSlide", "slideIndex": 0, "content": "..."}
- deleteSlide: {"type": "deleteSlide", "slideIndex": 0}`,

  "project-board": `
When you create or modify tasks, output actions to update the board directly.
Use this format at the END of your response:

\`\`\`actions
[{"type": "createTask", "title": "Task name", "column": "To Do", "description": "..."}]
\`\`\`

Available actions:
- createTask: {"type": "createTask", "title": "...", "column": "To Do", "description": "..."}
- moveTask: {"type": "moveTask", "taskId": "...", "column": "In Progress"}
- editTask: {"type": "editTask", "taskId": "...", "title": "...", "description": "..."}`,
};

export async function POST(req: Request) {
  const { messages, systemPrompt, environmentType } = await req.json();

  // Add environment-specific action instructions
  const envInstructions = environmentType ? ENVIRONMENT_INSTRUCTIONS[environmentType] || "" : "";
  const fullSystemPrompt = systemPrompt + (envInstructions ? "\n\n" + envInstructions : "");

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: fullSystemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
