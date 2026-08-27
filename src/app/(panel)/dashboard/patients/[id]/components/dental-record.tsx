"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Sparkles, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Odontogram } from "./odontogram"
import { ClinicalTimeline } from "./clinical-timeline"
import { ToothRecord } from "@prisma/client"

interface DentalRecordProps {
  patientId: string
  hasPermission: boolean
  toothRecords: ToothRecord[]
  clinicalRecords: { id: string; title: string; description: string; createdAt: Date }[]
}

export function DentalRecord({ patientId, hasPermission, toothRecords, clinicalRecords }: DentalRecordProps) {
  const router = useRouter()
  const [tab, setTab] = useState("odontogram")

  function handleChanged() {
    router.refresh()
  }

  if (!hasPermission) {
    return (
      <Card className="border-border/50 shadow-xs">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold">Prontuário odontológico</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div
            role="alert"
            className="flex flex-col gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg shrink-0 bg-amber-500/10 text-amber-600">
                <Lock className="w-4 h-4" />
              </div>
              <p className="text-sm text-muted-foreground">
                Odontograma e prontuário clínico disponíveis a partir do plano <strong className="text-foreground">PROFESSIONAL</strong>.
              </p>
            </div>
            <Button asChild size="sm" className="w-full shrink-0 bg-amber-500 hover:bg-amber-600 text-white sm:w-auto">
              <Link href="/dashboard/plans" className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Conhecer Planos
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 shadow-xs">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base font-semibold">Prontuário odontológico</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="odontogram">Odontograma</TabsTrigger>
            <TabsTrigger value="records">Prontuário</TabsTrigger>
          </TabsList>

          <TabsContent value="odontogram" className="pt-4">
            <Odontogram patientId={patientId} toothRecords={toothRecords} onChanged={handleChanged} />
          </TabsContent>

          <TabsContent value="records" className="pt-4">
            <ClinicalTimeline patientId={patientId} records={clinicalRecords} onChanged={handleChanged} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}