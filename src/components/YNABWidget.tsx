import { useState, useEffect } from 'react'
import { DollarSign, TrendingDown, Loader2 } from 'lucide-react'
import Widget from './Widget'

interface CategoryGroup {
  name: string
  budgeted: number
  activity: number
  balance: number
}

interface BudgetSummary {
  month: string
  toBudget: number
  budgeted: number
  activity: number
  groups: CategoryGroup[]
}

function formatMoney(milliunits: number) {
  const dollars = milliunits / 1000
  const abs = Math.abs(dollars)
  const str = abs.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return dollars < 0 ? `-$${str}` : `$${str}`
}

export default function YNABWidget() {
  const [data, setData] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/ynab/summary')
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
      title="Budget"
      icon={<DollarSign size={16} />}
      action={{ label: 'Open YNAB', href: 'https://app.ynab.com' }}
    >
      {loading && (
        <div className="flex items-center justify-center py-8 text-slate-500">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-950/40 rounded-lg p-3">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">To budget</p>
              <p className={`text-lg font-semibold ${data.toBudget < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatMoney(data.toBudget)}
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Spent</p>
              <p className="text-lg font-semibold text-slate-200 flex items-center gap-1">
                <TrendingDown size={14} className="text-orange-400" />
                {formatMoney(Math.abs(data.activity))}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Categories</p>
            <ul className="space-y-2">
              {data.groups.slice(0, 6).map(g => {
                const pct = g.budgeted > 0 ? Math.min(100, (Math.abs(g.activity) / g.budgeted) * 100) : 0
                return (
                  <li key={g.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 truncate max-w-[60%]">{g.name}</span>
                      <span className={g.balance < 0 ? 'text-red-400' : 'text-slate-400'}>
                        {formatMoney(g.balance)}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-orange-400' : 'bg-brand-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </Widget>
  )
}
