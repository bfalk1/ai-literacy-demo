export default function GreenhouseDocsPage() {
  return (
    <div className="prose prose-indigo max-w-none">
      <h1>Greenhouse Integration</h1>
      
      <p className="lead text-xl text-gray-600">
        Connect Telescopic to Greenhouse to automatically send AI literacy assessments when 
        candidates reach a specific interview stage, and sync results back to candidate profiles.
      </p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 my-6 not-prose">
        <p className="text-indigo-800 font-medium">⏱️ Setup time: ~10 minutes</p>
      </div>

      <h2>Prerequisites</h2>
      <ul>
        <li>Admin access to your Greenhouse account</li>
        <li>A Telescopic account with API access</li>
      </ul>

      <h2>Step 1: Create a Greenhouse API Key</h2>
      <ol>
        <li>Log into Greenhouse as an admin</li>
        <li>Navigate to <strong>Configure → Dev Center → API Credential Management</strong></li>
        <li>Click <strong>Create New API Key</strong></li>
        <li>Select <strong>Harvest API</strong></li>
        <li>Name it <code>Telescopic Integration</code></li>
        <li>
          Grant these permissions:
          <ul>
            <li>Candidates: GET, POST</li>
            <li>Applications: GET</li>
            <li>Jobs: GET</li>
          </ul>
        </li>
        <li>Click <strong>Create</strong> and copy the API key</li>
      </ol>

      <h2>Step 2: Add Your API Key to Telescopic</h2>
      <ol>
        <li>Go to your <a href="/dashboard/settings">Telescopic Settings</a></li>
        <li>Navigate to <strong>Integrations → Greenhouse</strong></li>
        <li>Paste your Greenhouse API key</li>
        <li>Set your <strong>Trigger Stage</strong> (e.g., "Assessment")</li>
        <li>Click <strong>Save</strong></li>
      </ol>
      
      <p>Alternatively, use our API:</p>
      
      <div className="bg-gray-900 rounded-lg p-4 my-4 not-prose overflow-x-auto">
        <pre className="text-gray-100 text-sm">
{`curl -X POST https://telescopic.ca/api/integrations/greenhouse/config \\
  -H "Authorization: Bearer YOUR_TELESCOPIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "greenhouseApiKey": "YOUR_GREENHOUSE_API_KEY",
    "triggerStage": "Assessment",
    "enabled": true
  }'`}
        </pre>
      </div>

      <h2>Step 3: Set Up the Webhook in Greenhouse</h2>
      <ol>
        <li>In Greenhouse, go to <strong>Configure → Dev Center → Webhooks</strong></li>
        <li>Click <strong>Create Webhook</strong></li>
        <li>
          Configure:
          <ul>
            <li><strong>Name:</strong> Telescopic</li>
            <li><strong>When:</strong> Candidate has changed stage</li>
            <li>
              <strong>Endpoint URL:</strong>
              <div className="bg-gray-100 rounded p-2 my-2 font-mono text-sm break-all">
                https://telescopic.ca/api/integrations/greenhouse/webhook?company_id=YOUR_COMPANY_ID
              </div>
            </li>
          </ul>
        </li>
        <li>Generate a <strong>Secret Key</strong> and save it</li>
        <li>Add the secret key to your Telescopic settings</li>
      </ol>

      <h2>Step 4: Test the Integration</h2>
      <ol>
        <li>Move a test candidate to your Assessment stage in Greenhouse</li>
        <li>Verify they receive an assessment email</li>
        <li>Complete the assessment</li>
        <li>Check that results appear on the candidate's profile in Greenhouse</li>
      </ol>

      <h2>Assessment Results in Greenhouse</h2>
      <p>
        Results are added as a note to the candidate's activity feed with full score breakdown 
        and a link to detailed results.
      </p>

      <h2>Need Help?</h2>
      <p>
        Contact us at <a href="mailto:support@telescopic.ca">support@telescopic.ca</a> for 
        integration support.
      </p>
    </div>
  );
}
