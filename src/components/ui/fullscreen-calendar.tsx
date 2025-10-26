import * as React from "react";
import { add, eachDayOfInterval, endOfMonth, endOfWeek, format, getDay, isEqual, isSameDay, isSameMonth, isToday, parse, startOfToday, startOfWeek } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon, SearchIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";
interface Event {
  id: string | number;
  name: string;
  time: string;
  datetime: string;
  userName?: string;
  pillar?: string;
}
interface CalendarData {
  day: Date;
  events: Event[];
}
interface FullScreenCalendarProps {
  data: CalendarData[];
  onAddEvent?: () => void;
  onEventClick?: (event: Event) => void;
  onDayClick?: (date: Date) => void;
  onSetAvailability?: () => void;
}
const colStartClasses = ["", "col-start-2", "col-start-3", "col-start-4", "col-start-5", "col-start-6", "col-start-7"];
const getPillarColor = (pillar: string) => {
  const colors = {
    psychological: 'bg-blue-500',
    physical: 'bg-green-500',
    financial: 'bg-purple-500',
    legal: 'bg-orange-500'
  };
  return colors[pillar as keyof typeof colors] || 'bg-gray-500';
};
const getUserInitials = (name: string) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};
export function FullScreenCalendar({
  data,
  onAddEvent,
  onEventClick,
  onDayClick,
  onSetAvailability
}: FullScreenCalendarProps) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = React.useState(today);
  const [currentMonth, setCurrentMonth] = React.useState(format(today, "MMM-yyyy"));
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth))
  });
  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, {
      months: -1
    });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }
  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, {
      months: 1
    });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }
  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"));
  }
  return <div className="flex flex-1 flex-col">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-2 p-3 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
        <div className="flex flex-auto">
          <div className="flex items-center gap-3">
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border bg-muted p-1 md:flex">
              <h1 className="p-0.5 text-sm uppercase text-muted-foreground font-semibold">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border bg-background p-1 text-xl font-bold">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">

          <Separator orientation="vertical" className="hidden h-5 lg:block" />

          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
            <Button onClick={previousMonth} className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 h-8" variant="outline" size="icon" aria-label="Navigate to previous month">
              <ChevronLeftIcon size={14} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button onClick={goToToday} className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto h-8 text-sm px-3" variant="outline">
              Today
            </Button>
            <Button onClick={nextMonth} className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 h-8" variant="outline" size="icon" aria-label="Navigate to next month">
              <ChevronRightIcon size={14} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-5 md:block" />
          <Separator orientation="horizontal" className="block w-full md:hidden" />

          {onSetAvailability && <Button onClick={onSetAvailability} variant="outline" className="w-full gap-2 md:w-auto h-8 text-sm">
              <Clock size={14} strokeWidth={2} aria-hidden="true" />
              <span>Disponibilidade</span>
            </Button>}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border text-center text-xs font-semibold leading-6 lg:flex-none">
          <div className="border-r py-2">Dom</div>
          <div className="border-r py-2">Seg</div>
          <div className="border-r py-2">Ter</div>
          <div className="border-r py-2">Qua</div>
          <div className="border-r py-2">Qui</div>
          <div className="border-r py-2">Sex</div>
          <div className="py-2">Sáb</div>
        </div>

        {/* Calendar Days */}
        <div className="flex text-xs leading-6 lg:flex-auto">
          <div className="hidden w-full border-x lg:grid lg:grid-cols-7 lg:grid-rows-5 lg:gap-0">
            {days.map((day, dayIdx) => !isDesktop ? <button onClick={() => setSelectedDay(day)} key={dayIdx} type="button" className={cn(isEqual(day, selectedDay) && "text-primary-foreground", !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && "text-foreground", !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && "text-muted-foreground", (isEqual(day, selectedDay) || isToday(day)) && "font-semibold", "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10")}>
                  <time dateTime={format(day, "yyyy-MM-dd")} className={cn("ml-auto flex size-6 items-center justify-center rounded-full", isEqual(day, selectedDay) && isToday(day) && "bg-primary text-primary-foreground", isEqual(day, selectedDay) && !isToday(day) && "bg-primary text-primary-foreground")}>
                    {format(day, "d")}
                  </time>
                  {data.filter(date => isSameDay(date.day, day)).length > 0 && <div>
                      {data.filter(date => isSameDay(date.day, day)).map(date => <div key={date.day.toString()} className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                            {date.events.map(event => <span key={event.id} className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground" />)}
                          </div>)}
                    </div>}
                </button> : <div key={dayIdx} onClick={() => {
            setSelectedDay(day);
            onDayClick?.(day);
          }} className={cn(dayIdx === 0 && colStartClasses[getDay(day)], !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && "bg-gray-50", "relative flex flex-col border-b border-r hover:bg-muted focus:z-10 h-24 cursor-pointer", !isEqual(day, selectedDay) && "hover:bg-gray-100")}>
                  <header className="flex items-center justify-between p-2">
                    <button type="button" className={cn(isEqual(day, selectedDay) && "text-primary-foreground", !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && "text-gray-900", !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && "text-gray-400", isEqual(day, selectedDay) && isToday(day) && "border-none bg-primary", isEqual(day, selectedDay) && !isToday(day) && "bg-foreground", (isEqual(day, selectedDay) || isToday(day)) && "font-semibold", "flex h-7 w-7 items-center justify-center rounded-full text-base hover:border font-semibold")}>
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                    </button>
                  </header>
                  <div className="flex-1 p-2 overflow-hidden">
                    {data.filter(event => isSameDay(event.day, day)).map(dayData => <div key={dayData.day.toString()} className="flex flex-wrap gap-1">
                          {dayData.events.map(event => <div key={event.id} onClick={e => {
                  e.stopPropagation();
                  onEventClick?.(event);
                }} className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity", getPillarColor(event.pillar || ''))} title={event.name}>
                              {getUserInitials(event.userName || event.name)}
                            </div>)}
                        </div>)}
                  </div>
                </div>)}
          </div>

          <div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x lg:hidden">
            {days.map((day, dayIdx) => <button onClick={() => setSelectedDay(day)} key={dayIdx} type="button" className={cn(isEqual(day, selectedDay) && "text-primary-foreground", !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && "text-gray-900", !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && "text-gray-400 bg-gray-50", (isEqual(day, selectedDay) || isToday(day)) && "font-semibold", "flex h-14 flex-col border-b border-r px-2 py-2 hover:bg-gray-100 focus:z-10")}>
                <time dateTime={format(day, "yyyy-MM-dd")} className={cn("ml-auto flex size-7 items-center justify-center rounded-full text-sm font-semibold", isEqual(day, selectedDay) && isToday(day) && "bg-primary text-primary-foreground", isEqual(day, selectedDay) && !isToday(day) && "bg-primary text-primary-foreground")}>
                  {format(day, "d")}
                </time>
                {data.filter(date => isSameDay(date.day, day)).length > 0 && <div className="flex flex-wrap gap-0.5 mt-auto">
                    {data.filter(date => isSameDay(date.day, day)).map(dayData => <div key={dayData.day.toString()} className="flex flex-wrap gap-0.5">
                          {dayData.events.slice(0, 3).map(event => <div key={event.id} className={cn("h-2 w-2 rounded-full", getPillarColor(event.pillar || ''))} title={event.name} />)}
                        </div>)}
                  </div>}
              </button>)}
          </div>
        </div>
      </div>
    </div>;
}