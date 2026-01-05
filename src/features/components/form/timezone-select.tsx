"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Control, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const timezones = Intl.supportedValuesOf("timeZone");

interface TimezoneSelectProps {
  control: Control<any>;
  name: string;
  label?: string;
}

export function TimezoneSelect({ control, name, label }: TimezoneSelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-1.5 w-full">
      {label && <Label>{label}</Label>}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between font-normal",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value
                  ? timezones
                      .find((tz) => tz === field.value)
                      ?.replace(/_/g, " ")
                  : "Zaman dilimi seçin..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Şehir veya bölge ara..." />
                {/* 👇 DÜZELTME: Scroll sınıfını buraya taşıdık */}
                <CommandList
                  className="max-h-[300px] overflow-y-auto overflow-x-hidden"
                  onWheel={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <CommandEmpty>Zaman dilimi bulunamadı.</CommandEmpty>
                  <CommandGroup>
                    {timezones.map((timezone) => (
                      <CommandItem
                        key={timezone}
                        value={timezone}
                        onSelect={(currentValue) => {
                          field.onChange(currentValue); // Form değerini güncelle
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === timezone
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {timezone.replace(/_/g, " ")}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  );
}
