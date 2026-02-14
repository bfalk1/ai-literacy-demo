import Link from 'next/link';

export default function DocsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Telescopic Documentation</h1>
      
      <p className="text-lg text-zinc-400 mb-8">
        Telescopic is an AI literacy assessment platform that helps companies evaluate 
        candidates&apos; ability to effectively collaborate with AI tools.
      </p>

      <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
      
      <ol className="list-decimal list-inside space-y-3 text-zinc-300 mb-10">
        <li>
          <span className="font-medium text-white">Connect your ATS</span>
          <span className="text-zinc-500"> — Set up Ashby or Greenhouse integration</span>
        </li>
        <li>
          <span className="font-medium text-white">Configure trigger stage</span>
          <span className="text-zinc-500"> — Choose which interview stage sends assessments</span>
        </li>
        <li>
          <span className="font-medium text-white">Candidates complete assessments</span>
          <span className="text-zinc-500"> — They receive an email with a link</span>
        </li>
        <li>
          <span className="font-medium text-white">Review results</span>
          <span className="text-zinc-500"> — Scores are pushed back to your ATS</span>
        </li>
      </ol>

      <h2 className="text-lg font-semibold mb-4">Integrations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Link 
          href="/docs/integrations/ashby"
          className="block p-5 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <h3 className="text-base font-semibold mb-2">Ashby</h3>
          <p className="text-sm text-zinc-500">
            Automatic assessment triggers and result syncing with Ashby.
          </p>
        </Link>
        
        <Link 
          href="/docs/integrations/greenhouse"
          className="block p-5 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <h3 className="text-base font-semibold mb-2">Greenhouse</h3>
          <p className="text-sm text-zinc-500">
            Automatic assessment triggers and result syncing with Greenhouse.
          </p>
        </Link>

        <Link 
          href="/docs/integrations/lever"
          className="block p-5 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <h3 className="text-base font-semibold mb-2">Lever</h3>
          <p className="text-sm text-zinc-500">
            Automatic assessment triggers and result syncing with Lever.
          </p>
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-4">What We Measure</h2>
      
      <div className="space-y-3 text-zinc-300 mb-10">
        <div className="flex gap-3">
          <span className="text-zinc-500">•</span>
          <div>
            <span className="font-medium text-white">Prompt Quality</span>
            <span className="text-zinc-500"> — How well candidates craft effective prompts</span>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="text-zinc-500">•</span>
          <div>
            <span className="font-medium text-white">Context Usage</span>
            <span className="text-zinc-500"> — Ability to provide relevant context to AI</span>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="text-zinc-500">•</span>
          <div>
            <span className="font-medium text-white">Iteration Skills</span>
            <span className="text-zinc-500"> — How candidates refine and improve outputs</span>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="text-zinc-500">•</span>
          <div>
            <span className="font-medium text-white">Efficiency</span>
            <span className="text-zinc-500"> — Achieving goals with minimal back-and-forth</span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
      <p className="text-zinc-400">
        Contact us at{' '}
        <a href="mailto:support@telescopic.ca" className="text-white hover:underline">
          support@telescopic.ca
        </a>
      </p>
    </div>
  );
}
