// lib/utils.ts
// NOTE: nodemailer must only be loaded on the server. Importing it at module
// scope causes Next.js to try bundling it into the client where `fs` is not
// available. We dynamically import nodemailer inside the function so client
// bundles remain clean.

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  // Client-side: call internal API route to send email (server handles nodemailer).
  try {
    const res = await fetch('/api/internal/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json?.error || 'Failed to send email')
    }
  } catch (e) {
    // swallow in client to avoid breaking UI; server code should call server/lib/mail directly
    if (typeof window !== 'undefined') {
      console.warn('sendEmail API failed:', e)
      return
    }
  // If running server-side and the API call failed, do NOT import nodemailer here
  // because this file is imported by client components and any reference to
  // nodemailer will cause bundling errors (fs missing). Server code should
  // call `server/lib/mail.ts` directly where nodemailer is isolated.
  console.error('sendEmail API failed on server and nodemailer import is disabled here:', e)
  return
  }
}

// Small classNames helper used by components
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}