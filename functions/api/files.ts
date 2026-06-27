import type { PagesFunction } from '@cloudflare/workers-types'

interface Env {
  NEXTCLOUD_URL: string
  NEXTCLOUD_USER: string
  NEXTCLOUD_PASSWORD: string
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? '/'
  const davPath = `/remote.php/dav/files/${env.NEXTCLOUD_USER}${path}`
  const davUrl = `${env.NEXTCLOUD_URL}${davPath}`

  const auth = btoa(`${env.NEXTCLOUD_USER}:${env.NEXTCLOUD_PASSWORD}`)
  const resp = await fetch(davUrl, {
    method: 'PROPFIND',
    headers: {
      Authorization: `Basic ${auth}`,
      Depth: '1',
      'Content-Type': 'application/xml',
    },
    body: `<?xml version="1.0"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:displayname/>
    <d:resourcetype/>
    <d:getcontentlength/>
  </d:prop>
</d:propfind>`,
  })

  if (!resp.ok) {
    return Response.json({ error: `Nextcloud error: ${resp.status}` }, { status: 502 })
  }

  const xml = await resp.text()
  const items = parseWebDAV(xml, path, env.NEXTCLOUD_URL, env.NEXTCLOUD_USER)

  return Response.json({ items })
}

function parseWebDAV(xml: string, currentPath: string, baseUrl: string, user: string) {
  const responses = xml.match(/<d:response>([\s\S]*?)<\/d:response>/g) ?? []
  const items = []
  const baseDavPath = `/remote.php/dav/files/${user}`

  for (const res of responses) {
    const href = res.match(/<d:href>(.*?)<\/d:href>/)?.[1] ?? ''
    const decodedHref = decodeURIComponent(href)
    const itemPath = decodedHref.replace(baseDavPath, '')
    if (itemPath === currentPath || itemPath === currentPath + '/') continue

    const name = itemPath.split('/').filter(Boolean).pop() ?? ''
    const isDir = res.includes('<d:collection')
    const size = parseInt(res.match(/<d:getcontentlength>(\d+)<\/d:getcontentlength>/)?.[1] ?? '0')

    items.push({
      name,
      type: isDir ? 'dir' : 'file',
      size: isDir ? undefined : size,
      href: isDir ? undefined : `${baseUrl}/remote.php/webdav${itemPath}`,
    })
  }

  return items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}
