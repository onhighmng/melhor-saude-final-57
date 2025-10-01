"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

interface CalendarDayProps {
  day: number | string;
  isHeader?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isHeader,
  isSelected,
  isDisabled,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isHeader}
      className={cn(
        "col-span-1 row-span-1 flex h-8 w-8 items-center justify-center transition-all duration-200",
        isHeader ? "cursor-default" : "rounded-xl cursor-pointer",
        !isHeader && !isDisabled && !isSelected && "hover:bg-primary/10 hover:scale-105",
        isSelected && "bg-primary text-primary-foreground shadow-md scale-105",
        !isHeader && !isSelected && "text-muted-foreground",
        isDisabled && !isHeader && "opacity-30 cursor-not-allowed",
        isHeader && "text-text-muted"
      )}
    >
      <span className={cn(
        "font-medium transition-colors",
        isHeader ? "text-xs font-comfortaa" : "text-sm font-baskervville"
      )}>
        {day}
      </span>
    </button>
  );
};

interface BookingCalendarProps {
  /** Optional title for the calendar */
  title?: string;
  /** Optional description */
  description?: string;
  /** Show book now button */
  showBookButton?: boolean;
  /** Callback when book button is clicked */
  onBook?: () => void;
  /** Callback when a date is selected */
  onDateSelect?: (date: Date) => void;
  /** Currently selected date */
  selectedDate?: Date;
  /** Custom class name */
  className?: string;
  /** Link for booking (external) */
  bookingLink?: string;
}

export function BookingCalendar({
  title = "Tem dúvidas sobre o agendamento?",
  description = "Entre em contato conosco!",
  showBookButton = true,
  onBook,
  onDateSelect,
  selectedDate,
  className,
  bookingLink,
}: BookingCalendarProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("pt-BR", { month: "long" });
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(
    currentYear,
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const handleDateClick = (day: number) => {
    if (onDateSelect) {
      const newDate = new Date(currentYear, currentDate.getMonth(), day);
      onDateSelect(newDate);
    }
  };

  const handleBookClick = () => {
    if (bookingLink) {
      window.open(bookingLink, '_blank', 'noopener,noreferrer');
    } else if (onBook) {
      onBook();
    }
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const renderCalendarDays = () => {
    let days: React.ReactNode[] = [
      ...dayNames.map((day, i) => (
        <CalendarDay key={`header-${day}`} day={day} isHeader />
      )),
      ...Array(firstDayOfWeek)
        .fill(null)
        .map((_, i) => (
          <div
            key={`empty-start-${i}`}
            className="col-span-1 row-span-1 h-8 w-8"
          />
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
              onClick={() => handleDateClick(day)}
            />
          );
        }),
    ];

    return days;
  };

  return (
    <div className={cn("group relative flex flex-col rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all duration-300", className)}>
      {bookingLink && (
        <div className="absolute bottom-4 right-6 z-[999] flex h-12 w-12 rotate-6 items-center justify-center rounded-full bg-primary/10 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-[-8px] group-hover:rotate-0 group-hover:opacity-100">
          <svg
            className="h-6 w-6 text-primary"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.25 15.25V6.75H8.75"
            ></path>
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 7L6.75 17.25"
            ></path>
          </svg>
        </div>
      )}
      <div className="absolute inset-0 z-30 bg-gradient-to-tl from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 rounded-2xl pointer-events-none"></div>

      <div className="grid h-full gap-5">
        <div className="space-y-3">
          <h2 className="text-h2 text-foreground">
            {title}
          </h2>
          <p className="text-small text-muted-foreground">
            {description}
          </p>
          {showBookButton && (
            <Button onClick={handleBookClick} className="mt-3 rounded-2xl font-baskervville">
              Agendar Agora
            </Button>
          )}
        </div>
        <div className="transition-all duration-500 ease-out">
          <div>
            <div className="h-full w-full max-w-[550px] rounded-[24px] border border-border p-2 transition-colors duration-300 group-hover:border-primary/60">
              <div
                className="h-full rounded-2xl border-2 border-border/30 p-3 backdrop-blur-sm"
                style={{ boxShadow: "0px 2px 1.5px 0px hsl(var(--border) / 0.3) inset" }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <p className="text-sm font-comfortaa">
                    <span className="font-medium capitalize">
                      {currentMonth}, {currentYear}
                    </span>
                  </p>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground">&nbsp;</span>
                  <p className="text-xs text-muted-foreground font-baskervville">
                    Selecione uma data
                  </p>
                </div>
                <div className="grid grid-cols-7 grid-rows-6 gap-2 px-4">
                  {renderCalendarDays()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}