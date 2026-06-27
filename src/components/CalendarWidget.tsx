import { useState, useEffect } from 'react'
import { CalendarDays, Loader2 } from 'lucide-react'
import Widget from './Widget'
import { useAuth } from '../auth'

interface CalEvent {
  uid: string
  summary: string
  start: string
  end: string
  allDay: boolean
  location?: string
}

function formatEventTime(event: CalEvent) {
  if (event.allDay) return 'All day'
  const start = new Date(event.start)
  return start.toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' })
}

function groupByDate(events: CalEvent[]) {
  const groups: Record<string, CalEvent[]> = {}
  for (const e of events) {
    const key = new Date(e.start).toDateString()
    ;(groups[key] ??= []).push(e)
  }
  return Object.entries(groups)
}

export default function CalendarWidget() {
  const { session } = useAuth()
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    setLoading(true)
    setError(null)
    fetch('/api/calendar/events', {
      headers: { 'X-Cal-Auth': session.token },
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setEvents(d.events ?? [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [session])

  return (
    <Widget
      title="Calendar"
      icon={<CalendarDays size={16} />}
      action={{ label: 'Open Fastmail', href: 'https://app.fastmail.com/calendar' }}
    >
      {loading && (
        <div className="flex items-center justify-center py-8 text-slate-500">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-950/40 rounded-lg p-3">{error}</div>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-sm text-slate-600 text-center py-6">No upcoming events</p>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="space-y-4">
          {groupByDate(events).map(([dateKey, dayEvents]) => (
            <div key={dateKey}>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">
                {formatEventDate(dayEvents[0].start)}
              </p>
              <ul className="space-y-1.5">
                {dayEvents.map(ev => (
                  <li
                    key={ev.uid}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/50"
                  >
                    <div className="w-1 self-stretch rounded-full bg-brand-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 truncate">{ev.summary}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatEventTime(ev)}</p>
                      {ev.location && (
                        <p className="text-xs text-slate-600 mt-0.5 truncate">{ev.location}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Widget>
  )
}
