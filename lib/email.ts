import { Resend } from 'resend'
import { formatDateShort } from '@/lib/utils'
import type { PetVaccine } from '@/lib/types'

type SendResult = { success: true } | { success: false; error: string }

const FROM = process.env.RESEND_FROM_EMAIL || 'PetTag <onboarding@resend.dev>'

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<SendResult> {
  const resend = getClient()
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY não configurada — e-mail "${subject}" para ${to} não foi enviado.`)
    return { success: false, error: 'Resend não configurado.' }
  }

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) {
      console.error('[email] Erro ao enviar via Resend:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.error('[email] Erro inesperado ao enviar via Resend:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido.' }
  }
}

function layout(preheader: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#efeee0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none;font-size:1px;color:#efeee0;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#efeee0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#fffdf7;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background-color:#362718;padding:20px 28px;">
                <span style="font-size:18px;font-weight:700;color:#fffdf7;">🐾 PetTag</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 28px;border-top:1px solid #e7e3d3;">
                <p style="margin:16px 0 0;font-size:12px;color:#8a7f6b;">
                  Você recebeu este e-mail porque seu pet está cadastrado no PetTag.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;background-color:#c1552b;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:12px;">${label}</a>`
}

// ─── Localização reportada ────────────────────────────────────────────────

export async function sendLocationReportedEmail(params: {
  to: string
  petName: string
  petSlug: string
  lat: number
  lng: number
  isLost: boolean
}): Promise<SendResult> {
  const { to, petName, petSlug, lat, lng, isLost } = params
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
  const publicUrl = `${appUrl}/p/${petSlug}`

  const html = layout(
    `Alguém abriu a página do ${petName} e compartilhou a localização.`,
    `
      <h1 style="margin:0 0 12px;font-size:20px;color:#362718;">📍 Localização de ${petName}</h1>
      <p style="margin:0 0 8px;font-size:15px;color:#4a4030;line-height:1.5;">
        Alguém abriu a página pública do(a) <strong>${petName}</strong> e o celular compartilhou a localização atual.
      </p>
      ${
        isLost
          ? `<p style="margin:0 0 8px;font-size:15px;color:#c1552b;line-height:1.5;"><strong>${petName} está marcado como perdido</strong> — essa pode ser uma pista de onde ele está agora.</p>`
          : ''
      }
      ${button(mapsUrl, 'Ver localização no mapa')}
      <p style="margin:20px 0 0;font-size:13px;color:#8a7f6b;">
        Página pública: <a href="${publicUrl}" style="color:#2f6f5c;">${publicUrl}</a>
      </p>
    `,
  )

  return sendEmail({ to, subject: `📍 Localização de ${petName} foi reportada`, html })
}

// ─── Lembrete de vacina ────────────────────────────────────────────────────

export async function sendVaccineReminderEmail(params: {
  to: string
  petId: string
  petName: string
  overdue: PetVaccine[]
  soon: PetVaccine[]
}): Promise<SendResult> {
  const { to, petId, petName, overdue, soon } = params

  function list(vaccines: PetVaccine[]): string {
    return vaccines
      .map(
        (v) =>
          `<li style="margin-bottom:4px;">${v.name}${v.next_due_date ? ` — ${formatDateShort(v.next_due_date)}` : ''}</li>`,
      )
      .join('')
  }

  const html = layout(
    `${petName} tem vacinas que precisam de atenção.`,
    `
      <h1 style="margin:0 0 12px;font-size:20px;color:#362718;">💉 Vacinas de ${petName}</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#4a4030;line-height:1.5;">
        Confira o que precisa de atenção no cartão de vacinação do(a) ${petName}:
      </p>
      ${
        overdue.length > 0
          ? `<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#c0392b;">Atrasadas</p>
             <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#4a4030;">${list(overdue)}</ul>`
          : ''
      }
      ${
        soon.length > 0
          ? `<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#a35a00;">Vencem em breve</p>
             <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#4a4030;">${list(soon)}</ul>`
          : ''
      }
      ${button(`${(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/painel/${petId}/vacinas`, 'Abrir cartão de vacinação')}
    `,
  )

  return sendEmail({ to, subject: `💉 Vacinas de ${petName} precisam de atenção`, html })
}

// ─── Credenciais de nova tag ───────────────────────────────────────────────

export async function sendNewTagCredentialsEmail(params: {
  to: string
  petName: string
  publicUrl: string
  login: string
  tempPassword: string
}): Promise<SendResult> {
  const { to, petName, publicUrl, login, tempPassword } = params
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const loginUrl = `${appUrl}/entrar`

  const html = layout(
    `Suas credenciais de acesso ao PetTag do(a) ${petName}.`,
    `
      <h1 style="margin:0 0 12px;font-size:20px;color:#362718;">🐾 Tag do(a) ${petName} está pronta</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#4a4030;line-height:1.5;">
        Sua tag de identificação foi criada. Use os dados abaixo para acessar e completar o perfil de ${petName}
        (fotos, vacinas, contato).
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#efeee0;border-radius:12px;">
        <tr>
          <td style="padding:14px 16px;">
            <p style="margin:0 0 8px;font-size:13px;color:#8a7f6b;">Login</p>
            <p style="margin:0 0 14px;font-size:15px;font-family:monospace;color:#362718;">${login}</p>
            <p style="margin:0 0 8px;font-size:13px;color:#8a7f6b;">Senha temporária</p>
            <p style="margin:0;font-size:15px;font-family:monospace;color:#362718;">${tempPassword}</p>
          </td>
        </tr>
      </table>
      ${button(loginUrl, 'Entrar e configurar o perfil')}
      <p style="margin:20px 0 0;font-size:13px;color:#8a7f6b;">
        Link público da tag: <a href="${publicUrl}" style="color:#2f6f5c;">${publicUrl}</a>
      </p>
    `,
  )

  return sendEmail({ to, subject: `🐾 Credenciais de acesso — tag do(a) ${petName}`, html })
}
