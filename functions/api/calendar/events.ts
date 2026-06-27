import type { PagesFunction } from '@cloudflare/workers-types'

export const onRequest: PagesFunction = async ({ request }) => {
  const token = request.headers.get('X-Cal-Auth')
  if (!token) return Response.json({ error: 'Missing credentials' }, { status: 401 })

  const email = atob(token).split(':')[0]
  const user = email.split('@')[0]
  const calUrl = `https://caldav.fastmail.com/dav/calendars/user/${email}/`

  // First discover calendars
  const discoverResp = await fetch(calUrl, {
    method: 'PROPFIND',
    headers: {
      Authorization: `Basic ${token}`,
      Depth: '1',
      'Content-Type': 'application/xml',
    },
    body: `<?xml version="1.0"?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:displayname/>
    <c:calendar-home-set/>
  </d:prop>
</d:propfind>`,
  })

  if (!discoverResp.ok) {
    if (discoverResp.status === 401) return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    return Response.json({ error: `CalDAV error: ${discoverResp.status}` }, { status: 502 })
  }

  // Fetch events for the next 30 days
  const now = new Date()
  const future = new Date(now)
  future.setDate(now.getDate() + 30)

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const reportResp = await fetch(calUrl, {
    method: 'REPORT',
    headers: {
      Authorization: `Basic ${token}`,
      Depth: '1',
      'Content-Type': 'application/xml',
    },
    body: `<?xml version="1.0"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag/>
    <c:calendar-data/>
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${fmt(now)}" end="${fmt(future)}"/>
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`,
  })

  if (!reportResp.ok) {
    return Response.json({ error: `Calendar fetch error: ${reportResp.status}` }, { status: 502 })
  }

  const xml = await reportResp.text()
  const events = parseICalFromXml(xml)
  events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return Response.json({ events })
}

function parseICalFromXml(xml: string) {
  const events: Array<{
    uid: string; summary: string; start: string; end: string; allDay: boolean; location?: string
  }> = []

  const calDataBlocks = xml.match(/<[^:]*:calendar-data[^>]*>([\s\S]*?)<\/[^:]*:calendar-data>/g) ?? []

  for (const block of calDataBlocks) {
    const ical = block.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    const veventMatch = ical.match(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/)
    if (!veventMatch) continue

    const vevent = unfoldIcal(veventMatch[1])
    const get = (key: string) => {
      const m = vevent.match(new RegExp(`${key}(?:;[^:]*)?:(.+)`))
      return m?.[1]?.trim() ?? ''
    }

    const uid = get('UID')
    const summary = get('SUMMARY')
    const dtstart = get('DTSTART')
    const dtend = get('DTEND')
    const location = get('LOCATION') || undefined

    if (!summary || !dtstart) continue

    const allDay = dtstart.length === 8
    const start = allDay ? `${dtstart.slice(0,4)}-${dtstart.slice(4,6)}-${dtstart.slice(6,8)}` : parseICalDate(dtstart)
    const end = dtend ? (allDay ? `${dtend.slice(0,4)}-${dtend.slice(4,6)}-${dtend.slice(6,8)}` : parseICalDate(dtend)) : start

    events.push({ uid, summary, start, end, allDay, location })
  }

  return events
}

function unfoldIcal(text: string) {
  return text.replace(/\r?\n[ \t]/g, '')
}

function parseICalDate(s: string): string {
  // 20240115T090000Z or 20240115T090000
  const clean = s.replace(/[TZ]/g, (m) => m === 'T' ? 'T' : '')
  const y = s.slice(0, 4), mo = s.slice(4, 6), d = s.slice(6, 8)
  const h = s.slice(9, 11), mi = s.slice(11, 13), sec = s.slice(13, 15)
  return `${y}-${mo}-${d}T${h}:${mi}:${sec}${s.endsWith('Z') ? 'Z' : ''}`
}
