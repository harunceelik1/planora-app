"use client";
import { format } from "date-fns";
import { enUS, tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Control, Controller } from "react-hook-form";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
interface FormDatePickerProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
}
export function FormDatePicker({
  control,
  name,
  label,
  placeholder,
}: FormDatePickerProps) {
  const locale = useLocale();
  const dateLocale = locale === "tr" ? tr : enUS;
  const placeholderText =
    placeholder ?? (locale === "tr" ? "Tarih seçiniz" : "Select date");

  return (
    <div className="space-y-1.5 w-full">
      {label && <Label>{label}</Label>}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full pl-3 text-left font-normal h-10",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value ? (
                  format(field.value, "PPP", { locale: dateLocale })
                ) : (
                  <span>{placeholderText}</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown" // Ay ve yılın dropdown olmasını sağlar
                selected={field.value}
                onSelect={field.onChange} // RHF'e değeri gönderir
                disabled={(date) =>
                  date > new Date("2100-01-01") || date < new Date("1940-01-01")
                }
                locale={dateLocale}
              />
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  );
}
