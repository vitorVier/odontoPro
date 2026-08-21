"use server"

import { Session } from "next-auth";
import { addDays, isAfter } from 'date-fns'
import { ResultPermissionProp } from "./canPermission";
import { TRIAL_DAYS } from '@/utils/permissions/trial-limits'

export async function checkSubscriptionExpired(session: Session): Promise<ResultPermissionProp> {
  const userCreatedAt = session?.user?.createdAt
    ? new Date(session.user.createdAt)
    : new Date()

  const trailEndDate = addDays(userCreatedAt, TRIAL_DAYS)

  if (isAfter(new Date(), trailEndDate)) {
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