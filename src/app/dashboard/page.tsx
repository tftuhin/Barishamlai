import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, getMonthName, getBillTypeLabel } from '@/lib/utils'
import { Card, StatCard, Badge } from '@/components/ui'
import { FloorMapClient } from './FloorMapClient'
import { DashboardFundCards } from './DashboardFundCards'
import Link from 'next/link'

async function getDashboardData(role: string, userId: string, buildingId: string | null) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const bId = buildingId ?? undefined

  if (role === 'ADMIN') {
    const [totalUnits, occupiedCount, vacantCount, bills, expenses, recentMessages, pendingCount, overdueCount, unitsWithBills, config] = await Promise.all([
      prisma.unit.count({ where: { buildingId: bId } }),
      prisma.unit.count({ where: { status: 'OCCUPIED', buildingId: bId } }),
      prisma.unit.count({ where: { status: 'VACANT', buildingId: bId } }),
      prisma.bill.findMany({ where: { month, year, buildingId: bId }, include: { unit: true } }),
      prisma.expense.findMany({ where: { month, year, buildingId: bId } }),
      prisma.message.findMany({ where: { buildingId: bId }, orderBy: { createdAt: 'desc' }, take: 5, include: { sender: true } }),
      prisma.bill.count({ where: { month, year, status: 'PENDING', buildingId: bId } }),
      prisma.bill.count({ where: { month, year, status: 'OVERDUE', buildingId: bId } }),
      prisma.unit.findMany({
        where: { buildingId: bId },
        orderBy: [{ floor: 'asc' }, { number: 'asc' }],
        include: {
          bills: { orderBy: [{ year: 'desc' }, { month: 'desc' }] },
          owner: { select: { name: true } },
          tenant: { select: { name: true } },
        },
      }),
      prisma.buildingConfig.findUnique({ where: { id: bId ?? 'none' } }),
    ])
    const collected = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.amount, 0)
    const totalDue = bills.reduce((s, b) => s + b.amount, 0)
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
    const unitsForMap = unitsWithBills.map(u => ({
      ...u,
      bills: u.bills.map(b => ({
        ...b,
        dueDate: b.dueDate.toISOString(),
        paidAt: b.paidAt?.toISOString() ?? null,
        createdAt: undefined,
        updatedAt: undefined,
      })),
      createdAt: undefined,
      updatedAt: undefined,
    }))
    const enabledModules = {
      featureServiceCharge:     config?.featureServiceCharge     ?? true,
      featureGas:               config?.featureGas               ?? true,
      featureWater:             (config as any)?.featureWater             ?? false,
      featureGarbage:           (config as any)?.featureGarbage           ?? false,
      featureCommunitySecurity: (config as any)?.featureCommunitySecurity ?? false,
      featureRent:              config?.featureRent              ?? true,
    }
    return { role, totalUnits, occupiedCount, vacantCount, bills, collected, totalDue, totalExpenses, recentMessages, pendingCount, overdueCount, month, year, unitsForMap, enabledModules }
  }

  if (role === 'OWNER') {
    const ownerUnits = await prisma.unit.findMany({ where: { ownerId: userId, buildingId: bId }, include: { tenant: true } })
    const unitIds = ownerUnits.map(u => u.id)
    const bills = unitIds.length > 0 ? await prisma.bill.findMany({ where: { unitId: { in: unitIds } }, orderBy: { createdAt: 'desc' }, take: 10 }) : []
    const receipts = unitIds.length > 0 ? await prisma.receipt.findMany({ where: { unitId: { in: unitIds } }, orderBy: { createdAt: 'desc' }, take: 5, include: { bill: true, recipient: true } }) : []
    const unit = ownerUnits[0] ?? null
    return { role, unit, units: ownerUnits, bills, receipts, month, year }
  }

  const unit = await prisma.unit.findFirst({ where: { tenantId: userId, buildingId: bId }, include: { owner: true } })
  const bills = unit ? await prisma.bill.findMany({ where: { unitId: unit.id }, orderBy: { createdAt: 'desc' }, take: 10 }) : []
  const messages = await prisma.messageRecipient.findMany({ where: { userId }, include: { message: { include: { sender: true } } }, orderBy: { createdAt: 'desc' }, take: 5 })
  return { role, unit, bills, messages, month, year }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  // Redirect ADMIN to onboarding wizard if not yet complete
  if (session.user.role === 'ADMIN' && session.user.buildingId) {
    const cfg = await prisma.buildingConfig.findUnique({
      where:  { id: session.user.buildingId },
      select: { onboardingComplete: true },
    })
    if (cfg && !cfg.onboardingComplete) {
      redirect('/dashboard/onboarding')
    }
  }

  const data = await getDashboardData(session.user.role, session.user.id, session.user.buildingId)

  return (
    <div className="page-content" style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--brand)', margin: 0 }}>
          Good day, {session.user.name.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          {getMonthName(data.month)} {data.year} — Building Management Overview
        </p>
      </div>

      {/* ADMIN VIEW */}
      {data.role === 'ADMIN' && (
        <>
          {/* Row 1: 4 main stats */}
          <div className="resp-grid-4" style={{ marginBottom: '1rem' }}>
            <StatCard label="Total Units" value={(data as any).totalUnits} icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            <StatCard label="Collected This Month" value={formatCurrency((data as any).collected)} sub={`of ${formatCurrency((data as any).totalDue)} total`} color="#15803d" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="Pending Bills" value={(data as any).pendingCount} sub={`${(data as any).overdueCount} overdue`} color="#d97706" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="Total Expenses" value={formatCurrency((data as any).totalExpenses)} sub="This month" color="#dc2626" icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </div>

          {/* Fund Summary Cards — all enabled modules with month/year selector */}
          <DashboardFundCards
            initialMonth={data.month}
            initialYear={data.year}
            enabledModules={(data as any).enabledModules}
          />

          {/* Row 2: Occupied vs Vacant */}
          <div className="resp-grid-2" style={{ marginBottom: '1.75rem' }}>
            <Card style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px' }}>Occupancy Status</p>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#15803d', lineHeight: 1 }}>{(data as any).occupiedCount}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Occupied</div>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d97706', lineHeight: 1 }}>{(data as any).vacantCount}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Vacant</div>
                </div>
                <div style={{ flex: 1 }}>
                  {/* Occupancy bar */}
                  <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px', background: '#15803d',
                      width: `${(data as any).totalUnits > 0 ? Math.round(((data as any).occupiedCount / (data as any).totalUnits) * 100) : 0}%`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                    {(data as any).totalUnits > 0 ? Math.round(((data as any).occupiedCount / (data as any).totalUnits) * 100) : 0}% occupancy
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick links */}
            <Card style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px' }}>Quick Links</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { href: '/dashboard/billing', label: '+ Add Bill' },
                  { href: '/dashboard/gas', label: 'Gas Matrix' },
                  { href: '/dashboard/expenses', label: '+ Expense' },
                  { href: '/dashboard/units', label: 'Manage Units' },
                ].map(l => (
                  <Link key={l.href} href={l.href} style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                    background: 'var(--surface-subtle)', color: 'var(--brand)',
                    border: '1px solid var(--border)', textDecoration: 'none',
                  }}>{l.label}</Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Floor map */}
          <div style={{ marginBottom: '1.5rem' }}>
            <FloorMapClient units={(data as any).unitsForMap} />
          </div>

          <div className="resp-grid-2">
            {/* Bill status */}
            <Card>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand)', margin: 0 }}>This Month's Bills</h3>
                <Link href="/dashboard/billing" style={{ fontSize: '13px', color: 'var(--brand)', textDecoration: 'none' }}>View all →</Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Unit</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {((data as any).bills as any[]).slice(0, 8).map((bill: any) => (
                      <tr key={bill.id}>
                        <td style={{ fontWeight: 500 }}>{bill.unit.number}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{getBillTypeLabel(bill.type)}</td>
                        <td>{formatCurrency(bill.amount)}</td>
                        <td><Badge status={bill.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recent messages */}
            <Card>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand)', margin: 0 }}>Recent Messages</h3>
                <Link href="/dashboard/messages" style={{ fontSize: '13px', color: 'var(--brand)', textDecoration: 'none' }}>Compose →</Link>
              </div>
              <div style={{ padding: '0.5rem' }}>
                {((data as any).recentMessages as any[]).length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No messages yet</p>
                ) : ((data as any).recentMessages as any[]).map((msg: any) => (
                  <div key={msg.id} style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '4px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{msg.subject}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{msg.isGlobal ? '🌐 All' : 'Direct'}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.body}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* OWNER VIEW */}
      {data.role === 'OWNER' && (
        <>
          {!(data as any).unit ? (
            <Card style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No unit assigned yet. Contact the admin.</p>
            </Card>
          ) : (
            <>
              <div className="resp-grid-3" style={{ marginBottom: '1.75rem' }}>
                <StatCard label="Unit" value={(data as any).unit.number} sub={`Floor ${(data as any).unit.floor}`} />
                <StatCard label="Monthly Rent" value={formatCurrency((data as any).unit.monthlyRent)} sub={(data as any).unit.tenant ? `Tenant: ${(data as any).unit.tenant.name}` : 'No tenant'} color="#15803d" />
                <StatCard label="Pending Bills" value={(data as any).bills.filter((b: any) => b.status !== 'PAID').length} sub="Awaiting payment" color="#d97706" />
              </div>
              <div className="resp-grid-2">
                <Card>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand)', margin: 0 }}>Recent Bills</h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead><tr><th>Type</th><th>Month</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {((data as any).bills as any[]).map((bill: any) => (
                          <tr key={bill.id}>
                            <td style={{ fontWeight: 500 }}>{getBillTypeLabel(bill.type)}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{getMonthName(bill.month)}</td>
                            <td>{formatCurrency(bill.amount)}</td>
                            <td><Badge status={bill.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <Card>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand)', margin: 0 }}>Issued Receipts</h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead><tr><th>To</th><th>Amount</th><th>Sent</th></tr></thead>
                      <tbody>
                        {((data as any).receipts as any[]).map((r: any) => (
                          <tr key={r.id}>
                            <td>{r.recipient?.name ?? '—'}</td>
                            <td>{formatCurrency(r.amount)}</td>
                            <td>{r.sentEmail ? '✅ Yes' : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </>
          )}
        </>
      )}

      {/* TENANT VIEW */}
      {data.role === 'TENANT' && (
        <>
          {!(data as any).unit ? (
            <Card style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No unit assigned. Contact the building admin.</p>
            </Card>
          ) : (
            <>
              <div className="resp-grid-3" style={{ marginBottom: '1.75rem' }}>
                <StatCard label="Your Unit" value={(data as any).unit.number} sub={`Floor ${(data as any).unit.floor}`} />
                <StatCard label="Monthly Rent" value={formatCurrency((data as any).unit.monthlyRent)} />
                <StatCard label="Pending Payments" value={(data as any).bills.filter((b: any) => b.status !== 'PAID').length} color="#d97706" />
              </div>
              <div className="resp-grid-2">
                <Card>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand)', margin: 0 }}>Your Bills</h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead><tr><th>Type</th><th>Month</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {((data as any).bills as any[]).map((b: any) => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 500 }}>{getBillTypeLabel(b.type)}</td>
                            <td>{getMonthName(b.month)}</td>
                            <td>{formatCurrency(b.amount)}</td>
                            <td><Badge status={b.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <Card>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand)', margin: 0 }}>Messages</h3>
                  </div>
                  {((data as any).messages as any[]).map((mr: any) => (
                    <div key={mr.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '2px' }}>{mr.message.subject}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mr.message.body}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>From: {mr.message.sender.name}</div>
                    </div>
                  ))}
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
