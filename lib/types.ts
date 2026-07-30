// ─── Domain models ──────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'owner'

export interface Profile {
  id: string
  role: UserRole
  must_change_password: boolean
  created_at: string
}

export type PetSex = 'macho' | 'femea'

export interface Pet {
  id: string
  owner_id: string
  slug: string
  name: string
  species: string
  breed: string | null
  sex: PetSex | null
  birth_date: string | null
  bio: string | null
  allergies: string | null
  owner_name: string | null
  phone: string | null
  location: string | null
  is_configured: boolean
  active: boolean
  is_lost: boolean
  last_seen_lat: number | null
  last_seen_lng: number | null
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface PetPhoto {
  id: string
  pet_id: string
  storage_path: string
  is_with_owner: boolean
  sort_order: number
  created_at: string
  url?: string
}

export interface PetVaccine {
  id: string
  pet_id: string
  name: string
  applied_date: string | null
  next_due_date: string | null
  notes: string | null
  created_at: string
}

export interface PetWithDetails extends Pet {
  photos: PetPhoto[]
  vaccines: PetVaccine[]
}

export interface PetListRow extends Pet {
  owner_email: string | null
}

// ─── Server action result ──────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── Admin: tag creation result ────────────────────────────────────────────

export interface NewTagCredentials {
  slug: string
  publicUrl: string
  login: string
  tempPassword: string
  petName: string
}
