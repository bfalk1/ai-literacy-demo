import Link from 'next/link';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xs font-semibold tracking-widest text-zinc-500">
                TELESCOPIC
              </Link>
              <span className="text-zinc-600">|</span>
              <span className="text-sm text-zinc-400">Documentation</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Docs
              </Link>
              <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 hidden md:block">
            <nav className="sticky top-10 space-y-6">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Getting Started
                </p>
                <div className="space-y-1">
                  <Link 
                    href="/docs" 
                    className="block px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors"
                  >
                    Introduction
                  </Link>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Integrations
                </p>
                <div className="space-y-1">
                  <Link 
                    href="/docs/integrations/ashby" 
                    className="block px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors"
                  >
                    Ashby
                  </Link>
                  <Link 
                    href="/docs/integrations/greenhouse" 
                    className="block px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors"
                  >
                    Greenhouse
                  </Link>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
