'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { findAuthUserByEmail } from '@/lib/supabase/auth-admin'
import { slugify, generateSlugSuffix, generateTempPassword } from '@/lib/utils'
import { sendNewTagCredentialsEmail } from '@/lib/email'
import type { ActionResult, NewTagCredentials, PetListRow, PetOwnerPasswordReset } from '@/lib/types'

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export async function createPetTag(formData: FormData): Promise<ActionResult<NewTagCredentials>> {
  const admin = createAdminClient()

  const petName = String(formData.get('pet_name') ?? '').trim()
  const ownerEmailInput = String(formData.get('owner_email') ?? '').trim().toLowerCase()

  if (!petName) {
    return { success: false, error: 'Informe o nome do pet.' }
  }

  const slugBase = slugify(petName) || 'pet'
  let slug = ''
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = `${slugBase}-${generateSlugSuffix(5)}`
    const { data: existing } = await admin.from('pets').select('id').eq('slug', candidate).maybeSingle()
    if (!existing) {
      slug = candidate
      break
    }
  }
  if (!slug) {
    return { success: false, error: 'Não foi possível gerar um link único. Tente novamente.' }
  }

  const login = ownerEmailInput || `${slug}@pet.local`

  const existingUser = ownerEmailInput ? await findAuthUserByEmail(ownerEmailInput) : null

  let ownerId: string
  let tempPassword: string | null = null
  const reusedExistingAccount = !!existingUser

  if (existingUser) {
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', existingUser.id)
      .single()

    if (!existingProfile || existingProfile.role !== 'owner') {
      return { success: false, error: 'Esse e-mail já está em uso por uma conta que não é de tutor.' }
    }

    ownerId = existingUser.id
  } else {
    tempPassword = generateTempPassword()

    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email: login,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'owner' },
    })

    if (userError || !userData.user) {
      if (userError?.message?.toLowerCase().includes('already') || userError?.code === 'email_exists') {
        return { success: false, error: 'Já existe uma conta com esse e-mail. Use outro e-mail ou deixe em branco para gerar um login automático.' }
      }
      return { success: false, error: userError?.message ?? 'Erro ao criar conta do tutor.' }
    }

    ownerId = userData.user.id

    const { error: profileError } = await admin.from('profiles').insert({
      id: ownerId,
      role: 'owner',
      must_change_password: true,
    })

    if (profileError) {
      await admin.auth.admin.deleteUser(ownerId)
      return { success: false, error: 'Não foi possível criar o perfil do tutor: ' + profileError.message }
    }
  }

  const { error: petError } = await admin.from('pets').insert({
    owner_id: ownerId,
    slug,
    name: petName,
    is_configured: false,
    active: true,
  })

  if (petError) {
    if (!reusedExistingAccount) {
      await admin.from('profiles').delete().eq('id', ownerId)
      await admin.auth.admin.deleteUser(ownerId)
    }
    return { success: false, error: 'Não foi possível criar o registro do pet: ' + petError.message }
  }

  const publicUrl = `${appUrl()}/p/${slug}?src=tag`
  let emailSent = false

  if (ownerEmailInput && tempPassword) {
    const result = await sendNewTagCredentialsEmail({
      to: ownerEmailInput,
      petName,
      publicUrl,
      login,
      tempPassword,
    })
    emailSent = result.success
  }

  return {
    success: true,
    data: {
      slug,
      publicUrl,
      login,
      tempPassword,
      petName,
      reusedExistingAccount,
      emailSent,
    },
  }
}

export async function listPets(): Promise<PetListRow[]> {
  const admin = createAdminClient()

  const { data: pets, error } = await admin
    .from('pets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !pets) return []

  const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const emailById = new Map((usersData?.users ?? []).map((u) => [u.id, u.email ?? null]))

  return pets.map((pet) => ({
    ...pet,
    owner_email: emailById.get(pet.owner_id) ?? null,
  }))
}

export async function toggleActive(petId: string, active: boolean): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin.from('pets').update({ active }).eq('id', petId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: undefined }
}

export async function resetPetOwnerPassword(petId: string): Promise<ActionResult<PetOwnerPasswordReset>> {
  const admin = createAdminClient()

  const { data: pet, error: petError } = await admin
    .from('pets')
    .select('owner_id')
    .eq('id', petId)
    .single()

  if (petError || !pet) {
    return { success: false, error: 'Pet não encontrado.' }
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(pet.owner_id)
  if (userError || !userData.user) {
    return { success: false, error: 'Conta do tutor não encontrada.' }
  }

  const tempPassword = generateTempPassword()

  const { error: updateError } = await admin.auth.admin.updateUserById(pet.owner_id, {
    password: tempPassword,
  })

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  await admin.from('profiles').update({ must_change_password: true }).eq('id', pet.owner_id)

  return {
    success: true,
    data: {
      login: userData.user.email ?? '',
      tempPassword,
    },
  }
}
