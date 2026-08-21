"use server"

import { Plan } from '@prisma/client'
import { PlansProps } from '@/utils/plans/index'

export interface PlanDetailInfo {
  maxServices: number;
}

const PLANS_LIMITS: PlansProps = {
  BASIC: {
    maxServices: 10,
  },
  PREMIUM: {
    maxServices: 50
  },
  PROFESSIONAL: {
    maxServices: 999
  }
}

export async function getPlan(planId: Plan) {
  return PLANS_LIMITS[planId]
}
