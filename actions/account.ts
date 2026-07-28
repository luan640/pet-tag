'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { findAuthUserByEmail } from '@/lib/supabase/auth-admin'
import { ensurePetPhotosBucket, PET_PHOTOS_BUCKET } from '@/lib/supabase/storage'
import type { ActionResult, PetSex } from '@/lib/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function updateRecoveryEmail(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Sessão inválida. Faça login novamente.' }
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!email || !EMAIL_RE.test(email)) {
    return { success: false, error: 'Informe um e-mail válido.' }
  }

  const existing = await findAuthUserByEmail(email)
  if (existing && existing.id !== user.id) {
    return { success: false, error: 'Este e-mail já está em uso por outra conta.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(user.id, { email, email_confirm: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: undefined }
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Sessão inválida. Faça login novamente.' }
  }

  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')

  if (!password || password.length < 6) {
    return { success: false, error: 'A nova senha precisa ter pelo menos 6 caracteres.' }
  }
  if (password !== confirmPassword) {
    return { success: false, error: 'A confirmação de senha não confere.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: undefined }
}

export async function completeFirstAccess(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Sessão inválida. Faça login novamente.' }
  }

  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!password || password.length < 6) {
    return { success: false, error: 'A nova senha precisa ter pelo menos 6 caracteres.' }
  }
  if (password !== confirmPassword) {
    return { success: false, error: 'A confirmação de senha não confere.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  if (!name) {
    return { success: false, error: 'Informe o nome do pet.' }
  }

  const breed = String(formData.get('breed') ?? '').trim() || null
  const sexRaw = String(formData.get('sex') ?? '')
  const sex: PetSex | null = sexRaw === 'macho' || sexRaw === 'femea' ? sexRaw : null
  const birthDate = String(formData.get('birth_date') ?? '').trim() || null
  const bio = String(formData.get('bio') ?? '').trim() || null
  const ownerName = String(formData.get('owner_name') ?? '').trim() || null
  const phone = String(formData.get('phone') ?? '').trim() || null
  const location = String(formData.get('location') ?? '').trim() || null

  const { data: pet, error: petFetchError } = await supabase
    .from('pets')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (petFetchError || !pet) {
    return { success: false, error: 'Não encontramos o pet vinculado a esta conta.' }
  }

  if (email) {
    if (!EMAIL_RE.test(email)) {
      return { success: false, error: 'Informe um e-mail válido para recuperação de senha.' }
    }
    const existing = await findAuthUserByEmail(email)
    if (existing && existing.id !== user.id) {
      return { success: false, error: 'Este e-mail já está em uso por outra conta.' }
    }
    const admin = createAdminClient()
    const { error: emailError } = await admin.auth.admin.updateUserById(user.id, { email, email_confirm: true })
    if (emailError) {
      return { success: false, error: 'Não foi possível salvar o e-mail: ' + emailError.message }
    }
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password })
  if (passwordError) {
    return { success: false, error: passwordError.message }
  }

  const { error: petUpdateError } = await supabase
    .from('pets')
    .update({
      name,
      breed,
      sex,
      birth_date: birthDate,
      bio,
      owner_name: ownerName,
      phone,
      location,
      is_configured: true,
    })
    .eq('id', pet.id)

  if (petUpdateError) {
    return { success: false, error: 'Não foi possível salvar os dados do pet: ' + petUpdateError.message }
  }

  const photos = formData.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0)
  if (photos.length > 0) {
    await ensurePetPhotosBucket()
    for (const [index, file] of photos.entries()) {
      const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
      const path = `${pet.id}/${randomUUID()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      const { error: uploadError } = await supabase.storage
        .from(PET_PHOTOS_BUCKET)
        .upload(path, buffer, { contentType: file.type || 'image/jpeg' })

      if (!uploadError) {
        await supabase.from('pet_photos').insert({
          pet_id: pet.id,
          storage_path: path,
          sort_order: index,
        })
      }
    }
  }

  await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)

  redirect('/painel?bem-vindo=1')
}
