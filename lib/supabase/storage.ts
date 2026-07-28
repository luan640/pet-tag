import { createAdminClient } from '@/lib/supabase/admin'

export const PET_PHOTOS_BUCKET = 'pet-photos'

export async function ensurePetPhotosBucket() {
  const admin = createAdminClient()
  const { data: buckets, error: listError } = await admin.storage.listBuckets()

  if (listError) {
    throw new Error(`Nao foi possivel listar os buckets do storage: ${listError.message}`)
  }

  const exists = (buckets ?? []).some((bucket) => bucket.name === PET_PHOTOS_BUCKET)
  if (exists) return

  const { error: createError } = await admin.storage.createBucket(PET_PHOTOS_BUCKET, {
    public: true,
    fileSizeLimit: '8MB',
  })

  if (createError && !createError.message.toLowerCase().includes('already exists')) {
    throw new Error(`Nao foi possivel criar o bucket ${PET_PHOTOS_BUCKET}: ${createError.message}`)
  }
}

export function getPetPhotoPublicUrl(storagePath: string) {
  const admin = createAdminClient()
  const { data } = admin.storage.from(PET_PHOTOS_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}
