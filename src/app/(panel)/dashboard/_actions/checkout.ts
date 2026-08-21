"use server"

import { stripe } from "@/utils/stripe"
import { redirect } from "next/navigation"
import { Plan } from "@prisma/client"

interface CreateCheckoutSessionProps {
  type: Plan
}

const PLAN_PRICES: Record<Plan, string | undefined> = {
  BASIC: process.env.STRIPE_PLAN_BASIC,
  PROFESSIONAL: process.env.STRIPE_PLAN_PRO,
  PREMIUM: process.env.STRIPE_PLAN_PREMIUM,
}

export async function createCheckoutSession({ type }: CreateCheckoutSessionProps) {
  const priceId = PLAN_PRICES[type]

  if (!priceId) {
    return { error: "ID do preço do plano não configurado no ambiente." }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription", // Alterado para assinatura recorrente
      allow_promotion_codes: true,
      metadata: {
        type: type, // Util para identificar o plano em Webhooks do Stripe
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?status=canceled`,
    })

    if (!session.url) {
      return { error: "Não foi possível gerar a URL de checkout." }
    }

    return { url: session.url }
  } catch (err) {
    console.error("ERRO AO CRIAR SESSÃO DO STRIPE:", err)
    return { error: "Falha ao iniciar o processo de assinatura." }
  }
}