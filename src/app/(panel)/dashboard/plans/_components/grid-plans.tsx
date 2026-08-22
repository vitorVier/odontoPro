import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { subscriptionPlans } from "@/utils/plans/index"
import { SubscriptionButton } from "./subscription-button"
import { Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function GridPlans() {
  return (
    <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-5 px-4 py-8 md:grid-cols-3">
      {subscriptionPlans.map((plan) => {
        const isPro = plan.id === "PROFESSIONAL"
        return (
          <Card
            key={plan.id}
            className={cn(
              "relative flex h-full flex-col border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md",
              isPro && "border-emerald-300"
            )}
          >
            {isPro && (
              <div className="absolute right-4 top-4">
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </span>
              </div>
            )}

            <CardHeader className="pb-5 pt-6">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {plan.name}
              </CardTitle>

              <CardDescription className="mt-1.5 min-h-10 text-sm leading-relaxed">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 line-through">
                    {plan.oldPrice}
                  </span>
                </div>

                <div className="mt-1 flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-3xl font-bold tracking-tight",
                      isPro
                        ? "text-emerald-600"
                        : "text-gray-900"
                    )}
                  >
                    {plan.price}
                  </span>

                  <span className="text-sm text-gray-400">
                    /mês
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Incluído no plano
                </p>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5"
                    >
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          isPro
                            ? "text-emerald-500"
                            : "text-gray-400"
                        )}
                      />

                      <span className="text-sm leading-relaxed text-gray-600">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <SubscriptionButton
                type={plan.id as any}
                isPro={isPro}
              />
            </CardFooter>
          </Card>
        )
      })}
    </section>
  )
}