import type { PagesFunction } from '@cloudflare/workers-types'

interface Env {
  GITEA_URL: string
  GITEA_TOKEN: string
}

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  const resp = await fetch(`${env.GITEA_URL}/api/v1/repos/search?limit=10&sort=updated`, {
    headers: { Authorization: `token ${env.GITEA_TOKEN}` },
  })

  if (!resp.ok) {
    return Response.json({ error: `Gitea error: ${resp.status}` }, { status: 502 })
  }

  const { data } = await resp.json() as any
  const repos = data.map((r: any) => ({
    name: r.name,
    description: r.description ?? '',
    updated: r.updated,
    url: r.html_url,
    stars: r.stars_count,
    language: r.language ?? null,
  }))

  return Response.json({ repos })
}
