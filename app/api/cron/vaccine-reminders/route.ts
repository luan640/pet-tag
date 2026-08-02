import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendVaccineReminderEmail } from '@/lib/email'
import { getVaccineDueStatus } from '@/lib/utils'
import type { PetVaccine } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Reenvia um lembrete para a mesma vacina no máximo a cada N dias, mesmo que
// ela continue atrasada/vencendo — evita spammar o tutor todo dia.
const REMINDER_COOLDOWN_DAYS = 7
const SOON_WINDOW_DAYS = 30

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const admin = createAdminClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const windowEnd = new Date(today.getTime() + SOON_WINDOW_DAYS * 86_400_000)
  const cooldownCutoff = new Date(Date.now() - REMINDER_COOLDOWN_DAYS * 86_400_000).toISOString()

  const { data: vaccines, error } = await admin
    .from('pet_vaccines')
    .select('*, pets!inner(id, name, owner_id, active)')
    .not('next_due_date', 'is', null)
    .lte('next_due_date', windowEnd.toISOString().slice(0, 10))
    .eq('pets.active', true)
    .or(`reminder_sent_at.is.null,reminder_sent_at.lt.${cooldownCutoff}`)

  if (error) {
    console.error('[cron/vaccine-reminders] erro ao buscar vacinas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  type Row = PetVaccine & { pets: { id: string; name: string; owner_id: string; active: boolean } }
  const rows = (vaccines ?? []) as unknown as Row[]

  const byPet = new Map<string, { petName: string; ownerId: string; overdue: PetVaccine[]; soon: PetVaccine[] }>()

  for (const row of rows) {
    const status = getVaccineDueStatus(row.next_due_date)
    if (status !== 'overdue' && status !== 'soon') continue

    const entry = byPet.get(row.pets.id) ?? {
      petName: row.pets.name,
      ownerId: row.pets.owner_id,
      overdue: [],
      soon: [],
    }
    entry[status === 'overdue' ? 'overdue' : 'soon'].push(row)
    byPet.set(row.pets.id, entry)
  }

  let emailsSent = 0
  let vaccinesFlagged = 0
  const sentVaccineIds: string[] = []

  for (const [petId, entry] of byPet) {
    const { data: userData } = await admin.auth.admin.getUserById(entry.ownerId)
    const ownerEmail = userData?.user?.email
    if (!ownerEmail) continue

    const result = await sendVaccineReminderEmail({
      to: ownerEmail,
      petId,
      petName: entry.petName,
      overdue: entry.overdue,
      soon: entry.soon,
    })

    if (result.success) {
      emailsSent += 1
      const ids = [...entry.overdue, ...entry.soon].map((v) => v.id)
      sentVaccineIds.push(...ids)
      vaccinesFlagged += ids.length
    }
  }

  if (sentVaccineIds.length > 0) {
    await admin.from('pet_vaccines').update({ reminder_sent_at: new Date().toISOString() }).in('id', sentVaccineIds)
  }

  return NextResponse.json({ pets: byPet.size, emailsSent, vaccinesFlagged })
}
