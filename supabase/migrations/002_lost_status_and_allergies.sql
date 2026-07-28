-- ═══════════════════════════════════════════════════════════════
-- PetTag — Status "perdido" + campo de alergias
-- ═══════════════════════════════════════════════════════════════

alter table public.pets
  add column is_lost boolean not null default false,
  add column allergies text;
