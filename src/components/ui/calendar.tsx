"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
        month: "space-y-6 w-full",
        caption: "flex justify-center pt-2 relative items-center mb-6",
        caption_label: "text-xl font-semibold text-gray-900",
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 bg-transparent p-0 opacity-70 hover:opacity-100 text-gray-600 hover:text-gray-900"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-2",
        head_row: "flex w-full mb-4",
        head_cell:
          "text-gray-600 rounded-md flex-1 font-semibold text-base text-center py-2",
        row: "flex w-full mt-3",
        cell: "relative p-0 text-center focus-within:relative focus-within:z-20 flex-1 flex justify-center items-center min-h-[48px]",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-12 p-0 font-medium text-base aria-selected:opacity-100 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground font-bold",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" {...props} />,
      }}
      locale={ptBR}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
