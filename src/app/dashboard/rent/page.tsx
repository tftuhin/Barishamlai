import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { RentClient } from './RentClient'

const ALLOWED_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY', 'OWNER']

export default async function RentPage() {
  const session = await getServerSession(authOptions)
  if (!session || !ALLOWED_ROLES.includes(session.user.role)) redirect('/dashboard')

  const bId  = session.user.buildingId ?? 'main'
  const role = session.user.role
  const now  = new Date()

  const [units, rentBills, config] = await Promise.all([
    prisma.unit.findMany({
      where:   { buildingId: bId },
      include: { tenant: { select: { id: true, name: true, email: true } }, owner: { select: { id: true, name: true, email: true } } },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
    }),
    prisma.bill.findMany({
      where:   { type: 'RENT', buildingId: bId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
    prisma.buildingConfig.findUnique({ where: { id: bId } }),
  ])

  // Owners only see their own unit's bills
  let filteredUnits = units
  let filteredBills = rentBills
  if (role === 'OWNER') {
    filteredUnits = units.filter(u => u.ownerId === session.user.id)
    const ownedUnitIds = new Set(filteredUnits.map(u => u.id))
    filteredBills = rentBills.filter(b => ownedUnitIds.has(b.unitId))
  }

  return (
    <RentClient
      units={filteredUnits}
      rentBills={filteredBills}
      featureRent={config?.featureRent ?? true}
      currentMonth={now.getMonth() + 1}
      currentYear={now.getFullYear()}
      role={role}
      userId={session.user.id}
    />
  )
}
