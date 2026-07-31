-- ═══════════════════════════════════════════════════════════════
-- PetTag — Características físicas (porte, peso, cor da pelagem, castrado)
-- ═══════════════════════════════════════════════════════════════

alter table public.pets
  add column size       text check (size in ('pequeno','medio','grande')),
  add column weight_kg  numeric(5,2),
  add column fur_color  text,
  add column neutered   boolean;
