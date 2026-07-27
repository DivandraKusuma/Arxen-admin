import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            🛡️ Arxen
          </div>
          <span className="text-slate-400 text-sm font-medium tracking-wide ml-2">Dashboard</span>
        </div>
        <div className="flex gap-6">
          <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors font-medium">
            Overview
          </Link>
          <Link href="/quarantine" className="text-slate-300 hover:text-amber-400 transition-colors font-medium">
            Quarantine
          </Link>
        </div>
      </div>
    </nav>
  );
}
