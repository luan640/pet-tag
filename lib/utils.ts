import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { randomBytes } from 'node:crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatDateShort(dateStr: string): string {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T00:00:00` : dateStr
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function calculateAgeLabel(birthDateStr: string | null): string | null {
  if (!birthDateStr) return null
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(birthDateStr) ? `${birthDateStr}T00:00:00` : birthDateStr
  const birth = new Date(normalized)
  if (Number.isNaN(birth.getTime())) return null

  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 0) return null

  if (months < 1) return 'Recem-nascido'
  if (months < 24) return months === 1 ? '1 mes' : `${months} meses`

  const years = Math.floor(months / 12)
  return years === 1 ? '1 ano' : `${years} anos`
}

export function calculateAgeDetailed(birthDateStr: string | null): string | null {
  if (!birthDateStr) return null
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(birthDateStr) ? `${birthDateStr}T00:00:00` : birthDateStr
  const birth = new Date(normalized)
  if (Number.isNaN(birth.getTime())) return null

  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 0) return null

  if (months < 1) return 'Recem-nascido'
  if (months < 12) return months === 1 ? '1 mes' : `${months} meses`

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  const yearsLabel = years === 1 ? '1 ano' : `${years} anos`
  return remainingMonths === 0 ? yearsLabel : `${yearsLabel} e ${remainingMonths} m`
}

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

export function generateTempPassword(length = 10): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += PASSWORD_ALPHABET[bytes[i] % PASSWORD_ALPHABET.length]
  }
  return out
}

export function generateSlugSuffix(length = 6): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length]
  }
  return out
}

export function normalizePhoneForLink(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55')) return digits
  return `55${digits}`
}

export type VaccineDueStatus = 'overdue' | 'soon' | 'ok' | 'none'

const VACCINE_SOON_WINDOW_DAYS = 30

export function getVaccineDueStatus(nextDueDateStr: string | null): VaccineDueStatus {
  if (!nextDueDateStr) return 'none'
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(nextDueDateStr) ? `${nextDueDateStr}T00:00:00` : nextDueDateStr
  const dueDate = new Date(normalized)
  if (Number.isNaN(dueDate.getTime())) return 'none'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000)

  if (diffDays < 0) return 'overdue'
  if (diffDays <= VACCINE_SOON_WINDOW_DAYS) return 'soon'
  return 'ok'
}
