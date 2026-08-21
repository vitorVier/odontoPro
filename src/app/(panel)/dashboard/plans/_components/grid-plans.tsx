import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { subscriptionPlans } from '@/utils/plans/index'
import { SubscriptionButton } from './subscription-button'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GridPlans() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto py-8 px-4">
      {subscriptionPlans.map((plan) => {
        const isPro = plan.id === "PROFESSIONAL";
        return (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col w-full h-full border-border/50 transition-all duration-300 hover:shadow-lg bg-card",
              isPro && "border-emerald-500 shadow-md shadow-emerald-500/10 scale-100 lg:scale-105 z-10"
            )}
          >
            {isPro && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider py-1 px-3.5 rounded-full shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  MAIS POPULAR
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-2xl font-bold text-foreground">
                {plan.name}
              </CardTitle>
              <CardDescription className="text-sm mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 px-6 pb-6 space-y-6">
              <div className="flex flex-col items-center">
                <div className="flex items-baseline gap-1 text-muted-foreground line-through text-sm h-5">
                  {plan.oldPrice}
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold text-foreground tracking-tight">{plan.price}</span>
                  <span className="text-sm font-medium text-muted-foreground">/mês</span>
                </div>
              </div>

              <div className="space-y-3.5 pt-6 border-t border-border/40">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={cn(
                      "shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                      isPro ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary"
                    )}>
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80 leading-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="px-6 pb-8 pt-0 mt-auto">
              <SubscriptionButton type={plan.id as any} isPro={isPro} />
            </CardFooter>
          </Card>
        )
      })}
    </section>
  )
}