import type { PagesFunction } from '@cloudflare/workers-types'

interface Env {
  YNAB_TOKEN: string
  YNAB_BUDGET_ID: string
}

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  const month = new Date().toISOString().slice(0, 7) + '-01'
  const resp = await fetch(
    `https://api.ynab.com/v1/budgets/${env.YNAB_BUDGET_ID}/months/${month}`,
    { headers: { Authorization: `Bearer ${env.YNAB_TOKEN}` } }
  )

  if (!resp.ok) {
    return Response.json({ error: `YNAB error: ${resp.status}` }, { status: 502 })
  }

  const { data } = await resp.json() as any
  const m = data.month

  const groups = (m.categories as any[])
    .reduce((acc: any[], cat: any) => {
      const existing = acc.find(g => g.name === cat.category_group_name)
      if (existing) {
        existing.budgeted += cat.budgeted
        existing.activity += cat.activity
        existing.balance += cat.balance
      } else {
        acc.push({
          name: cat.category_group_name,
          budgeted: cat.budgeted,
          activity: cat.activity,
          balance: cat.balance,
        })
      }
      return acc
    }, [])
    .filter(g => g.budgeted !== 0 && !g.name.startsWith('Internal'))
    .sort((a, b) => Math.abs(b.activity) - Math.abs(a.activity))

  return Response.json({
    month: m.month,
    toBudget: m.to_be_budgeted,
    budgeted: m.budgeted,
    activity: m.activity,
    groups,
  })
}
