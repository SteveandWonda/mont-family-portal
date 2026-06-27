import { useState, useEffect } from 'react'
import { GitBranch, Loader2 } from 'lucide-react'
import Widget from './Widget'

interface Repo {
  name: string
  description: string
  updated: string
  url: string
  stars: number
  language: string | null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-green-500',
  Go: 'bg-cyan-400',
}

export default function GiteaWidget() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/gitea/repos')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setRepos(d.repos ?? [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Widget
      title="Repos"
      icon={<GitBranch size={16} />}
      action={{ label: 'Open Gitea', href: 'https://git.mont.family' }}
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

      {!loading && !error && (
        <ul className="space-y-3">
          {repos.map(repo => (
            <li key={repo.name}>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-200 truncate">{repo.name}</p>
                  <span className="text-xs text-slate-600 shrink-0">{timeAgo(repo.updated)}</span>
                </div>
                {repo.description && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{repo.description}</p>
                )}
                {repo.language && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`w-2 h-2 rounded-full ${LANG_COLORS[repo.language] ?? 'bg-slate-500'}`} />
                    <span className="text-xs text-slate-500">{repo.language}</span>
                  </div>
                )}
              </a>
            </li>
          ))}
          {repos.length === 0 && (
            <li className="text-sm text-slate-600 text-center py-4">No repos yet</li>
          )}
        </ul>
      )}
    </Widget>
  )
}
