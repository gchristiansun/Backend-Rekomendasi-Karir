import nodemailer from "nodemailer";

const smtpConfigured =
  !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: Number(process.env.SMTP_PORT ?? 465) === 465, // 465 = SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

/**
 * Kirim email. Kalau SMTP belum dikonfigurasi (.env kosong),
 * fallback: cetak isi email ke console (mode dev).
 */
export const sendMail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    console.log("=".repeat(60));
    console.log("[MAILER-DEV] SMTP belum dikonfigurasi. Email tidak terkirim.");
    console.log(`Kepada : ${to}`);
    console.log(`Subjek : ${subject}`);
    console.log(html);
    console.log("=".repeat(60));
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};