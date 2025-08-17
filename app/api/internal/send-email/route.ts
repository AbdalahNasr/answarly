import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '../../../../server/lib/mail'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, subject, text } = body
    if (!to || !subject || !text) return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    await sendEmail({ to, subject, text })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
