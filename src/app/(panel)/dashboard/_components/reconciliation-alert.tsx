import Link from "next/link"
import { ClipboardCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ReconciliationAlert({ count }: { count: number }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg shrink-0 bg-primary/10 text-primary">
          <ClipboardCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">
            {count} consulta{count > 1 ? "s" : ""} aguardando confirmação
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dê baixa nas consultas já realizadas para manter seus relatórios em dia.
          </p>
        </div>
      </div>

      <Button asChild size="sm" className="w-full shrink-0 sm:w-auto">
        <Link href="/dashboard/agenda/closing" className="flex items-center gap-1.5">
          Revisar agora
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </Button>
    </div>
  )
}