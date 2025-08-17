// NOTE: nodemailer usage is commented out for now to avoid bundling issues.
// We'll re-enable it later when we wire email credentials and server-only
// deployments.

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  // Simple stub — log the email server-side for now.
  // When re-enabling nodemailer, restore the implementation below.
  //
  // import nodemailer from 'nodemailer'
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  // })
  // await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text })

  console.log('sendEmail stub called:', { to, subject, text })
  return Promise.resolve()
}

export default { sendEmail }
