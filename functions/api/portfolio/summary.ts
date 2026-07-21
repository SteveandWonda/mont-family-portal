import type { PagesFunction } from '@cloudflare/workers-types'

interface Env {
  PLANE_API_KEY: string
  PLANE_BASE_URL: string
  PLANE_WORKSPACE_SLUG: string
  ACTUAL_SERVER_URL: string
  ACTUAL_PASSWORD: string
}

interface PlaneProject {
  id: string
  name: string
  start_date: string | null
  target_date: string | null
  total_issues?: number
  completed_issues?: number
}

interface ActualAccount {
  id: string
  name: string
  balance: number
  offbudget?: boolean
  closed?: boolean
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

async function getPlaneProjects(env: Env): Promise<PlaneProject[]> {
  const resp = await fetch(
    `${env.PLANE_BASE_URL}/api/v1/workspaces/${env.PLANE_WORKSPACE_SLUG}/projects/`,
    { headers: { 'X-API-Key': env.PLANE_API_KEY } }
  )
  if (!resp.ok) throw new Error(`Plane error: ${resp.status}`)
  const data = (await resp.json()) as any
  const results = Array.isArray(data) ? data : data.results ?? []
  return results.map((p: any) => ({
    id: p.id,
    name: p.name,
    start_date: p.start_date ?? null,
    target_date: p.target_date ?? null,
    total_issues: p.total_issues,
    completed_issues: p.completed_issues,
  }))
}

async function getActualAccounts(env: Env): Promise<ActualAccount[]> {
  const loginResp = await fetch(`${env.ACTUAL_SERVER_URL}/account/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginMethod: 'password', password: env.ACTUAL_PASSWORD }),
  })
  if (!loginResp.ok) throw new Error(`Actual login failed: ${loginResp.status}`)
  const { data: loginData } = (await loginResp.json()) as any
  const token = loginData.token

  const budgetsResp = await fetch(`${env.ACTUAL_SERVER_URL}/budgets`, {
    headers: { 'X-ACTUAL-TOKEN': token },
  })
  if (!budgetsResp.ok) throw new Error(`Actual budgets failed: ${budgetsResp.status}`)
  const { data: budgets } = (await budgetsResp.json()) as any
  if (!budgets?.length) return []
  const budgetId = budgets[0].id

  const accountsResp = await fetch(`${env.ACTUAL_SERVER_URL}/budgets/${budgetId}/accounts`, {
    headers: { 'X-ACTUAL-TOKEN': token },
  })
  if (!accountsResp.ok) throw new Error(`Actual accounts failed: ${accountsResp.status}`)
  const { data: accounts } = (await accountsResp.json()) as any
  return accounts
}

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  const [projectsResult, accountsResult] = await Promise.allSettled([
    getPlaneProjects(env),
    getActualAccounts(env),
  ])

  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : []
  const accounts = accountsResult.status === 'fulfilled' ? accountsResult.value : []
  const errors: string[] = []
  if (projectsResult.status === 'rejected') errors.push(`Plane: ${projectsResult.reason}`)
  if (accountsResult.status === 'rejected') errors.push(`Actual: ${accountsResult.reason}`)

  const items = projects.map(p => {
    const pNorm = normalize(p.name)
    const match = accounts.find(a => {
      const aNorm = normalize(a.name)
      return aNorm.includes(pNorm) || pNorm.includes(aNorm)
    })
    const progress =
      p.total_issues && p.total_issues > 0
        ? Math.round(((p.completed_issues ?? 0) / p.total_issues) * 100)
        : null

    return {
      id: p.id,
      name: p.name,
      startDate: p.start_date,
      targetDate: p.target_date,
      progress,
      budget: match ? { accountName: match.name, balance: match.balance } : null,
    }
  })

  return Response.json({ items, errors })
}
