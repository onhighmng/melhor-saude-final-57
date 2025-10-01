"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

interface CalendarDayProps {
  day: number | string;
  isHeader?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  isToday?: boolean;
  onClick?: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isHeader,
  isSelected,
  isDisabled,
  isToday,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isHeader}
      className={cn(
        "flex h-12 w-full items-center justify-center transition-all duration-200 font-baskervville",
        isHeader ? "cursor-default font-comfortaa text-xs font-medium text-muted-foreground" : "rounded-lg cursor-pointer text-sm",
        !isHeader && !isDisabled && !isSelected && "hover:bg-muted hover:scale-105",
        isSelected && "bg-foreground text-background font-semibold",
        isToday && !isSelected && "bg-muted font-semibold",
        !isHeader && !isSelected && !isToday && "text-foreground",
        isDisabled && !isHeader && "opacity-30 cursor-not-allowed text-muted-foreground",
      )}
    >
      {day}
    </button>
  );
};

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingCalendarProps {
  /** Currently selected date */
  selectedDate?: Date;
  /** Callback when a date is selected */
  onDateSelect?: (date: Date) => void;
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
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    if (onDateSelect) {
      const newDate = new Date(year, month, day);
      onDateSelect(newDate);
    }
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isDateToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderCalendarDays = () => {
    let days: React.ReactNode[] = [
      ...dayNames.map((day, i) => (
        <CalendarDay key={`header-${day}`} day={day} isHeader />
      )),
      ...Array(firstDayOfWeek)
        .fill(null)
        .map((_, i) => (
          <div key={`empty-start-${i}`} className="h-12 w-full" />
        )),
      ...Array(daysInMonth)
        .fill(null)
        .map((_, i) => {
          const day = i + 1;
          return (
            <CalendarDay
              key={`date-${day}`}
              day={day}
              isSelected={isDateSelected(day)}
              isToday={isDateToday(day)}
              isDisabled={isDateDisabled(day)}
              onClick={() => !isDateDisabled(day) && handleDateClick(day)}
            />
          );
        }),
    ];

    return days;
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "";
    const dayName = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][selectedDate.getDay()];
    return `${dayName} ${selectedDate.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex gap-8", className)}>
      {/* Calendar Section */}
      <div className="flex-1 max-w-md">
        <div className="bg-card rounded-2xl border border-border p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-comfortaa font-semibold text-foreground">
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="h-8 w-8 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="h-8 w-8 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </div>
      </div>

      {/* Time Selection Section */}
      {showTimeSelection && selectedDate && (
        <div className="w-80">
          <div className="sticky top-4">
            <h3 className="text-lg font-comfortaa font-semibold text-foreground mb-4">
              {formatSelectedDate()}
            </h3>
            <div className="bg-card rounded-2xl border border-border p-4 max-h-[600px] overflow-y-auto scrollbar-hide">
              <div className="space-y-2">
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && onTimeSelect?.(slot.time)}
                      disabled={!slot.available}
                      className={cn(
                        "w-full py-3 px-4 rounded-lg text-center font-baskervville transition-all duration-200",
                        selectedTime === slot.time
                          ? "bg-foreground text-background font-semibold"
                          : slot.available
                          ? "bg-background hover:bg-muted border border-border hover:border-foreground/20"
                          : "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                      )}
                    >
                      {slot.time}
                    </button>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8 font-baskervville">
                    Nenhum horário disponível para esta data
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}