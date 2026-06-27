import { Home } from 'lucide-react'

export default function Header() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Home size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">mont.family</span>
        </div>
        <p className="text-sm text-slate-400">{greeting}</p>
      </div>
    </header>
  )
}
