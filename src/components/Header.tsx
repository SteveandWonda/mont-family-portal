import { Home, LogOut } from 'lucide-react'
import { useAuth } from '../auth'

export default function Header() {
  const { session, logout } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const name = session?.email.split('@')[0] ?? ''

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Home size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">mont.family</span>
        </div>

        <p className="text-sm text-slate-400 hidden sm:block">
          {greeting}{name ? `, ${name}` : ''}
        </p>

        {session && (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        )}
      </div>
    </header>
  )
}
