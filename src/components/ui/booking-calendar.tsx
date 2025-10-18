"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingCalendarProps {
  /** Currently selected date */
  selectedDate?: Date;
  /** Callback when a date is selected */
  onDateSelect?: (date: Date | undefined) => void;
  /** Currently selected time */
  selectedTime?: string;
  /** Callback when a time is selected */
  onTimeSelect?: (time: string) => void;
  /** Available time slots */
  timeSlots?: TimeSlot[];
  /** Show time selection panel */
  showTimeSelection?: boolean;
  /** Custom class name */
  className?: string;
}

export function BookingCalendar({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  timeSlots = [],
  showTimeSelection = true,
  className,
}: BookingCalendarProps) {
  const today = new Date();
  
  // Default time slots if none provided
  const defaultTimeSlots = [
    { time: "09:00", available: true },
    { time: "09:30", available: true },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: true },
    { time: "11:30", available: true },
    { time: "12:00", available: true },
    { time: "12:30", available: true },
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: true },
    { time: "15:00", available: true },
    { time: "15:30", available: true },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
  ];

  const slots = timeSlots.length > 0 ? timeSlots : defaultTimeSlots;

  return (
    <div className={cn("w-full", className)}>

      {/* Main Calendar Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Calendar Section */}
          <div className="flex-1 p-8 min-w-0">
            <Calendar
              key="booking-calendar"
              mode="single"
              selected={selectedDate}
              onSelect={(newDate) => {
                if (onDateSelect) {
                  onDateSelect(newDate || undefined);
                }
              }}
              className="w-full max-w-none"
              disabled={[
                { before: today },
              ]}
              locale={ptBR}
              classNames={{
                caption_label: "text-2xl font-bold text-gray-900",
                day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 rounded-lg font-semibold",
                day_today: "bg-blue-50 text-blue-600 font-bold",
                head_cell: "text-gray-600 flex-1 font-semibold text-lg text-center py-3",
                day: "h-12 w-12 p-0 font-semibold text-lg aria-selected:opacity-100 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors",
              }}
            />
          </div>

          {/* Time Selection Section */}
          {showTimeSelection && selectedDate && (
            <div className="lg:w-80 border-l border-gray-200 bg-gray-50">
              <div className="p-6 h-full flex flex-col">
                {/* Selected Date Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </h3>
                </div>

                {/* Time Slots */}
                <div className="flex-1">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {slots.map(({ time: timeSlot, available }) => (
                        <button
                          key={timeSlot}
                          onClick={() => available && onTimeSelect?.(timeSlot)}
                          disabled={!available}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-lg border transition-all duration-200",
                            "text-sm font-medium",
                            available
                              ? selectedTime === timeSlot
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-sm"
                              : "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                          )}
                        >
                          {timeSlot}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Time Zone Info */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Horário de Moçambique GMT+2</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}