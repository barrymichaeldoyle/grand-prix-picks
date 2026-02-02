import { Link } from '@tanstack/react-router';

import ClerkHeader from '../integrations/clerk/header-user.tsx';

import { Flag } from 'lucide-react';

export default function Header() {
  return (
    <header className="px-4 py-3 flex items-center justify-between bg-slate-800 text-white shadow-lg border-b border-slate-700">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <Flag className="w-6 h-6 text-cyan-400" />
          <span className="text-xl font-bold tracking-tight">
            Grand Prix Picks
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <Link
            to="/"
            className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium"
            activeProps={{
              className:
                'px-3 py-2 rounded-lg bg-slate-700 text-white transition-colors text-sm font-medium',
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          <Link
            to="/races"
            className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium"
            activeProps={{
              className:
                'px-3 py-2 rounded-lg bg-slate-700 text-white transition-colors text-sm font-medium',
            }}
          >
            Races
          </Link>
          <Link
            to="/leaderboard"
            className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium"
            activeProps={{
              className:
                'px-3 py-2 rounded-lg bg-slate-700 text-white transition-colors text-sm font-medium',
            }}
          >
            Leaderboard
          </Link>
          <Link
            to="/my-predictions"
            className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium"
            activeProps={{
              className:
                'px-3 py-2 rounded-lg bg-slate-700 text-white transition-colors text-sm font-medium',
            }}
          >
            My Picks
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <ClerkHeader />
      </div>
    </header>
  );
}
