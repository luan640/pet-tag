-- ═══════════════════════════════════════════════════════════════
-- PetTag — Rastreio de lembretes de vacina por e-mail
-- ═══════════════════════════════════════════════════════════════

-- Evita reenviar o mesmo lembrete todos os dias: guardamos quando o último
-- e-mail de lembrete foi disparado para essa vacina.
alter table public.pet_vaccines
  add column reminder_sent_at timestamptz;
