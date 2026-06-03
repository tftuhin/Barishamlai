import { PrismaClient, Role, BillType, PaymentStatus, ExpenseCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo building
  const building = await prisma.building.upsert({
    where: { id: 'demo-building' },
    update: { name: 'Octova Tower' },
    create: { id: 'demo-building', name: 'Octova Tower' },
  })

  // Default building config
  await prisma.buildingConfig.upsert({
    where: { id: building.id },
    update: {},
    create: {
      id: building.id,
      featureRent: true, featureElectricity: true, featureGas: true,
      featureServiceCharge: true, featureLift: true,
      serviceChargeOccupied: 3000, serviceChargeVacant: 1500,
      gasUnitRate: 12.5,
    },
  })

  // Assign any existing users/bills/expenses without a buildingId to this building
  await prisma.user.updateMany({ where: { buildingId: null }, data: { buildingId: building.id } })
  await prisma.bill.updateMany({ where: { buildingId: null }, data: { buildingId: building.id } })
  await prisma.expense.updateMany({ where: { buildingId: null }, data: { buildingId: building.id } })

  // Create admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@buildingmgmt.com' },
    update: { buildingId: building.id },
    create: {
      name: 'Building Committee Admin',
      email: 'admin@buildingmgmt.com',
      password: adminPassword,
      role: Role.ADMIN,
      phone: '+880-1700-000001',
      buildingId: building.id,
    },
  })

  // Create owners
  const ownerPassword = await bcrypt.hash('owner123', 10)
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@example.com' },
    update: { buildingId: building.id },
    create: { name: 'Rahman Karim', email: 'owner1@example.com', password: ownerPassword, role: Role.OWNER, phone: '+880-1711-111111', buildingId: building.id },
  })
  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@example.com' },
    update: { buildingId: building.id },
    create: { name: 'Farida Begum', email: 'owner2@example.com', password: ownerPassword, role: Role.OWNER, phone: '+880-1722-222222', buildingId: building.id },
  })
  const owner3 = await prisma.user.upsert({
    where: { email: 'owner3@example.com' },
    update: { buildingId: building.id },
    create: { name: 'Alam Hossain', email: 'owner3@example.com', password: ownerPassword, role: Role.OWNER, phone: '+880-1733-333333', buildingId: building.id },
  })

  // Create tenants
  const tenantPassword = await bcrypt.hash('tenant123', 10)
  const tenant1 = await prisma.user.upsert({
    where: { email: 'tenant1@example.com' },
    update: { buildingId: building.id },
    create: { name: 'Mizanur Rahman', email: 'tenant1@example.com', password: tenantPassword, role: Role.TENANT, phone: '+880-1811-111111', buildingId: building.id },
  })
  const tenant2 = await prisma.user.upsert({
    where: { email: 'tenant2@example.com' },
    update: { buildingId: building.id },
    create: { name: 'Sultana Parvin', email: 'tenant2@example.com', password: tenantPassword, role: Role.TENANT, phone: '+880-1822-222222', buildingId: building.id },
  })

  // Assign any existing units without a buildingId to this building
  await prisma.unit.updateMany({ where: { buildingId: null }, data: { buildingId: building.id } })

  // Create units (using composite unique [buildingId, number])
  const unit1 = await prisma.unit.upsert({
    where: { buildingId_number: { buildingId: building.id, number: 'A-101' } },
    update: { ownerId: owner1.id, tenantId: tenant1.id },
    create: { number: 'A-101', floor: 1, area: 1200, monthlyRent: 25000, ownerId: owner1.id, tenantId: tenant1.id, buildingId: building.id },
  })
  const unit2 = await prisma.unit.upsert({
    where: { buildingId_number: { buildingId: building.id, number: 'A-201' } },
    update: { ownerId: owner2.id, tenantId: tenant2.id },
    create: { number: 'A-201', floor: 2, area: 1000, monthlyRent: 22000, ownerId: owner2.id, tenantId: tenant2.id, buildingId: building.id },
  })
  await prisma.unit.upsert({
    where: { buildingId_number: { buildingId: building.id, number: 'A-301' } },
    update: { ownerId: owner3.id },
    create: { number: 'A-301', floor: 3, area: 1100, monthlyRent: 20000, ownerId: owner3.id, status: 'VACANT', buildingId: building.id },
  })

  const now = new Date()
  const thisMonth = now.getMonth() + 1
  const thisYear = now.getFullYear()
  const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1
  const lastMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear

  // Bills for unit1 this month
  await prisma.bill.upsert({
    where: { unitId_type_month_year: { unitId: unit1.id, type: BillType.RENT, month: thisMonth, year: thisYear } },
    update: {}, create: { unitId: unit1.id, type: BillType.RENT, amount: 25000, month: thisMonth, year: thisYear, dueDate: new Date(thisYear, thisMonth - 1, 10), status: PaymentStatus.PAID, paidAt: new Date(), buildingId: building.id },
  })
  await prisma.bill.upsert({
    where: { unitId_type_month_year: { unitId: unit1.id, type: BillType.SERVICE_CHARGE, month: thisMonth, year: thisYear } },
    update: {}, create: { unitId: unit1.id, type: BillType.SERVICE_CHARGE, amount: 3000, month: thisMonth, year: thisYear, dueDate: new Date(thisYear, thisMonth - 1, 10), status: PaymentStatus.PENDING, buildingId: building.id },
  })
  await prisma.bill.upsert({
    where: { unitId_type_month_year: { unitId: unit1.id, type: BillType.GAS, month: thisMonth, year: thisYear } },
    update: {}, create: { unitId: unit1.id, type: BillType.GAS, amount: 850, month: thisMonth, year: thisYear, dueDate: new Date(thisYear, thisMonth - 1, 15), status: PaymentStatus.PENDING, meterReading: 1250, buildingId: building.id },
  })

  // Bills for unit2
  await prisma.bill.upsert({
    where: { unitId_type_month_year: { unitId: unit2.id, type: BillType.RENT, month: thisMonth, year: thisYear } },
    update: {}, create: { unitId: unit2.id, type: BillType.RENT, amount: 22000, month: thisMonth, year: thisYear, dueDate: new Date(thisYear, thisMonth - 1, 10), status: PaymentStatus.OVERDUE, buildingId: building.id },
  })
  await prisma.bill.upsert({
    where: { unitId_type_month_year: { unitId: unit2.id, type: BillType.SERVICE_CHARGE, month: thisMonth, year: thisYear } },
    update: {}, create: { unitId: unit2.id, type: BillType.SERVICE_CHARGE, amount: 3000, month: thisMonth, year: thisYear, dueDate: new Date(thisYear, thisMonth - 1, 10), status: PaymentStatus.PENDING, buildingId: building.id },
  })
  await prisma.bill.upsert({
    where: { unitId_type_month_year: { unitId: unit2.id, type: BillType.GAS, month: thisMonth, year: thisYear } },
    update: {}, create: { unitId: unit2.id, type: BillType.GAS, amount: 1100, month: thisMonth, year: thisYear, dueDate: new Date(thisYear, thisMonth - 1, 15), status: PaymentStatus.PAID, paidAt: new Date(), meterReading: 2340, buildingId: building.id },
  })

  // Last month bills
  await prisma.bill.upsert({
    where: { unitId_type_month_year: { unitId: unit1.id, type: BillType.RENT, month: lastMonth, year: lastMonthYear } },
    update: {}, create: { unitId: unit1.id, type: BillType.RENT, amount: 25000, month: lastMonth, year: lastMonthYear, dueDate: new Date(lastMonthYear, lastMonth - 1, 10), status: PaymentStatus.PAID, paidAt: new Date(lastMonthYear, lastMonth - 1, 8), buildingId: building.id },
  })

  // Expenses
  await prisma.expense.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Elevator maintenance', amount: 15000, category: ExpenseCategory.MAINTENANCE, date: new Date(), month: thisMonth, year: thisYear, description: 'Monthly elevator service contract', buildingId: building.id },
      { title: 'Security guard salary', amount: 12000, category: ExpenseCategory.SECURITY, date: new Date(), month: thisMonth, year: thisYear, buildingId: building.id },
      { title: 'Common area cleaning', amount: 5000, category: ExpenseCategory.CLEANING, date: new Date(), month: thisMonth, year: thisYear, buildingId: building.id },
      { title: 'Building insurance', amount: 8000, category: ExpenseCategory.INSURANCE, date: new Date(), month: lastMonth, year: lastMonthYear, buildingId: building.id },
    ],
  })

  console.log('✅ Seeding complete!')
  console.log('\nTest credentials:')
  console.log('  Admin:  admin@buildingmgmt.com / admin123')
  console.log('  Owner:  owner1@example.com / owner123')
  console.log('  Tenant: tenant1@example.com / tenant123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
