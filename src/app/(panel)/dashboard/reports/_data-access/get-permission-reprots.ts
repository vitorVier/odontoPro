"use server"

import prisma from "@/lib/prisma";

export async function getPermissionUserToReports({ userId }: { userId: string }) {
  if (!userId) return false;

  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { subscription: true }
  });

  if (!user?.subscription) {
    return false;
  }

  // Permite se o plano for PROFESSIONAL ou PREMIUM
  const hasAllowedPlan =
    user.subscription.plan === "PROFESSIONAL" ||
    user.subscription.plan === "PREMIUM";

  // Opcional: Garante que a assinatura está ativa ou em período de carência
  const hasActiveStatus =
    user.subscription.status === "active" ||
    Boolean(user.subscription.cancelAtPeriodEnd);

  return hasAllowedPlan && hasActiveStatus;
}