import { useState, useEffect } from 'react'
import { FolderKanban, Loader2 } from 'lucide-react'
import Widget from './Widget'

interface ProjectItem {
  id: string
  name: string
  startDate: string | null
  targetDate: string | null
  progress: number | null
  budget: { accountName: string; balance: number } | null
}

interface Summary {
  items: ProjectItem[]
  errors: string[]
}

function formatMoney(milliunits: number) {
  const dollars = milliunits / 1000
  const abs = Math.abs(dollars)
  const str = abs.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return dollars < 0 ? `-$${str}` : `$${str}`
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function DateBadge({ targetDate }: { targetDate: string | null }) {
  if (!targetDate) return <span className="text-xs text-slate-600">No target date</span>
  const days = daysUntil(targetDate)
  const label = new Date(targetDate).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const color = days < 0 ? 'text-red-400' : days <= 30 ? 'text-orange-400' : 'text-slate-400'
  const suffix = days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`
  return (
    <span className={`text-xs ${color}`}>
      {label} · {suffix}
    </span>
  )
}

export default function ProjectsWidget() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/portfolio/summary')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Widget
      title="Projects"
      icon={<FolderKanban size={16} />}
      action={{ label: 'Open Plane', href: 'https://projects.mont.family' }}
      className="md:col-span-2 xl:col-span-3"
    >
      {loading && (
        <div className="flex items-center justify-center py-8 text-slate-500">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {error && <div className="text-xs text-red-400 bg-red-950/40 rounded-lg p-3">{error}</div>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.items.map(item => (
            <div key={item.id} className="bg-slate-800/60 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-200 truncate mb-2">{item.name}</p>
              <DateBadge targetDate={item.targetDate} />
              {item.progress !== null && (
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
              {item.budget && (
                <p className="text-xs text-slate-400 mt-2">
                  {item.budget.accountName}:{' '}
                  <span className={item.budget.balance < 0 ? 'text-red-400' : 'text-emerald-400'}>
                    {formatMoney(item.budget.balance)}
                  </span>
                </p>
              )}
            </div>
          ))}
          {data.errors.length > 0 && (
            <div className="text-xs text-orange-400 bg-orange-950/30 rounded-lg p-3 md:col-span-2 xl:col-span-3">
              {data.errors.join(' · ')}
            </div>
          )}
        </div>
      )}
    </Widget>
  )
}
