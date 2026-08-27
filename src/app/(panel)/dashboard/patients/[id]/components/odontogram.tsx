"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ToothRecord, ToothCondition } from "@prisma/client"
import { TOOTH_QUADRANTS, TOOTH_CONDITION_CONFIG } from "@/utils/dental/tooth-condition"
import { ToothDialog } from "./tooth-dialog"

interface OdontogramProps {
  patientId: string
  toothRecords: ToothRecord[]
  onChanged: () => void
}

export function Odontogram({ patientId, toothRecords, onChanged }: OdontogramProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const recordMap = new Map(toothRecords.map((r) => [r.toothNumber, r]))

  function getTooth(number: number) {
    return recordMap.get(number) ?? { condition: "HEALTHY" as ToothCondition, notes: "" }
  }

  function handleToothClick(number: number) {
    setSelectedTooth(number)
    setDialogOpen(true)
  }

  function renderRow(numbers: number[]) {
    return (
      <div className="flex gap-1">
        {numbers.map((number) => {
          const tooth = getTooth(number)
          const config = TOOTH_CONDITION_CONFIG[tooth.condition]

          return (
            <button
              key={number}
              type="button"
              onClick={() => handleToothClick(number)}
              title={`Dente ${number} — ${config.label}`}
              className={cn(
                "flex h-10 w-9 flex-col items-center justify-center rounded-md border-2 text-[10px] font-bold transition-all hover:scale-105",
                config.color,
                config.textColor
              )}
            >
              {number}
            </button>
          )
        })}
      </div>
    )
  }

  const selected = selectedTooth ? getTooth(selectedTooth) : null

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="space-y-1">
          <div className="flex gap-6">
            {renderRow(TOOTH_QUADRANTS.upperRight)}
            {renderRow(TOOTH_QUADRANTS.upperLeft)}
          </div>
          <div className="flex gap-6">
            {renderRow(TOOTH_QUADRANTS.lowerRight)}
            {renderRow(TOOTH_QUADRANTS.lowerLeft)}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap justify-center gap-3 pt-2 border-t">
        {Object.entries(TOOTH_CONDITION_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn("h-3 w-3 rounded-sm border-2", cfg.color)} />
            {cfg.label}
          </div>
        ))}
      </div>

      <ToothDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        patientId={patientId}
        toothNumber={selectedTooth}
        currentCondition={selected?.condition ?? "HEALTHY"}
        currentNotes={selected?.notes ?? ""}
        onSaved={onChanged}
      />
    </div>
  )
}