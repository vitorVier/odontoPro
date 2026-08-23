const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("55") ? digits : `55${digits}`
}

interface SendTemplateParams {
  phone: string
  templateName: string
  params: string[]
}

export async function sendWhatsAppTemplate({ phone, templateName, params }: SendTemplateParams) {
  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePhone(phone),
        type: "template",
        template: {
          name: templateName,
          language: { code: "pt_BR" },
          components: [
            {
              type: "body",
              parameters: params.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      console.error("Falha ao enviar WhatsApp:", response.status, body)
      return { success: false }
    }

    return { success: true }

  } catch (err) {
    console.error("Erro ao enviar WhatsApp:", err)
    return { success: false }
  }
}