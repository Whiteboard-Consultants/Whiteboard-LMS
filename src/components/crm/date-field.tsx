"use client";

import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dateToIso, formatDisplay, isoToLocalDate, parseDateInput } from "@/lib/crm/dates";

export function DateField({
  id,
  label,
  value,
  onChange,
  required,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (iso: string) => void;
  required?: boolean;
  error?: string;
}) {
  const [text, setText] = useState(value ? formatDisplay(value) : "");
  const [open, setOpen] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setText(value ? formatDisplay(value) : "");
  }, [value]);

  function commit(next: string) {
    if (!next.trim()) {
      onChange("");
      setLocalError("");
      return;
    }
    const iso = parseDateInput(next);
    if (!iso) {
      setLocalError("Use dd-MMM-yyyy");
      return;
    }
    setLocalError("");
    onChange(iso);
    setText(formatDisplay(iso));
  }

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-[#C9002B]"> *</span> : null}
      </Label>
      <div className="flex gap-1">
        <Input
          id={id}
          value={text}
          placeholder="dd-MMM-yyyy"
          aria-invalid={Boolean(error || localError)}
          onChange={(event) => setText(event.target.value)}
          onBlur={() => commit(text)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(text);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label={`Open calendar for ${label}`}>
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={value ? isoToLocalDate(value) : undefined}
              onSelect={(date) => {
                if (!date) return;
                const iso = dateToIso(date);
                onChange(iso);
                setText(formatDisplay(iso));
                setLocalError("");
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {error || localError ? <p className="text-xs text-[#C9002B]">{error || localError}</p> : null}
    </div>
  );
}
