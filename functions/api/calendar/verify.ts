import type { PagesFunction } from '@cloudflare/workers-types'

export const onRequest: PagesFunction = async ({ request }) => {
  const token = request.headers.get('X-Cal-Auth')
  if (!token) return Response.json({ error: 'Missing credentials' }, { status: 401 })

  const resp = await fetch('https://caldav.fastmail.com/.well-known/caldav', {
    method: 'PROPFIND',
    headers: {
      Authorization: `Basic ${token}`,
      Depth: '0',
      'Content-Type': 'application/xml',
    },
    body: `<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>`,
    redirect: 'follow',
  })

  if (resp.status === 401 || resp.status === 403) {
    return Response.json({ error: 'Invalid email or app password' }, { status: 401 })
  }

  return Response.json({ ok: true })
}
