-- ═══════════════════════════════════════════════════════════════
-- PetTag — Última localização registrada ao abrir a página pública
-- ═══════════════════════════════════════════════════════════════

alter table public.pets
  add column last_seen_lat double precision,
  add column last_seen_lng double precision,
  add column last_seen_at  timestamptz;

-- Visitantes anônimos não têm (e não devem ter) permissão de update em
-- public.pets via RLS. Esta função roda com privilégios do owner (security
-- definer), valida a entrada e só sobrescreve as 3 colunas de localização
-- de uma tag ativa — nunca os demais dados do pet.
create or replace function public.report_pet_location(p_slug text, p_lat double precision, p_lng double precision)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_lat is null or p_lng is null
     or p_lat < -90 or p_lat > 90
     or p_lng < -180 or p_lng > 180 then
    return;
  end if;

  update public.pets
  set last_seen_lat = p_lat,
      last_seen_lng = p_lng,
      last_seen_at = now()
  where slug = p_slug and active = true;
end;
$$;
