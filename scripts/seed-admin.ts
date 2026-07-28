/**
 * Cria a primeira conta de administrador do sistema.
 *
 * Uso:
 *   npx tsx scripts/seed-admin.ts email@exemplo.com "SenhaForte123"
 *
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { createAdminClient } from '../lib/supabase/admin'

async function main() {
  const [email, password] = process.argv.slice(2)

  if (!email || !password) {
    console.error('Uso: npx tsx scripts/seed-admin.ts email@exemplo.com "SenhaForte123"')
    process.exit(1)
  }

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' },
  })

  if (error || !data.user) {
    console.error('Erro ao criar usuario admin:', error?.message)
    process.exit(1)
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: data.user.id,
    role: 'admin',
    must_change_password: false,
  })

  if (profileError) {
    console.error('Usuario criado, mas falhou ao criar profile:', profileError.message)
    process.exit(1)
  }

  console.log(`Admin criado com sucesso: ${email}`)
}

main()
