export default function LeverDocsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Lever Integration</h1>
      
      <p className="text-lg text-zinc-400 mb-6">
        Connect Telescopic to Lever to automatically send AI literacy assessments when 
        candidates reach a specific interview stage.
      </p>

      <div className="bg-indigo-950/50 border border-indigo-900 rounded-lg px-4 py-3 mb-8">
        <p className="text-indigo-300 text-sm">⏱️ Setup time: ~10 minutes</p>
      </div>

      <h2 className="text-lg font-semibold mb-4 mt-10">Prerequisites</h2>
      <ul className="list-disc list-inside space-y-2 text-zinc-400 mb-8">
        <li>Admin access to your Lever account</li>
        <li>A Telescopic account with API access</li>
      </ul>

      <h2 className="text-lg font-semibold mb-4 mt-10">Step 1: Set Up Webhook in Lever</h2>
      <p className="text-zinc-400 mb-4">
        Webhooks notify Telescopic when candidates move between interview stages.
      </p>
      
      <ol className="list-decimal list-inside space-y-3 text-zinc-400 mb-4">
        <li>In Lever, go to <span className="text-white">Settings → Integrations and API → Webhooks</span></li>
        <li>Find <span className="text-white">Candidate Stage Change</span> section</li>
        <li>Enable the webhook toggle</li>
        <li>Paste your webhook URL:</li>
      </ol>

      <div className="bg-indigo-950/50 border border-indigo-900 rounded-lg p-4 mb-4">
        <p className="text-indigo-300 text-sm mb-2">📋 Get your webhook URL:</p>
        <p className="text-zinc-300 text-sm">
          Go to your <a href="/dashboard" className="text-white underline hover:text-indigo-300">Telescopic Dashboard</a> → <span className="text-white">Settings</span> tab → copy the <span className="text-white">Lever Webhook URL</span>
        </p>
      </div>

      <ol className="list-decimal list-inside space-y-3 text-zinc-400 mb-8" start={5}>
        <li>Click <span className="text-white">Save</span></li>
      </ol>

      <div className="bg-amber-950/50 border border-amber-900 rounded-lg px-4 py-3 mb-8">
        <p className="text-amber-300 text-sm">
          💡 Optional: Generate a signing token in Lever for webhook verification. Add it to your Telescopic settings for extra security.
        </p>
      </div>

      <h2 className="text-lg font-semibold mb-4 mt-10">Step 2: Create an Assessment Stage</h2>
      <p className="text-zinc-400 mb-4">
        Add an interview stage that will trigger assessments:
      </p>
      <ol className="list-decimal list-inside space-y-3 text-zinc-400 mb-8">
        <li>In Lever, go to <span className="text-white">Settings → Stages and Pipelines</span></li>
        <li>Click <span className="text-white">Add Stage</span></li>
        <li>Name it <span className="text-white">Assessment</span></li>
        <li>Position it where you want candidates to take the assessment</li>
      </ol>

      <h2 className="text-lg font-semibold mb-4 mt-10">Step 3: Test the Integration</h2>
      <ol className="list-decimal list-inside space-y-3 text-zinc-400 mb-8">
        <li>Move a test candidate to your Assessment stage</li>
        <li>Check that they receive an email with the assessment link</li>
        <li>Complete the assessment</li>
        <li>Verify results appear as a note on the candidate&apos;s profile in Lever</li>
      </ol>

      <h2 className="text-lg font-semibold mb-4 mt-10">How It Works</h2>
      
      <div className="bg-zinc-900 rounded-lg p-6 mb-8">
        <div className="space-y-4">
          {[
            { step: 1, title: 'Candidate moves to Assessment stage', desc: 'Recruiter moves candidate in Lever' },
            { step: 2, title: 'Lever sends webhook to Telescopic', desc: 'Automatic, happens instantly' },
            { step: 3, title: 'Candidate receives assessment email', desc: 'Unique link valid for 72 hours' },
            { step: 4, title: 'Candidate completes assessment', desc: '~15-20 minutes' },
            { step: 5, title: 'Results pushed to Lever', desc: 'Appears as note on candidate profile' },
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

      <h2 className="text-lg font-semibold mb-4 mt-10">Results in Lever</h2>
      <p className="text-zinc-400 mb-4">
        After completion, results appear as a note on the candidate&apos;s profile:
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
            <li>Verify the webhook is enabled in Lever settings</li>
            <li>Check the URL includes your correct Company ID</li>
            <li>Make sure &quot;Candidate Stage Change&quot; is enabled</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium text-white mb-2">Results not appearing in Lever</h3>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 text-sm">
            <li>Confirm your Lever API key is configured in Telescopic</li>
            <li>Check that the API key has permission to add notes</li>
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
