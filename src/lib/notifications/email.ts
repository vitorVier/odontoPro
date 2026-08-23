import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    try {
        const { error } = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to,
            subject,
            html,
        })

        if (error) {
            console.error("Falha ao enviar e-mail:", error)
            return { success: false }
        }

        return { success: true }

    } catch (err) {
        console.error("Erro ao enviar e-mail:", err)
        return { success: false }
    }
}