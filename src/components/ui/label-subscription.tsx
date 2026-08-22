import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

type LabelSubscriptionVariant = "expired" | "limit" | "trial";

interface LabelSubscriptionProps {
  variant: LabelSubscriptionVariant;
  message?: string;
}

const VARIANT_CONFIG = {
  expired: {
    theme: "bg-rose-50/80 border-rose-200 text-rose-950",
    iconBg: "bg-rose-100 text-rose-600",
    icon: Clock,
    title: "Seu plano expirou ou você não possui um plano ativo!",
    defaultMessage: "Acesse as configurações de assinatura para regularizar a sua conta.",
    messageColor: "text-rose-700/90",
    button: "bg-rose-600 hover:bg-rose-700 text-white",
  },
  limit: {
    theme: "bg-amber-50/80 border-amber-200 text-amber-950",
    iconBg: "bg-amber-100 text-amber-600",
    icon: AlertTriangle,
    title: "Você atingiu o limite do seu plano atual!",
    defaultMessage: "Acesse as configurações de assinatura para regularizar a sua conta.",
    messageColor: "text-amber-700/90",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  trial: {
    theme: "bg-emerald-50/80 border-emerald-200 text-emerald-950",
    iconBg: "bg-emerald-100 text-emerald-600",
    icon: PartyPopper,
    title: "Você está no período de teste gratuito!",
    defaultMessage: "Aproveite para conhecer todos os recursos antes de escolher seu plano.",
    messageColor: "text-emerald-700/90",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
} as const;

export function LabelSubscription({ variant, message }: LabelSubscriptionProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={clsx(
        "my-4 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border shadow-2xs transition-all duration-200",
        config.theme
      )}
    >
      <div className="flex items-start gap-3">
        <div className={clsx("p-2 rounded-lg shrink-0 mt-0.5", config.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="space-y-0.5">
          <h3 className="font-semibold text-sm md:text-base leading-tight">
            {config.title}
          </h3>
          <p className={clsx("text-xs md:text-sm", config.messageColor)}>
            {message || config.defaultMessage}
          </p>
        </div>
      </div>

      <Button
        asChild
        size="sm"
        className={clsx("w-fit shrink-0 font-medium self-end md:self-center", config.button)}
      >
        <Link href="/dashboard/plans" className="flex items-center gap-1.5">
          <span>Ver planos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </Button>
    </div>
  );
}