// server/lib/mail.ts
// Uses Resend API — no npm install needed, just a fetch() call.
// Falls back to console logging when RESEND_API_KEY is not set.

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    console.log("[mail] No RESEND_API_KEY set. Email details:");
    console.log({ to, subject, text: text.substring(0, 200) });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Answerly <${fromEmail}>`,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error("[mail] Resend API error:", error);
    throw new Error(error?.message || `Email send failed (${res.status})`);
  }

  const data = await res.json();
  console.log("[mail] Email sent via Resend:", data.id);
}

// ─── Shared email wrapper ───
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0f0a1e;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0a1e;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:linear-gradient(135deg,#1a1030 0%,#0d0a1a 100%);border-radius:16px;border:1px solid rgba(139,92,246,0.3);overflow:hidden;">
          <!-- Header / Brand -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:#818cf8;">A</span><span style="color:#8b7cf8;">n</span><span style="color:#956cf8;">s</span><span style="color:#9f5cf8;">w</span><span style="color:#a94cf8;">e</span><span style="color:#b33cf8;">r</span><span style="color:#bd2cf8;">l</span><span style="color:#c71cf8;">y</span>
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid rgba(139,92,246,0.15);text-align:center;">
              <p style="margin:0;font-size:11px;color:#4a4670;">
                &copy; ${new Date().getFullYear()} Answerly. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Email template: verification code only (no link).
 */
export function buildCodeEmailHtml(code: string): string {
  const codeChars = code.split("").map(
    (c) => `<td style="width:42px;height:52px;text-align:center;vertical-align:middle;font-size:28px;font-weight:700;color:#a78bfa;font-family:'Courier New',monospace;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.25);border-radius:8px;">${c}</td>`
  ).join('<td style="width:6px;"></td>');

  return emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f5f3ff;">
      Your verification code
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#a5a0c0;line-height:1.6;">
      Enter this code on the reset page to verify your identity.
    </p>
    <!-- Code Display -->
    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:24px 16px;margin-bottom:24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>${codeChars}</tr>
      </table>
      <p style="margin:14px 0 0;font-size:11px;color:#6b6790;text-align:center;">
        📋 Copy this code and paste it on the reset page
      </p>
    </div>
    <!-- Expiry -->
    <p style="margin:0;font-size:12px;color:#6b6790;text-align:center;line-height:1.5;">
      This code expires in <strong style="color:#a5a0c0;">1 hour</strong>.<br/>
      If you didn't request this, you can safely ignore this email.
    </p>
  `);
}

/**
 * Email template: reset link only (no code).
 */
export function buildLinkEmailHtml(resetLink: string): string {
  return emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f5f3ff;">
      Reset your password
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#a5a0c0;line-height:1.6;">
      Click the button below to set a new password. This link can only be used once.
    </p>
    <!-- Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${resetLink}" target="_blank" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <!-- Link fallback -->
    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:8px;padding:12px 16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#6b6790;">Or copy this link:</p>
      <a href="${resetLink}" target="_blank" style="display:block;margin:0;font-size:12px;color:#818cf8;word-break:break-all;line-height:1.4;text-decoration:underline;">${resetLink}</a>
    </div>
    <!-- Expiry -->
    <p style="margin:0;font-size:12px;color:#6b6790;text-align:center;line-height:1.5;">
      This link expires in <strong style="color:#a5a0c0;">1 hour</strong>.<br/>
      If you didn't request this, you can safely ignore this email.
    </p>
  `);
}

export default { sendEmail, buildCodeEmailHtml, buildLinkEmailHtml };
