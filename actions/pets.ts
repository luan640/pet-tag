'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ensurePetPhotosBucket, PET_PHOTOS_BUCKET } from '@/lib/supabase/storage'
import { MAX_PET_PHOTOS } from '@/lib/constants'
import type { ActionResult, PetSex, PetSize } from '@/lib/types'

async function getOwnedPet(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: pet } = await supabase.from('pets').select('id').eq('owner_id', user.id).single()
  return pet
}

export async function updatePetIdentity(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const pet = await getOwnedPet(supabase)
  if (!pet) return { success: false, error: 'Sessão inválida. Faça login novamente.' }

  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { success: false, error: 'Informe o nome do pet.' }

  const species = String(formData.get('species') ?? '').trim() || 'cachorro'
  const breed = String(formData.get('breed') ?? '').trim() || null

  const { error } = await supabase
    .from('pets')
    .update({ name, species, breed, is_configured: true })
    .eq('id', pet.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/painel')
  return { success: true, data: undefined }
}

export async function updatePetCharacteristics(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const pet = await getOwnedPet(supabase)
  if (!pet) return { success: false, error: 'Sessão inválida. Faça login novamente.' }

  const sexRaw = String(formData.get('sex') ?? '')
  const sex: PetSex | null = sexRaw === 'macho' || sexRaw === 'femea' ? sexRaw : null
  const birthDate = String(formData.get('birth_date') ?? '').trim() || null
  const bio = String(formData.get('bio') ?? '').trim() || null
  const allergies = String(formData.get('allergies') ?? '').trim() || null
  const sizeRaw = String(formData.get('size') ?? '')
  const size: PetSize | null = sizeRaw === 'pequeno' || sizeRaw === 'medio' || sizeRaw === 'grande' ? sizeRaw : null
  const weightRaw = String(formData.get('weight_kg') ?? '').trim().replace(',', '.')
  const weightKg = weightRaw && Number.isFinite(Number(weightRaw)) ? Number(weightRaw) : null
  const furColor = String(formData.get('fur_color') ?? '').trim() || null
  const neuteredRaw = String(formData.get('neutered') ?? '')
  const neutered = neuteredRaw === 'true' ? true : neuteredRaw === 'false' ? false : null

  const { error } = await supabase
    .from('pets')
    .update({
      sex,
      birth_date: birthDate,
      bio,
      allergies,
      size,
      weight_kg: weightKg,
      fur_color: furColor,
      neutered,
    })
    .eq('id', pet.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/painel')
  return { success: true, data: undefined }
}

export async function updatePetContact(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const pet = await getOwnedPet(supabase)
  if (!pet) return { success: false, error: 'Sessão inválida. Faça login novamente.' }

  const ownerName = String(formData.get('owner_name') ?? '').trim() || null
  const phone = String(formData.get('phone') ?? '').trim() || null

  const { error } = await supabase
    .from('pets')
    .update({ owner_name: ownerName, phone })
    .eq('id', pet.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/painel')
  return { success: true, data: undefined }
}

export async function updatePetLocation(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const pet = await getOwnedPet(supabase)
  if (!pet) return { success: false, error: 'Sessão inválida. Faça login novamente.' }

  const location = String(formData.get('location') ?? '').trim() || null

  const { error } = await supabase.from('pets').update({ location }).eq('id', pet.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/painel')
  return { success: true, data: undefined }
}

export async function setLostStatus(isLost: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const pet = await getOwnedPet(supabase)
  if (!pet) return { success: false, error: 'Sessão inválida. Faça login novamente.' }

  const { error } = await supabase.from('pets').update({ is_lost: isLost }).eq('id', pet.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/painel')
  revalidatePath('/p/[slug]', 'page')
  return { success: true, data: undefined }
}

export async function uploadPetPhoto(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const pet = await getOwnedPet(supabase)
  if (!pet) return { success: false, error: 'Sessão inválida. Faça login novamente.' }

  const file = formData.get('photo')
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'Selecione uma foto.' }
  }

  const { count } = await supabase
    .from('pet_photos')
    .select('id', { count: 'exact', head: true })
    .eq('pet_id', pet.id)

  if ((count ?? 0) >= MAX_PET_PHOTOS) {
    return { success: false, error: `Você já atingiu o limite de ${MAX_PET_PHOTOS} fotos.` }
  }

  await ensurePetPhotosBucket()

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${pet.id}/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(PET_PHOTOS_BUCKET)
    .upload(path, buffer, { contentType: file.type || 'image/jpeg' })

  if (uploadError) return { success: false, error: uploadError.message }

  const isWithOwner = formData.get('is_with_owner') === 'on'

  const { error: insertError } = await supabase.from('pet_photos').insert({
    pet_id: pet.id,
    storage_path: path,
    is_with_owner: isWithOwner,
    sort_order: count ?? 0,
  })

  if (insertError) return { success: false, error: insertError.message }

  revalidatePath('/painel')
  return { success: true, data: undefined }
}

export async function deletePetPhoto(photoId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const pet = await getOwnedPet(supabase)
  if (!pet) return { success: false, error: 'Sessão inválida. Faça login novamente.' }

  const { data: photo } = await supabase
    .from('pet_photos')
    .select('id, storage_path, pet_id')
    .eq('id', photoId)
    .single()

  if (!photo || photo.pet_id !== pet.id) {
    return { success: false, error: 'Foto não encontrada.' }
  }

  await supabase.storage.from(PET_PHOTOS_BUCKET).remove([photo.storage_path])
  const { error } = await supabase.from('pet_photos').delete().eq('id', photoId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/painel')
  return { success: true, data: undefined }
}

export async function reportPetLocation(slug: string, lat: number, lng: number): Promise<ActionResult> {
  if (!slug || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { success: false, error: 'Localização inválida.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('report_pet_location', { p_slug: slug, p_lat: lat, p_lng: lng })

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function addVaccine(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const pet = await getOwnedPet(supabase)
  if (!pet) return { success: false, error: 'Sessão inválida. Faça login novamente.' }

  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { success: false, error: 'Informe o nome da vacina.' }

  const appliedDate = String(formData.get('applied_date') ?? '').trim() || null
  const nextDueDate = String(formData.get('next_due_date') ?? '').trim() || null
  const notes = String(formData.get('notes') ?? '').trim() || null

  const { error } = await supabase.from('pet_vaccines').insert({
    pet_id: pet.id,
    name,
    applied_date: appliedDate,
    next_due_date: nextDueDate,
    notes,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/painel')
  return { success: true, data: undefined }
}

export async function deleteVaccine(vaccineId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const pet = await getOwnedPet(supabase)
  if (!pet) return { success: false, error: 'Sessão inválida. Faça login novamente.' }

  const { error } = await supabase
    .from('pet_vaccines')
    .delete()
    .eq('id', vaccineId)
    .eq('pet_id', pet.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/painel')
  return { success: true, data: undefined }
}
