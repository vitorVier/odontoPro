import { TRIAL_DAYS } from "./trial-limits"
import { subDays } from "date-fns"

export function isTrialActive(createdAt: Date, now: Date = new Date()) {
  return createdAt >= subDays(now, TRIAL_DAYS)
}

export function getTrialCutoffDate(now: Date = new Date()) {
  return subDays(now, TRIAL_DAYS)
}