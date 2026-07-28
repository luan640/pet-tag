'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'

export async function signIn(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { success: false, error: 'E-mail ou senha invalidos.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, must_change_password')
    .eq('id', data.user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    return { success: false, error: 'Conta sem perfil configurado. Fale com o administrador.' }
  }

  if (profile.role === 'admin') {
    redirect('/admin')
  }

  if (profile.must_change_password) {
    redirect('/painel/primeiro-acesso')
  }

  redirect('/painel')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/entrar')
}

export async function sendPasswordResetEmail(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!email) {
    return { success: false, error: 'Informe o e-mail para recuperar a senha.' }
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/atualizar-senha`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: undefined }
}

export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')

  if (!password || password.length < 6) {
    return { success: false, error: 'A nova senha precisa ter pelo menos 6 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'A confirmacao de senha nao confere.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Sessao invalida ou expirada. Abra o link do e-mail novamente.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { success: false, error: error.message }
  }

  redirect('/entrar?reset=success')
}
