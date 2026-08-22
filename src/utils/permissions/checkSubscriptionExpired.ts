"use server"

import { Session } from "next-auth";
import { ResultPermissionProp } from "./canPermission";
import { isTrialActive } from '@/utils/permissions/isTrialActive'

export async function checkSubscriptionExpired(session: Session): Promise<ResultPermissionProp> {
  const userCreatedAt = session?.user?.createdAt
    ? new Date(session.user.createdAt)
    : new Date()

  if (!isTrialActive(userCreatedAt)) {
    return {
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    }
  }

  return {
    hasPermission: true,
    planId: "TRIAL",
    expired: false,
    plan: null,
  }
}