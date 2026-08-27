import { Sparkles } from "lucide-react"

export function WelcomeStep({ userName }: { userName: string | null }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>

      <h2 className="text-lg font-bold tracking-tight">
        Bem-vindo{userName ? `, ${userName.split(" ")[0]}` : ""}!
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Vamos configurar sua clínica em poucos passos, pra você já começar a receber agendamentos hoje mesmo.
      </p>
    </div>
  )
}