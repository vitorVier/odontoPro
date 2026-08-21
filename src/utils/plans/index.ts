
export type PlanDetailsProps = {
  maxServices: number;
}

export type PlansProps = {
  BASIC: PlanDetailsProps;
  PROFESSIONAL: PlanDetailsProps;
  PREMIUM: PlanDetailsProps;
}

export const PLANS: PlansProps = {
  BASIC: {
    maxServices: 10,
  },
  PROFESSIONAL: {
    maxServices: 50
  },
  PREMIUM: {
    maxServices: 999
  }
}

export const subscriptionPlans = [
  {
    id: "BASIC",
    name: "Básico",
    description: "Perfeito para dentistas autônomos",
    oldPrice: "R$ 89,90",
    price: "R$ 49,99",
    features: [
      `Até ${PLANS["BASIC"].maxServices} serviços`,
      'Agendamentos ilimitados',
      'Página pública',
      'Suporte por email',
    ]
  },
  {
    id: "PROFESSIONAL",
    name: "Profissional",
    description: "O mais escolhido pelas clínicas",
    oldPrice: "R$ 189,90",
    price: "R$ 129,90",
    features: [
      `Até ${PLANS["PROFESSIONAL"].maxServices} serviços`,
      'Agendamentos ilimitados',
      'Página pública premium',
      'Suporte prioritário (WhatsApp)',
    ]
  },
  {
    id: "PREMIUM",
    name: "Premium",
    description: "Gestão completa para grandes redes",
    oldPrice: "R$ 299,90",
    price: "R$ 199,90",
    features: [
      `Serviços Ilimitados`,
      'Agendamentos ilimitados',
      'Página pública premium',
      'Relatórios e métricas avançadas',
      'Suporte prioritário (WhatsApp)',
    ]
  }
]