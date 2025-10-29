"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CalendarWithTimePresetsProps {
  selectedDate?: Date
  onDateSelect?: (date: Date | undefined) => void
  selectedTime?: string | null
  selectedTimes?: string[]
  onTimeSelect?: (time: string) => void
  multiSelect?: boolean
  bookedDates?: Date[]
  timeSlots?: string[]
  showFooter?: boolean
  footerText?: string
  continueButtonText?: string
  onContinue?: () => void
  disabled?: boolean
}

export function CalendarWithTimePresets({
  selectedDate,
  onDateSelect,
  selectedTime,
  selectedTimes = [],
  onTimeSelect,
  multiSelect = false,
  bookedDates = [],
  timeSlots: customTimeSlots,
  showFooter = true,
  footerText,
  continueButtonText = "Continue",
  onContinue,
  disabled = false,
}: CalendarWithTimePresetsProps) {
  // Default time slots from 9:00 AM to 6:00 PM in 30-minute intervals
  const defaultTimeSlots = Array.from({ length: 19 }, (_, i) => {
    const totalMinutes = i * 30
    const hour = Math.floor(totalMinutes / 60) + 9
    const minute = totalMinutes % 60
    const displayHour = hour > 12 ? hour - 12 : hour
    const period = hour >= 12 ? 'PM' : 'AM'
    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
  })

  const timeSlots = customTimeSlots || defaultTimeSlots

  const handleTimeClick = (time: string) => {
    if (!disabled && onTimeSelect) {
      onTimeSelect(time)
    }
  }

  const isTimeSelected = (time: string) => {
    if (multiSelect) {
      return selectedTimes.includes(time)
    }
    return selectedTime === time
  }

  return (
    <Card className="gap-0 p-0 w-full">
      <CardContent className="relative p-0 md:pr-48">
        <div className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            defaultMonth={selectedDate}
            disabled={bookedDates}
            showOutsideDays={false}
            modifiers={{
              booked: bookedDates,
            }}
            modifiersClassNames={{
              booked: "[&>button]:line-through opacity-100",
            }}
            className="bg-transparent p-0 pointer-events-auto [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            formatters={{
              formatWeekdayName: (date) => {
                return date.toLocaleString("pt-PT", { weekday: "short" })
              },
            }}
          />
        </div>
        <div className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-t-0 md:border-l">
          <div className="grid gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={isTimeSelected(time) ? "default" : "outline"}
                onClick={() => handleTimeClick(time)}
                disabled={disabled}
                className="w-full shadow-none"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      {showFooter && (
        <CardFooter className="flex flex-col gap-4 border-t px-6 !py-5 md:flex-row">
          <div className="text-sm flex-1">
            {multiSelect ? (
              <>
                {selectedDate && selectedTimes.length > 0 ? (
                  footerText || (
                    <>
                      Selecionado:{" "}
                      <span className="font-medium">
                        {selectedDate?.toLocaleDateString("pt-PT", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}{" "}
                      </span>
                      - <span className="font-medium">{selectedTimes.length} horário(s)</span>
                    </>
                  )
                ) : (
                  <>Selecione uma data e horários (múltiplos)</>
                )}
              </>
            ) : (
              <>
                {selectedDate && selectedTime ? (
                  footerText || (
                    <>
                      Selecionado:{" "}
                      <span className="font-medium">
                        {selectedDate?.toLocaleDateString("pt-PT", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}{" "}
                      </span>
                      às <span className="font-medium">{selectedTime}</span>
                    </>
                  )
                ) : (
                  <>Selecione uma data e horário</>
                )}
              </>
            )}
          </div>
          {onContinue && (
            <Button
              disabled={
                !selectedDate || 
                (multiSelect ? selectedTimes.length === 0 : !selectedTime)
              }
              className="w-full md:ml-auto md:w-auto"
              variant="outline"
              onClick={onContinue}
            >
              {continueButtonText}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
