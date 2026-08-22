"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeSlot } from "./schedule-content";
import { isSlotInThePast, isToday, isSlotSequenceAvailable } from './schedule-utils'

interface ScheduleTimeListProps {
  selectedDate: Date;
  selectedTime: string;
  requiredSlots: number;
  blockedTimes: string[];
  availableTimeSlots: TimeSlot[];
  clinicTimes: string[];
  onSelectTime: (time: string) => void;
}

export function ScheduleTimeList({
  selectedDate,
  availableTimeSlots,
  blockedTimes,
  clinicTimes,
  requiredSlots,
  selectedTime,
  onSelectTime
}: ScheduleTimeListProps) {

  const dateIsToday = isToday(selectedDate)

  return (
    <Select value={selectedTime || undefined} onValueChange={onSelectTime}>
      <SelectTrigger className="w-full bg-white h-11 border-gray-200">
        <SelectValue placeholder="Selecione um horário" />
      </SelectTrigger>
      <SelectContent>
        {availableTimeSlots.map((slot) => {
          const sequenceOK = isSlotSequenceAvailable(
            slot.time,
            requiredSlots,
            clinicTimes,
            blockedTimes
          )

          const slotIsPast = dateIsToday && isSlotInThePast(slot.time)
          const slotEnabled = slot.available && sequenceOK && !slotIsPast;

          return (
            <SelectItem 
              key={slot.time} 
              value={slot.time}
              disabled={!slotEnabled}
              className="py-2.5 cursor-pointer"
            >
              {slot.time} {!slotEnabled && <span className="text-gray-400 text-xs ml-2">(Indisponível)</span>}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}