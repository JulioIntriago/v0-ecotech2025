"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker"; // Importación corregida

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Definimos las props del componente
interface DatePickerWithRangeProps {
  className?: string;
  date?: DateRange | undefined;
  setDate?: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

// Exportamos el tipo DateRange para que otros componentes puedan usarlo
export type { DateRange };

export function DatePickerWithRange({ className, date, setDate }: DatePickerWithRangeProps) {
  // Estado local para manejar el rango de fechas
  const [dateValue, setDateValue] = React.useState<DateRange | undefined>(date);

  // Sincronizamos el estado local con la prop date cuando cambia
  React.useEffect(() => {
    setDateValue(date);
  }, [date]);

  // Manejar el cambio de fechas
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDateValue(newDate);
    if (setDate) {
      setDate(newDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !dateValue && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue?.from ? (
              dateValue.to ? (
                <>
                  {format(dateValue.from, "dd/MM/yyyy")} - {format(dateValue.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(dateValue.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Seleccionar rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateValue?.from}
            selected={dateValue}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}