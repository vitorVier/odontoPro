"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PatientsSearchInputProps {
  defaultValue: string
}

export function PatientsSearchInput({ defaultValue }: PatientsSearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [value, setValue] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    }, 400) // debounce: espera 400ms sem digitar antes de buscar

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar paciente..."
        className="h-10 rounded-xl pl-9 pr-9"
      />

      {isPending && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}