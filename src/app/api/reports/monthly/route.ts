import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getBillTypeLabel, getMonthName, getExpenseCategoryLabel } from '@/lib/utils'
import { escapeHtml } from '@/lib/security'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const month = Number(searchParams.get('month') || new Date().getMonth() + 1)
  const year = Number(searchParams.get('year') || new Date().getFullYear())

  const bId = session.user.buildingId!

  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth   = new Date(year, month, 0, 23, 59, 59, 999)

  const [bills, expenses, units, building, fundBalances, priorBills, priorExpenses] = await Promise.all([
    prisma.bill.findMany({
      where: { month, year, buildingId: bId },
      include: { unit: { include: { tenant: { select: { name: true } } } } },
      orderBy: { unit: { number: 'asc' } },
    }),
    prisma.expense.findMany({ where: { date: { gte: startOfMonth, lte: endOfMonth }, buildingId: bId }, orderBy: { date: 'asc' } }),
    prisma.unit.findMany({ where: { buildingId: bId }, orderBy: { number: 'asc' } }),
    prisma.building.findUnique({ where: { id: bId }, select: { name: true, address: true } }),
    prisma.fundBalance.findMany({ where: { buildingId: bId } }),
    // All paid building-fund bills before this month (excludes rent)
    prisma.bill.findMany({
      where: {
        buildingId: bId,
        status: 'PAID',
        type: { not: 'RENT' },
        OR: [{ year: { lt: year } }, { year, month: { lt: month } }],
      },
      select: { amount: true },
    }),
    // All expenses before this month
    prisma.expense.findMany({
      where: { buildingId: bId, date: { lt: startOfMonth } },
      select: { amount: true },
    }),
  ])

  // Sort bills by flat number numerically (Prisma sorts lexicographically)
  bills.sort((a, b) => a.unit.number.localeCompare(b.unit.number, undefined, { numeric: true }))

  // ── Closing balance calculation ────────────────────────────
  const fundBalanceTotal   = fundBalances.reduce((s, f) => s + Number(f.amount), 0)
  const priorCollectedSum  = priorBills.reduce((s, b) => s + Number(b.amount), 0)
  const priorExpensesSum   = priorExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const openingBalance     = fundBalanceTotal + priorCollectedSum - priorExpensesSum

  const thisMonthCollected = bills.filter(b => b.type !== 'RENT' && b.status === 'PAID').reduce((s, b) => s + Number(b.amount), 0)
  const thisMonthExpenses  = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const closingBalance     = openingBalance + thisMonthCollected - thisMonthExpenses

  // ── Totals for summary cards ───────────────────────────────
  const totalCollected = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + Number(b.amount), 0)
  const totalDue       = bills.filter(b => b.status !== 'PAID').reduce((s, b) => s + Number(b.amount), 0)
  const totalExpenses  = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const netIncome      = thisMonthCollected - thisMonthExpenses

  const buildingName = escapeHtml(building?.name || 'Building Management')
  const buildingAddress = escapeHtml(building?.address || '')
  const safeMonthName = escapeHtml(getMonthName(month))
  const safeYear = escapeHtml(String(year))
  const fmt = (n: number) => `৳${new Intl.NumberFormat('en-BD').format(Math.round(n))}`
  const generatedAt = new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })

  const billRows = bills.map(b => {
    const isDue = b.status !== 'PAID'
    const safeTenant = b.unit.tenant?.name ? escapeHtml(b.unit.tenant.name) : '<span class="muted">Vacant</span>'
    const safeUnit = escapeHtml(b.unit.number)
    const safeType = escapeHtml(getBillTypeLabel(b.type))
    const safeStatus = escapeHtml(b.status)
    const safeStatusLower = escapeHtml(b.status.toLowerCase())
    return `
    <tr class="${isDue ? 'due-row' : ''}">
      <td>${safeUnit}</td>
      <td>${safeTenant}</td>
      <td>${safeType}</td>
      <td class="amount">${fmt(Number(b.amount))}</td>
      <td><span class="badge badge-${safeStatusLower}">${safeStatus}</span></td>
      <td>${b.paidAt ? new Date(b.paidAt).toLocaleDateString('en-BD') : '—'}</td>
    </tr>
  `}).join('')

  const expenseRows = expenses.map(e => `
    <tr>
      <td>${escapeHtml(e.title)}</td>
      <td>${escapeHtml(getExpenseCategoryLabel(e.category))}</td>
      <td class="muted">${new Date(e.date).toLocaleDateString('en-BD')}</td>
      <td class="amount expense">${fmt(Number(e.amount))}</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Monthly Report — ${safeMonthName} ${safeYear}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;font-size:13px;color:#1a1917;background:#fff;padding:40px;max-width:900px;margin:0 auto}
  h1{font-family:'DM Serif Display',serif;font-size:28px;color:#1e3a5f}
  h2{font-family:'DM Serif Display',serif;font-size:18px;color:#1e3a5f;margin:32px 0 12px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1e3a5f;padding-bottom:20px;margin-bottom:28px}
  .building-name{font-family:'DM Serif Display',serif;font-size:24px;color:#1e3a5f;line-height:1.2}
  .building-address{font-size:12px;color:#6b6860;margin-top:4px}
  .report-title{text-align:right}
  .period{font-size:20px;font-weight:600;color:#1e3a5f}
  .generated{font-size:11px;color:#9c9890;margin-top:4px}
  .summary{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:32px}
  .stat{background:#f5f4f0;border-radius:10px;padding:14px 16px}
  .stat-label{font-size:10px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#9c9890;margin-bottom:6px}
  .stat-value{font-family:'DM Serif Display',serif;font-size:19px;color:#1e3a5f}
  .stat-value.green{color:#15803d}
  .stat-value.red{color:#dc2626}
  .stat-value.amber{color:#d97706}
  table{width:100%;border-collapse:collapse;margin-bottom:8px}
  th{text-align:left;padding:8px 12px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#9c9890;border-bottom:1px solid #e8e6e0;background:#f5f4f0}
  td{padding:10px 12px;border-bottom:1px solid #e8e6e0;font-size:13px}
  tr:last-child td{border-bottom:none}
  .amount{text-align:right;font-weight:600}
  .expense{color:#dc2626}
  .muted{color:#9c9890}
  .due-row td{color:#dc2626;font-weight:500}
  .due-row td.muted{color:#ef9999}
  .badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
  .badge-paid{background:#f0fdf4;color:#15803d}
  .badge-pending{background:#fef2f2;color:#dc2626}
  .badge-overdue{background:#fef2f2;color:#dc2626}
  .balance-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:0;background:#1e3a5f;border-radius:10px;overflow:hidden;margin:24px 0}
  .balance-cell{padding:16px 18px;border-right:1px solid rgba(255,255,255,0.12)}
  .balance-cell:last-child{border-right:none}
  .balance-label{font-size:10px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.55);margin-bottom:6px}
  .balance-value{font-family:'DM Serif Display',serif;font-size:20px;color:#fff}
  .balance-value.green{color:#86efac}
  .balance-value.red{color:#fca5a5}
  .footer{border-top:1px solid #e8e6e0;padding-top:16px;margin-top:32px;font-size:11px;color:#9c9890;text-align:center;line-height:1.7}
  @media print{body{padding:20px}.no-print{display:none}}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="building-name">${buildingName}</div>
    ${buildingAddress ? `<div class="building-address">${buildingAddress}</div>` : ''}
  </div>
  <div class="report-title">
    <div class="period">Monthly Financial Report</div>
    <div style="font-size:16px;color:#6b6860;margin-top:2px">${safeMonthName} ${safeYear}</div>
    <div class="generated">Generated on ${generatedAt}</div>
  </div>
</div>

<div class="summary">
  <div class="stat">
    <div class="stat-label">Collected</div>
    <div class="stat-value green">${fmt(totalCollected)}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Outstanding</div>
    <div class="stat-value red">${fmt(totalDue)}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Expenses</div>
    <div class="stat-value red">${fmt(totalExpenses)}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Net (Fund)</div>
    <div class="stat-value ${netIncome >= 0 ? 'green' : 'red'}">${fmt(netIncome)}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Total Units</div>
    <div class="stat-value">${units.length}</div>
  </div>
</div>

<div class="balance-bar">
  <div class="balance-cell">
    <div class="balance-label">Opening Balance</div>
    <div class="balance-value ${openingBalance >= 0 ? 'green' : 'red'}">${fmt(openingBalance)}</div>
  </div>
  <div class="balance-cell">
    <div class="balance-label">+ Collected (Fund)</div>
    <div class="balance-value green">${fmt(thisMonthCollected)}</div>
  </div>
  <div class="balance-cell">
    <div class="balance-label">− Expenses</div>
    <div class="balance-value red">${fmt(thisMonthExpenses)}</div>
  </div>
  <div class="balance-cell">
    <div class="balance-label">Closing Balance</div>
    <div class="balance-value ${closingBalance >= 0 ? 'green' : 'red'}">${fmt(closingBalance)}</div>
  </div>
</div>

<h2>Bill Collection — ${getMonthName(month)} ${year}</h2>
<table>
  <thead><tr><th>Unit</th><th>Tenant</th><th>Bill Type</th><th style="text-align:right">Amount</th><th>Status</th><th>Paid On</th></tr></thead>
  <tbody>${billRows || '<tr><td colspan="6" style="text-align:center;color:#9c9890;padding:20px">No bills this month</td></tr>'}</tbody>
</table>

<h2>Expenses — ${getMonthName(month)} ${year}</h2>
<table>
  <thead><tr><th>Title</th><th>Category</th><th>Date</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${expenseRows || '<tr><td colspan="4" style="text-align:center;color:#9c9890;padding:20px">No expenses this month</td></tr>'}</tbody>
</table>

<div class="footer">
  This report was automatically generated for ${buildingName}${buildingAddress ? ` · ${buildingAddress}` : ''}.<br/>
  ${getMonthName(month)} ${year} · Total bills: ${bills.length} · Total expenses: ${expenses.length}
</div>

<script>window.onload = () => window.print()</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
