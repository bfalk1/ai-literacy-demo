import Link from 'next/link';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                🎯 Telescopic
              </Link>
              <span className="ml-4 text-gray-500">Documentation</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                Docs
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="sticky top-8 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Getting Started
              </p>
              <Link 
                href="/docs" 
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Introduction
              </Link>
              
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Integrations
              </p>
              <Link 
                href="/docs/integrations/ashby" 
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Ashby
              </Link>
              <Link 
                href="/docs/integrations/greenhouse" 
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Greenhouse
              </Link>
              
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                API Reference
              </p>
              <Link 
                href="/docs/api" 
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                API Overview
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
