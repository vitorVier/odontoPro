const SLOT_MINUTES = 30

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}

export function generateTimeSlots(clinicTimes: string[]): string[] {
  if (!clinicTimes || clinicTimes.length === 0) {
    return []
  }

  const sortedMinutes = clinicTimes
    .map(timeToMinutes)
    .sort((a, b) => a - b)

  const start = sortedMinutes[0]
  const end = sortedMinutes[sortedMinutes.length - 1]

  const slots: string[] = []
  for (let minutes = start; minutes <= end; minutes += SLOT_MINUTES) {
    slots.push(minutesToTime(minutes))
  }

  return slots
}