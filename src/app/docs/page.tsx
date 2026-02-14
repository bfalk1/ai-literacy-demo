import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="prose prose-indigo max-w-none">
      <h1>Telescopic Documentation</h1>
      
      <p className="lead text-xl text-gray-600">
        Telescopic is an AI literacy assessment platform that helps companies evaluate 
        candidates' ability to effectively collaborate with AI tools.
      </p>

      <h2>Quick Start</h2>
      
      <ol>
        <li>
          <strong>Connect your ATS</strong> — Set up Ashby or Greenhouse integration to 
          automatically trigger assessments
        </li>
        <li>
          <strong>Configure your trigger stage</strong> — Choose which interview stage 
          should send assessment invitations
        </li>
        <li>
          <strong>Candidates complete assessments</strong> — They receive an email with 
          a link to the assessment
        </li>
        <li>
          <strong>Review results</strong> — Scores are automatically pushed back to your 
          ATS and available in your dashboard
        </li>
      </ol>

      <h2>Integrations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-4">
        <Link 
          href="/docs/integrations/ashby"
          className="block p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ashby</h3>
          <p className="text-gray-600 text-sm">
            Connect Telescopic to Ashby for automatic assessment triggers and result syncing.
          </p>
        </Link>
        
        <Link 
          href="/docs/integrations/greenhouse"
          className="block p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Greenhouse</h3>
          <p className="text-gray-600 text-sm">
            Connect Telescopic to Greenhouse for automatic assessment triggers and result syncing.
          </p>
        </Link>
      </div>

      <h2>How It Works</h2>
      
      <h3>Assessment Flow</h3>
      <ol>
        <li>Recruiter moves candidate to the configured assessment stage in your ATS</li>
        <li>Telescopic receives a webhook and creates an assessment invitation</li>
        <li>Candidate receives an email with a unique assessment link</li>
        <li>Candidate completes the AI literacy assessment (15-20 minutes)</li>
        <li>Results are scored and automatically pushed back to your ATS</li>
        <li>Recruiters can view detailed results on the candidate's profile</li>
      </ol>

      <h3>What We Measure</h3>
      <ul>
        <li><strong>Prompt Quality</strong> — How well candidates craft effective prompts</li>
        <li><strong>Context Usage</strong> — Ability to provide relevant context to AI</li>
        <li><strong>Iteration Skills</strong> — How candidates refine and improve outputs</li>
        <li><strong>Efficiency</strong> — Achieving goals with minimal back-and-forth</li>
      </ul>

      <h2>Need Help?</h2>
      <p>
        Contact us at <a href="mailto:support@telescopic.ca">support@telescopic.ca</a> for 
        integration support or questions.
      </p>
    </div>
  );
}
