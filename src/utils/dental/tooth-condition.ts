import { ToothCondition } from "@prisma/client"

export const TOOTH_CONDITION_CONFIG: Record<ToothCondition, { label: string; color: string; textColor: string }> = {
  HEALTHY: { label: "Saudável", color: "bg-background border-border", textColor: "text-foreground" },
  CAVITY: { label: "Cárie", color: "bg-rose-500/15 border-rose-500/40", textColor: "text-rose-700" },
  RESTORED: { label: "Restaurado", color: "bg-blue-500/15 border-blue-500/40", textColor: "text-blue-700" },
  ROOT_CANAL: { label: "Canal", color: "bg-purple-500/15 border-purple-500/40", textColor: "text-purple-700" },
  CROWN: { label: "Coroa", color: "bg-amber-500/15 border-amber-500/40", textColor: "text-amber-700" },
  EXTRACTED: { label: "Extraído", color: "bg-muted border-border", textColor: "text-muted-foreground" },
  MISSING: { label: "Ausente", color: "bg-muted/40 border-dashed border-border", textColor: "text-muted-foreground/50" },
  IMPLANT: { label: "Implante", color: "bg-emerald-500/15 border-emerald-500/40", textColor: "text-emerald-700" },
}

// Numeração FDI, dividida por quadrante — padrão odontológico universal
export const TOOTH_QUADRANTS = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
}