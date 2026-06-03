import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OnboardingClient } from './OnboardingClient'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')

  const bId = session.user.buildingId!

  const [units, config, fundBalances, unitBalances] = await Promise.all([
    prisma.unit.findMany({
      where:   { buildingId: bId },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
      select:  { id: true, number: true, floor: true },
    }),
    prisma.buildingConfig.findUnique({
      where:  { id: bId },
      select: {
        featureRent: true, featureServiceCharge: true, featureGas: true,
        onboardingComplete: true,
      },
    }),
    prisma.fundBalance.findMany({ where: { buildingId: bId } }),
    prisma.unitOpeningBalance.findMany({ where: { buildingId: bId } }),
  ])

  // Already completed — redirect to dashboard
  if (config?.onboardingComplete) redirect('/dashboard')

  const defaultConfig = {
    featureRent: config?.featureRent ?? true,
    featureServiceCharge: config?.featureServiceCharge ?? true,
    featureGas: config?.featureGas ?? true,
  }

  return (
    <OnboardingClient
      units={units}
      defaultModules={defaultConfig}
      existingFundBalances={fundBalances}
      existingUnitBalances={unitBalances}
    />
  )
}
