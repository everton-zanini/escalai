import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail(to: string, name: string, link: string) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    to,
    subject: "Redefinir sua senha - Escalaí",
    html: `
      <p>Olá, ${escapeHtml(name)}.</p>
      <p>Recebemos um pedido para redefinir a senha da sua conta no Escalaí.</p>
      <p><a href="${link}">Clique aqui para criar uma nova senha</a></p>
      <p>O link vale por 1 hora e só pode ser usado uma vez. Se você não pediu isso, ignore este e-mail.</p>
    `,
  });

  if (error) {
    throw new Error(`Falha ao enviar e-mail: ${error.message}`);
  }
}
