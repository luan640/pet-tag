'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { findAuthUserByEmail } from '@/lib/supabase/auth-admin'
import type { ActionResult } from '@/lib/types'

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

  await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)

  return { success: true, data: undefined }
}
