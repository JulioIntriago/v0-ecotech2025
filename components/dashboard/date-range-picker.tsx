"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange as ReactDayPickerRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Definimos nuestro propio tipo DateRange para independencia del sistema
export interface DateRange {
  from: Date;
  to: Date;
  empresaId?: string; // Para soporte multiempresa
}

interface DatePickerWithRangeProps {
  className?: string;
  date?: DateRange | undefined;
  setDate?: (range: DateRange | undefined) => void;
  disabled?: boolean;
  empresaId?: string; // Identificador de empresa
}

export function DatePickerWithRange({ 
  className, 
  date, 
  setDate,
  disabled = false,
  empresaId 
}: DatePickerWithRangeProps) {
  const [dateValue, setDateValue] = React.useState<DateRange | undefined>(date);

  // Sincronización con cambios externos y validación multiempresa
  React.useEffect(() => {
    if (date && (!empresaId || date.empresaId === empresaId)) {
      setDateValue(date);
    }
  }, [date, empresaId]);

  const handleDateChange = (newDate: ReactDayPickerRange | undefined) => {
    if (!newDate || !newDate.from) {
      setDateValue(undefined);
      setDate?.(undefined);
      return;
    }

    const range: DateRange = {
      from: newDate.from,
      to: newDate.to || newDate.from, // Si no hay 'to', usamos 'from'
      empresaId
    };

    setDateValue(range);
    setDate?.(range);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", {
      // Puedes agregar configuración regional por empresa si es necesario
    });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateValue && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue?.from ? (
              dateValue.to ? (
                <>
                  {formatDate(dateValue.from)} - {formatDate(dateValue.to)}
                </>
              ) : (
                formatDate(dateValue.from)
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
            selected={{
              from: dateValue?.from,
              to: dateValue?.to
            }}
            onSelect={handleDateChange}
            numberOfMonths={2}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}