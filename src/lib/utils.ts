import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number, currency = 'BDT') {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function getMonthName(month: number) {
  return new Date(2000, month - 1).toLocaleString('default', { month: 'long' })
}

export function getBillTypeLabel(type: string) {
  const labels: Record<string, string> = {
    RENT: 'Rent',
    SERVICE_CHARGE: 'Service Charge',
    GAS: 'Gas Bill',
    WATER: 'Water Bill',
    ELECTRICITY: 'Electricity Bill',
  }
  return labels[type] ?? type
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    OVERDUE: 'bg-red-50 text-red-700 border-red-200',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-600'
}

export function getExpenseCategoryLabel(cat: string) {
  const labels: Record<string, string> = {
    MAINTENANCE: 'Maintenance',
    CLEANING: 'Cleaning',
    UTILITIES: 'Utilities',
    SECURITY: 'Security',
    INSURANCE: 'Insurance',
    LEGAL: 'Legal',
    OTHER: 'Other',
  }
  return labels[cat] ?? cat
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function isPremiumBuilding(building: { plan: string; premiumUntil: Date | string | null } | null | undefined): boolean {
  if (!building) return false
  return building.plan === 'PREMIUM' && building.premiumUntil !== null && new Date(building.premiumUntil) > new Date()
}
