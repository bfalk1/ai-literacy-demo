export default function AshbyDocsPage() {
  return (
    <div className="prose prose-indigo max-w-none">
      <h1>Ashby Integration</h1>
      
      <p className="lead text-xl text-gray-600">
        Connect Telescopic to Ashby to automatically send AI literacy assessments when 
        candidates reach a specific interview stage, and sync results back to candidate profiles.
      </p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 my-6 not-prose">
        <p className="text-indigo-800 font-medium">⏱️ Setup time: ~10 minutes</p>
      </div>

      <h2>Prerequisites</h2>
      <ul>
        <li>Admin access to your Ashby account</li>
        <li>A Telescopic account with API access</li>
      </ul>

      <h2>Step 1: Create an Ashby API Key</h2>
      <ol>
        <li>Log into Ashby as an admin</li>
        <li>Navigate to <strong>Admin → Integrations → API Keys</strong></li>
        <li>Click <strong>Create API Key</strong></li>
        <li>Name it <code>Telescopic Integration</code></li>
        <li>
          Grant these permissions:
          <ul>
            <li><code>candidates:read</code></li>
            <li><code>candidates:write</code></li>
            <li><code>jobs:read</code></li>
            <li><code>applications:read</code></li>
          </ul>
        </li>
        <li>Click <strong>Create</strong> and copy the API key (you won't see it again)</li>
      </ol>

      <h2>Step 2: Add Your API Key to Telescopic</h2>
      <ol>
        <li>Go to your <a href="/dashboard/settings">Telescopic Settings</a></li>
        <li>Navigate to <strong>Integrations → Ashby</strong></li>
        <li>Paste your Ashby API key</li>
        <li>Set your <strong>Trigger Stage</strong> (e.g., "Assessment")</li>
        <li>Click <strong>Save</strong></li>
      </ol>
      
      <p>Alternatively, use our API:</p>
      
      <div className="bg-gray-900 rounded-lg p-4 my-4 not-prose overflow-x-auto">
        <pre className="text-gray-100 text-sm">
{`curl -X POST https://telescopic.ca/api/integrations/ashby/config \\
  -H "Authorization: Bearer YOUR_TELESCOPIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "ashbyApiKey": "YOUR_ASHBY_API_KEY",
    "triggerStage": "Assessment",
    "enabled": true
  }'`}
        </pre>
      </div>

      <h2>Step 3: Set Up the Webhook in Ashby</h2>
      <p>
        Webhooks allow Ashby to notify Telescopic when candidates move between interview stages.
      </p>
      
      <ol>
        <li>In Ashby, go to <strong>Admin → Integrations → Webhooks</strong></li>
        <li>Click <strong>Add Webhook</strong></li>
        <li>
          Configure the webhook:
          <ul>
            <li><strong>Name:</strong> Telescopic</li>
            <li><strong>Webhook Type:</strong> Candidate Application Changed Stage</li>
            <li>
              <strong>Request URL:</strong>
              <div className="bg-gray-100 rounded p-2 my-2 font-mono text-sm break-all">
                https://telescopic.ca/api/integrations/ashby/webhook?company_id=YOUR_COMPANY_ID
              </div>
            </li>
            <li><strong>Enabled:</strong> ✓ Checked</li>
          </ul>
        </li>
        <li>Click <strong>Create Webhook</strong></li>
      </ol>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6 not-prose">
        <p className="text-amber-800">
          <strong>💡 Tip:</strong> You can find your Company ID in your Telescopic dashboard 
          under Settings → API.
        </p>
      </div>

      <h2>Step 4: Create an Assessment Stage</h2>
      <p>
        If you don't already have one, create an interview stage that will trigger assessments:
      </p>
      <ol>
        <li>In Ashby, go to a job's <strong>Interview Plan</strong></li>
        <li>Click <strong>Add Stage</strong></li>
        <li>Name it <strong>Assessment</strong> (or whatever you configured as your trigger stage)</li>
        <li>Position it where you want candidates to take the assessment</li>
      </ol>

      <h2>Step 5: Test the Integration</h2>
      <ol>
        <li>Move a test candidate to your Assessment stage</li>
        <li>Check that they receive an email with the assessment link</li>
        <li>Complete the assessment</li>
        <li>Verify results appear on the candidate's Activity tab in Ashby</li>
      </ol>

      <h2>How It Works</h2>
      
      <div className="bg-gray-50 rounded-lg p-6 my-6 not-prose">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <p className="font-medium">Candidate moves to Assessment stage</p>
              <p className="text-sm text-gray-600">Recruiter drags candidate in Ashby</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <p className="font-medium">Ashby sends webhook to Telescopic</p>
              <p className="text-sm text-gray-600">Automatic, happens instantly</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <p className="font-medium">Candidate receives assessment email</p>
              <p className="text-sm text-gray-600">Unique link valid for 72 hours</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
            <div>
              <p className="font-medium">Candidate completes assessment</p>
              <p className="text-sm text-gray-600">~15-20 minutes</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
            <div>
              <p className="font-medium">Results pushed to Ashby</p>
              <p className="text-sm text-gray-600">Appears as a note on candidate profile</p>
            </div>
          </div>
        </div>
      </div>

      <h2>Assessment Results in Ashby</h2>
      <p>
        After a candidate completes their assessment, results are automatically added to their 
        profile in Ashby as an Activity note:
      </p>
      
      <div className="bg-white border border-gray-300 rounded-lg p-4 my-4 not-prose font-mono text-sm">
        <p className="font-bold text-lg mb-2">🎯 Telescopic AI Literacy Assessment Results</p>
        <p><strong>Overall Score:</strong> 🟢 85/100</p>
        <p className="mt-2"><strong>Breakdown:</strong></p>
        <ul className="list-disc list-inside ml-2">
          <li>Prompt Quality: 🟢 88/100</li>
          <li>Context Usage: 🟢 82/100</li>
          <li>Iteration Skills: 🟢 85/100</li>
          <li>Efficiency: 🟢 84/100</li>
        </ul>
        <p className="mt-2"><strong>Summary:</strong> Strong AI collaboration skills demonstrated.</p>
        <p className="mt-2 text-indigo-600">🔗 View Full Results</p>
      </div>

      <h2>Troubleshooting</h2>
      
      <h3>Webhook not firing</h3>
      <ul>
        <li>Verify the webhook is enabled in Ashby</li>
        <li>Check the webhook URL includes your correct Company ID</li>
        <li>Make sure you're moving candidates to the exact trigger stage name</li>
      </ul>

      <h3>Emails not sending</h3>
      <ul>
        <li>Check that your email domain is verified in your email provider</li>
        <li>Look for errors in your Telescopic logs</li>
        <li>Verify the candidate has a valid email address in Ashby</li>
      </ul>

      <h3>Results not appearing in Ashby</h3>
      <ul>
        <li>Confirm your Ashby API key has <code>candidates:write</code> permission</li>
        <li>Check the Telescopic logs for API errors</li>
        <li>Verify the candidate ID is correctly stored in the invitation</li>
      </ul>

      <h2>Need Help?</h2>
      <p>
        Contact us at <a href="mailto:support@telescopic.ca">support@telescopic.ca</a> for 
        integration support.
      </p>
    </div>
  );
}
