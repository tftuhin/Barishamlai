import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getBillTypeLabel, getMonthName, getExpenseCategoryLabel } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const month = Number(searchParams.get('month') || new Date().getMonth() + 1)
  const year = Number(searchParams.get('year') || new Date().getFullYear())

  const [bills, expenses, units] = await Promise.all([
    prisma.bill.findMany({
      where: { month, year },
      include: { unit: { include: { tenant: true } } },
      orderBy: { unit: { number: 'asc' } },
    }),
    prisma.expense.findMany({ where: { month, year }, orderBy: { date: 'asc' } }),
    prisma.unit.findMany({ orderBy: { number: 'asc' } }),
  ])

  const totalCollected = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalDue = bills.reduce((s, b) => s + b.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netIncome = totalCollected - totalExpenses
  const buildingName = process.env.NEXT_PUBLIC_BUILDING_NAME || 'Building Management'
  const fmt = (n: number) => `৳${new Intl.NumberFormat('en-BD').format(n)}`
  const generatedAt = new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })

  const billRows = bills.map(b => `
    <tr>
      <td>${b.unit.number}</td>
      <td>${b.unit.tenant?.name ?? '<span class="muted">Vacant</span>'}</td>
      <td>${getBillTypeLabel(b.type)}</td>
      <td class="amount">${fmt(b.amount)}</td>
      <td><span class="badge badge-${b.status.toLowerCase()}">${b.status}</span></td>
      <td class="muted">${b.paidAt ? new Date(b.paidAt).toLocaleDateString('en-BD') : '—'}</td>
    </tr>
  `).join('')

  const expenseRows = expenses.map(e => `
    <tr>
      <td>${e.title}</td>
      <td>${getExpenseCategoryLabel(e.category)}</td>
      <td class="muted">${new Date(e.date).toLocaleDateString('en-BD')}</td>
      <td class="amount expense">${fmt(e.amount)}</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Monthly Report — ${getMonthName(month)} ${year}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;font-size:13px;color:#1a1917;background:#fff;padding:40px;max-width:900px;margin:0 auto}
  h1{font-family:'DM Serif Display',serif;font-size:28px;color:#1e3a5f}
  h2{font-family:'DM Serif Display',serif;font-size:18px;color:#1e3a5f;margin:32px 0 12px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1e3a5f;padding-bottom:20px;margin-bottom:28px}
  .logo{font-family:'DM Serif Display',serif;font-size:22px;color:#1e3a5f}
  .subtitle{font-size:12px;color:#9c9890;margin-top:3px}
  .report-title{text-align:right}
  .period{font-size:20px;font-weight:600;color:#1e3a5f}
  .generated{font-size:11px;color:#9c9890;margin-top:4px}
  .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
  .stat{background:#f5f4f0;border-radius:10px;padding:16px 18px}
  .stat-label{font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#9c9890;margin-bottom:6px}
  .stat-value{font-family:'DM Serif Display',serif;font-size:22px;color:#1e3a5f}
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
  .badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
  .badge-paid{background:#f0fdf4;color:#15803d}
  .badge-pending{background:#fefce8;color:#a16207}
  .badge-overdue{background:#fef2f2;color:#dc2626}
  .net{background:#1e3a5f;color:#fff;border-radius:10px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin:24px 0}
  .net-label{font-size:13px;opacity:0.7}
  .net-value{font-family:'DM Serif Display',serif;font-size:26px;color:${netIncome >= 0 ? '#86efac' : '#fca5a5'}}
  .footer{border-top:1px solid #e8e6e0;padding-top:16px;margin-top:32px;font-size:11px;color:#9c9890;text-align:center;line-height:1.7}
  @media print{body{padding:20px}.no-print{display:none}}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">BuildingHQ</div>
    <div class="subtitle">${buildingName}</div>
  </div>
  <div class="report-title">
    <div class="period">Monthly Financial Report</div>
    <div style="font-size:16px;color:#6b6860;margin-top:2px">${getMonthName(month)} ${year}</div>
    <div class="generated">Generated on ${generatedAt}</div>
  </div>
</div>

<div class="summary">
  <div class="stat">
    <div class="stat-label">Total Collected</div>
    <div class="stat-value green">${fmt(totalCollected)}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Total Due</div>
    <div class="stat-value">${fmt(totalDue)}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Total Expenses</div>
    <div class="stat-value red">${fmt(totalExpenses)}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Total Units</div>
    <div class="stat-value">${units.length}</div>
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

<div class="net">
  <div>
    <div class="net-label">Net Income (Collected − Expenses)</div>
  </div>
  <div class="net-value">${fmt(netIncome)}</div>
</div>

<div class="footer">
  This report was automatically generated by BuildingHQ for ${buildingName}.<br/>
  ${getMonthName(month)} ${year} · Total bills: ${bills.length} · Total expenses: ${expenses.length}
</div>

<script>window.onload = () => window.print()</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
