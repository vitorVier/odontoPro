import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

interface LabelSubscriptionProps {
  expired: boolean;
}

export function LabelSubscription({ expired }: LabelSubscriptionProps) {
  return (
    <div
      role="alert"
      className={clsx(
        "my-4 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border shadow-2xs transition-all duration-200",
        {
          "bg-rose-50/80 border-rose-200 text-rose-950": expired,
          "bg-amber-50/80 border-amber-200 text-amber-950": !expired,
        }
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx("p-2 rounded-lg shrink-0 mt-0.5", {
            "bg-rose-100 text-rose-600": expired,
            "bg-amber-100 text-amber-600": !expired,
          })}
        >
          {expired ? (
            <Clock className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>

        <div className="space-y-0.5">
          <h3 className="font-semibold text-sm md:text-base leading-tight">
            {expired
              ? "Seu plano expirou ou você não possui um plano ativo!"
              : "Você atingiu o limite do seu plano atual!"}
          </h3>
          <p
            className={clsx("text-xs md:text-sm", {
              "text-rose-700/90": expired,
              "text-amber-700/90": !expired,
            })}
          >
            Acesse as configurações de assinatura para regularizar a sua conta.
          </p>
        </div>
      </div>

      <Button
        asChild
        size="sm"
        className={clsx("w-fit shrink-0 font-medium self-end md:self-center", {
          "bg-rose-600 hover:bg-rose-700 text-white": expired,
          "bg-amber-600 hover:bg-amber-700 text-white": !expired,
        })}
      >
        <Link href="/dashboard/plans" className="flex items-center gap-1.5">
          <span>Ver planos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </Button>
    </div>
  );
}