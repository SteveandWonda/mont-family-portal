import { useState, useEffect } from 'react'
import { Folder, File, ChevronRight, Loader2 } from 'lucide-react'
import Widget from './Widget'

interface FileItem {
  name: string
  type: 'dir' | 'file'
  size?: number
  href: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default function FilesWidget() {
  const [items, setItems] = useState<FileItem[]>([])
  const [path, setPath] = useState('/')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/files?path=${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setItems(data.items ?? [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [path])

  const pathParts = path.split('/').filter(Boolean)

  return (
    <Widget
      title="Family Files"
      icon={<Folder size={16} />}
      action={{ label: 'Open Nextcloud', href: 'https://cloud.mont.family' }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-3 flex-wrap">
        <button onClick={() => setPath('/')} className="hover:text-slate-300">Files</button>
        {pathParts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={12} />
            <button
              onClick={() => setPath('/' + pathParts.slice(0, i + 1).join('/'))}
              className="hover:text-slate-300"
            >
              {part}
            </button>
          </span>
        ))}
      </div>

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
        <ul className="space-y-1">
          {path !== '/' && (
            <li>
              <button
                onClick={() => setPath('/' + pathParts.slice(0, -1).join('/'))}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <Folder size={14} className="opacity-50" />
                ..
              </button>
            </li>
          )}
          {items.map(item => (
            <li key={item.name}>
              {item.type === 'dir' ? (
                <button
                  onClick={() => setPath(path.replace(/\/$/, '') + '/' + item.name)}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Folder size={14} className="text-brand-500 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              ) : (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <File size={14} className="text-slate-500 shrink-0" />
                  <span className="truncate flex-1">{item.name}</span>
                  {item.size !== undefined && (
                    <span className="text-xs text-slate-600 shrink-0">{formatSize(item.size)}</span>
                  )}
                </a>
              )}
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-sm text-slate-600 py-4 text-center">Empty folder</li>
          )}
        </ul>
      )}
    </Widget>
  )
}
