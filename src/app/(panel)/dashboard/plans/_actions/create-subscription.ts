"use server"

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { stripe } from '@/utils/stripe'
import { Plan } from '@prisma/client'

interface SubscriptionProps {
  type: Plan;
}

// Tipagem explícita para o TypeScript resolver a união no client sem erros
type SubscriptionResponse =
  | { url: string; error?: undefined }
  | { url?: undefined; error: string }

export async function createSubscription({ type }: SubscriptionProps): Promise<SubscriptionResponse> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "Falha ao ativar plano. Usuário não autenticado." }
  }

  const findUser = await prisma.user.findFirst({
    where: {
      id: userId
    }
  })

  if (!findUser) {
    return { error: "Usuário não encontrado." }
  }

  let customerId = findUser.stripe_customer_id;

  if (!customerId) {
    const stripeCustomer = await stripe.customers.create({
      email: findUser.email ?? undefined
    })

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stripe_customer_id: stripeCustomer.id
      }
    })

    customerId = stripeCustomer.id;
  }

  // Definição dos IDs dos planos vindos das variáveis de ambiente
  const priceIdMap: Record<Plan, string | undefined> = {
    BASIC: process.env.STRIPE_PLAN_BASIC,
    PROFESSIONAL: process.env.STRIPE_PLAN_PRO,
    PREMIUM: process.env.STRIPE_PLAN_PREMIUM,
  };

  const priceId = priceIdMap[type];

  if (!priceId) {
    return { error: "ID do plano não configurado no servidor." }
  }

  // CRIAR O CHECKOUT
  try {
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      metadata: {
        type: type,
        userId: userId
      },
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL!,
      cancel_url: process.env.STRIPE_CANCEL_URL!,
    })

    if (!stripeCheckoutSession.url) {
      return { error: "Não foi possível gerar o link de checkout." }
    }

    // Retorna a URL em vez do sessionId
    return {
      url: stripeCheckoutSession.url
    }

  } catch (err) {
    console.error("ERRO AO CRIAR CHECKOUT:", err)
    return {
      error: "Falha ao ativar plano."
    }
  }
}