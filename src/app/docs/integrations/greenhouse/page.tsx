export default function GreenhouseDocsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Greenhouse Integration</h1>
      
      <p className="text-lg text-zinc-400 mb-6">
        Connect Telescopic to Greenhouse to automatically send AI literacy assessments when 
        candidates reach a specific interview stage.
      </p>

      <div className="bg-indigo-950/50 border border-indigo-900 rounded-lg px-4 py-3 mb-8">
        <p className="text-indigo-300 text-sm">⏱️ Setup time: ~10 minutes</p>
      </div>

      <h2 className="text-lg font-semibold mb-4 mt-10">Prerequisites</h2>
      <ul className="list-disc list-inside space-y-2 text-zinc-400 mb-8">
        <li>Admin access to your Greenhouse account</li>
        <li>A Telescopic account with API access</li>
      </ul>

      <h2 className="text-lg font-semibold mb-4 mt-10">Step 1: Create a Greenhouse API Key</h2>
      <ol className="list-decimal list-inside space-y-3 text-zinc-400 mb-8">
        <li>Log into Greenhouse as an admin</li>
        <li>Navigate to <span className="text-white">Configure → Dev Center → API Credential Management</span></li>
        <li>Click <span className="text-white">Create New API Key</span></li>
        <li>Select <span className="text-white">Harvest API</span></li>
        <li>Name it <code className="bg-zinc-800 px-2 py-0.5 rounded text-sm">Telescopic Integration</code></li>
        <li>
          Grant these permissions:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
            <li>Candidates: <code className="bg-zinc-800 px-2 py-0.5 rounded text-sm">GET</code>, <code className="bg-zinc-800 px-2 py-0.5 rounded text-sm">POST</code></li>
            <li>Applications: <code className="bg-zinc-800 px-2 py-0.5 rounded text-sm">GET</code></li>
            <li>Jobs: <code className="bg-zinc-800 px-2 py-0.5 rounded text-sm">GET</code></li>
          </ul>
        </li>
        <li>Click <span className="text-white">Create</span> and copy the API key</li>
      </ol>

      <h2 className="text-lg font-semibold mb-4 mt-10">Step 2: Configure Telescopic</h2>
      <ol className="list-decimal list-inside space-y-3 text-zinc-400 mb-4">
        <li>Go to your Telescopic Dashboard</li>
        <li>Navigate to <span className="text-white">Settings → Integrations → Greenhouse</span></li>
        <li>Paste your Greenhouse API key</li>
        <li>Set your trigger stage (e.g., &quot;Assessment&quot;)</li>
        <li>Click <span className="text-white">Save</span></li>
      </ol>
      
      <p className="text-zinc-500 mb-4">Or use the API:</p>
      
      <div className="bg-zinc-900 rounded-lg p-4 mb-8 overflow-x-auto">
        <pre className="text-sm text-zinc-300">
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

      <h2 className="text-lg font-semibold mb-4 mt-10">Step 3: Set Up Webhook in Greenhouse</h2>
      <p className="text-zinc-400 mb-4">
        Webhooks notify Telescopic when candidates move between interview stages.
      </p>
      
      <ol className="list-decimal list-inside space-y-3 text-zinc-400 mb-4">
        <li>In Greenhouse, go to <span className="text-white">Configure → Dev Center → Webhooks</span></li>
        <li>Click <span className="text-white">Create New Webhook</span></li>
        <li>
          Configure:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
            <li><span className="text-white">Name:</span> Telescopic</li>
            <li><span className="text-white">When:</span> Candidate has changed stage</li>
            <li><span className="text-white">Endpoint URL:</span></li>
          </ul>
        </li>
      </ol>

      <div className="bg-indigo-950/50 border border-indigo-900 rounded-lg p-4 mb-4">
        <p className="text-indigo-300 text-sm mb-2">📋 Get your webhook URL:</p>
        <p className="text-zinc-300 text-sm">
          Go to your <a href="/dashboard" className="text-white underline hover:text-indigo-300">Telescopic Dashboard</a> → <span className="text-white">Settings</span> tab → copy the <span className="text-white">Greenhouse Webhook URL</span>
        </p>
      </div>

      <ol className="list-decimal list-inside space-y-3 text-zinc-400 mb-8" start={4}>
        <li>Generate a <span className="text-white">Secret Key</span> and save it</li>
        <li>Add the secret key to your Telescopic Greenhouse settings</li>
        <li>Click <span className="text-white">Create Webhook</span></li>
      </ol>

      <div className="bg-amber-950/50 border border-amber-900 rounded-lg px-4 py-3 mb-8">
        <p className="text-amber-300 text-sm">
          💡 The secret key is used to verify webhook signatures. Keep it secure.
        </p>
      </div>

      <h2 className="text-lg font-semibold mb-4 mt-10">Step 4: Create an Assessment Stage</h2>
      <p className="text-zinc-400 mb-4">
        Add an interview stage that will trigger assessments:
      </p>
      <ol className="list-decimal list-inside space-y-3 text-zinc-400 mb-8">
        <li>In Greenhouse, go to a job&apos;s <span className="text-white">Job Setup → Interview Plan</span></li>
        <li>Click <span className="text-white">Add Stage</span></li>
        <li>Name it <span className="text-white">Assessment</span> (must match your trigger stage)</li>
        <li>Position it where you want candidates to take the assessment</li>
      </ol>

      <h2 className="text-lg font-semibold mb-4 mt-10">Step 5: Test the Integration</h2>
      <ol className="list-decimal list-inside space-y-3 text-zinc-400 mb-8">
        <li>Move a test candidate to your Assessment stage</li>
        <li>Check that they receive an email with the assessment link</li>
        <li>Complete the assessment</li>
        <li>Verify results appear on the candidate&apos;s Activity Feed in Greenhouse</li>
      </ol>

      <h2 className="text-lg font-semibold mb-4 mt-10">How It Works</h2>
      
      <div className="bg-zinc-900 rounded-lg p-6 mb-8">
        <div className="space-y-4">
          {[
            { step: 1, title: 'Candidate moves to Assessment stage', desc: 'Recruiter moves candidate in Greenhouse' },
            { step: 2, title: 'Greenhouse sends webhook to Telescopic', desc: 'Automatic, happens instantly' },
            { step: 3, title: 'Candidate receives assessment email', desc: 'Unique link valid for 72 hours' },
            { step: 4, title: 'Candidate completes assessment', desc: '~15-20 minutes' },
            { step: 5, title: 'Results pushed to Greenhouse', desc: 'Appears as note on candidate profile' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                {step}
              </div>
              <div>
                <p className="font-medium text-white">{title}</p>
                <p className="text-sm text-zinc-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4 mt-10">Results in Greenhouse</h2>
      <p className="text-zinc-400 mb-4">
        After completion, results appear on the candidate&apos;s Activity Feed:
      </p>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-8 font-mono text-sm">
        <p className="font-bold text-base mb-3">🎯 Telescopic AI Literacy Assessment</p>
        <p className="text-zinc-300"><span className="text-white">Overall Score:</span> 🟢 85/100</p>
        <p className="text-zinc-500 mt-3 mb-2">Breakdown:</p>
        <ul className="space-y-1 text-zinc-400">
          <li>• Prompt Quality: 🟢 88/100</li>
          <li>• Context Usage: 🟢 82/100</li>
          <li>• Iteration Skills: 🟢 85/100</li>
          <li>• Efficiency: 🟢 84/100</li>
        </ul>
        <p className="mt-3 text-zinc-300">Strong AI collaboration skills demonstrated.</p>
        <p className="mt-3 text-indigo-400">🔗 View Full Results</p>
      </div>

      <h2 className="text-lg font-semibold mb-4 mt-10">Troubleshooting</h2>
      
      <div className="space-y-6 mb-8">
        <div>
          <h3 className="font-medium text-white mb-2">Webhook not firing</h3>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 text-sm">
            <li>Verify the webhook is enabled in Greenhouse</li>
            <li>Check the endpoint URL includes your correct Company ID</li>
            <li>Ensure the webhook is set to &quot;Candidate has changed stage&quot;</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium text-white mb-2">Signature verification failing</h3>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 text-sm">
            <li>Confirm your webhook secret key matches in both Greenhouse and Telescopic</li>
            <li>Make sure there are no extra spaces in the secret key</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium text-white mb-2">Results not appearing in Greenhouse</h3>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 text-sm">
            <li>Confirm your Greenhouse API key has POST permission for Candidates</li>
            <li>Check that the candidate ID is correctly stored</li>
          </ul>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4 mt-10">Need Help?</h2>
      <p className="text-zinc-400">
        Contact us at{' '}
        <a href="mailto:support@telescopic.ca" className="text-white hover:underline">
          support@telescopic.ca
        </a>
      </p>
    </div>
  );
}
