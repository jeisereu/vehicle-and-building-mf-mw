"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";

type TimeParts = {
  hour: number;
  minute: number;
  period: "AM" | "PM";
};

type InspectionTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: () => void;
};

function formatTimeDisplay(value: string) {
  if (!value) return "Select time";
  const [rawHour, minute] = value.split(":").map(Number);
  return `${rawHour % 12 || 12}:${String(minute).padStart(2, "0")} ${rawHour >= 12 ? "PM" : "AM"}`;
}

function parseTimeParts(value: string): TimeParts {
  if (!value) return { hour: 12, minute: 0, period: "AM" };
  const [rawHour, rawMinute] = value.split(":").map(Number);
  const hour = Number.isFinite(rawHour) ? rawHour : 0;
  return { hour: hour % 12 || 12, minute: Number.isFinite(rawMinute) ? rawMinute : 0, period: hour >= 12 ? "PM" : "AM" };
}

function fromTimeParts({ hour, minute, period }: TimeParts) {
  let hour24 = hour % 12;
  if (period === "PM") hour24 += 12;
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getDialPosition(index: number, radius: number) {
  const angle = (index * Math.PI) / 6 - Math.PI / 2;
  return { left: `${50 + Math.cos(angle) * radius}%`, top: `${50 + Math.sin(angle) * radius}%` };
}

export function InspectionTimePicker({ value, onChange, onSelect }: InspectionTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [part, setPart] = useState<"hour" | "minute">("hour");
  const [draft, setDraft] = useState<TimeParts>(parseTimeParts(""));
  const [hourInput, setHourInput] = useState("12");
  const [minuteInput, setMinuteInput] = useState("00");
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  function updateDraft(updates: Partial<TimeParts>) {
    const next = { ...draft, ...updates };
    setDraft(next);
    setHourInput(String(next.hour));
    setMinuteInput(String(next.minute).padStart(2, "0"));
  }

  function openPicker(nextOpen: boolean) {
    if (nextOpen) {
      const next = parseTimeParts(value);
      setDraft(next);
      setHourInput(String(next.hour));
      setMinuteInput(String(next.minute).padStart(2, "0"));
      setPart("hour");
    }
    setOpen(nextOpen);
  }

  function applyTime() {
    const hour = Number(hourInput);
    const minute = Number(minuteInput);
    const next = /^\d+$/.test(hourInput) && /^\d+$/.test(minuteInput) && hour >= 1 && hour <= 12 && minute <= 59
      ? { ...draft, hour, minute }
      : draft;
    onChange(fromTimeParts(next));
    onSelect();
    setOpen(false);
  }

  function handleSegmentChange(segment: "hour" | "minute", valueToUse: string) {
    const valueWithoutNonDigits = valueToUse.replace(/\D/g, "").slice(0, 2);
    if (segment === "hour") {
      const hour = Number(valueWithoutNonDigits);
      const next = valueWithoutNonDigits && hour > 12 ? "12" : valueWithoutNonDigits;
      setHourInput(next);
      if (next && Number(next) >= 1) setDraft((current) => ({ ...current, hour: Number(next) }));
      if (next.length === 2 && Number(next) >= 1) {
        minuteRef.current?.focus();
        minuteRef.current?.select();
      }
      return;
    }
    const minute = Number(valueWithoutNonDigits);
    const next = valueWithoutNonDigits && minute > 59 ? "59" : valueWithoutNonDigits;
    setMinuteInput(next);
    if (next) setDraft((current) => ({ ...current, minute: Number(next) }));
  }

  function handleSegmentKeyDown(segment: "hour" | "minute", event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyTime();
    } else if (event.key === "ArrowRight" && segment === "hour") {
      event.preventDefault();
      minuteRef.current?.focus();
    } else if (event.key === "ArrowLeft" && segment === "minute") {
      event.preventDefault();
      hourRef.current?.focus();
    } else if (event.key === "Backspace" && segment === "minute" && !minuteInput) {
      hourRef.current?.focus();
      hourRef.current?.select();
    }
  }

  const picker = (content: ReactNode) => isMobile
    ? <AlertDialog open={open} onOpenChange={openPicker}><AlertDialogTrigger asChild><button className="picker-trigger time-trigger" type="button"><Clock3 size={15} aria-hidden="true" /><span>{formatTimeDisplay(value)}</span></button></AlertDialogTrigger>{content}</AlertDialog>
    : <Popover open={open} onOpenChange={openPicker}><PopoverTrigger asChild><button className="picker-trigger time-trigger" type="button"><Clock3 size={15} aria-hidden="true" /><span>{formatTimeDisplay(value)}</span></button></PopoverTrigger>{content}</Popover>;

  const content = (
    <div className="time-picker-content">
      <div className="time-picker-heading">
        <div className="time-input-group" aria-label="Time">
          <input ref={hourRef} aria-label="Hour" className="time-input time-segment" inputMode="numeric" maxLength={2} value={hourInput} onChange={(event) => handleSegmentChange("hour", event.target.value)} onKeyDown={(event) => handleSegmentKeyDown("hour", event)} onFocus={(event) => event.currentTarget.select()} />
          <span className="time-separator" aria-hidden="true">:</span>
          <input ref={minuteRef} aria-label="Minute" className="time-input time-segment" inputMode="numeric" maxLength={2} value={minuteInput} onChange={(event) => handleSegmentChange("minute", event.target.value)} onKeyDown={(event) => handleSegmentKeyDown("minute", event)} onFocus={(event) => event.currentTarget.select()} />
        </div>
        <div className="period-toggle" role="group" aria-label="AM or PM">
          {(["AM", "PM"] as const).map((period) => <button className={draft.period === period ? "selected" : ""} key={period} type="button" onClick={() => updateDraft({ period })}>{period}</button>)}
        </div>
      </div>
      <div className="clock-dial" aria-label={`Select ${part}`}>
        <div key={part} className="clock-dial-face" style={{ "--hand-angle": `${(part === "hour" ? draft.hour % 12 : draft.minute / 5) * 30}deg` } as CSSProperties}>
          {(part === "hour" ? [12, ...Array.from({ length: 11 }, (_, index) => index + 1)] : Array.from({ length: 12 }, (_, index) => index * 5)).map((dialValue, index) => (
            <button aria-label={`${dialValue} ${part}`} className={`clock-dial-number ${((part === "hour" && draft.hour === dialValue) || (part === "minute" && draft.minute === dialValue)) ? "selected" : ""}`} key={dialValue} style={getDialPosition(index, 38)} type="button" onClick={() => part === "hour" ? (updateDraft({ hour: dialValue }), setPart("minute")) : updateDraft({ minute: dialValue })}>
              {part === "minute" ? String(dialValue).padStart(2, "0") : dialValue}
            </button>
          ))}
          <span className="clock-dial-center" />
        </div>
      </div>
      <div className="time-picker-footer">
        <button className="clock-part-button" type="button" onClick={() => setPart("hour")}>{draft.hour}</button><span>:</span><button className="clock-part-button" type="button" onClick={() => setPart("minute")}>{String(draft.minute).padStart(2, "0")}</button><button className="clock-done-button" type="button" onClick={applyTime}>Done</button>
      </div>
    </div>
  );

  if (isMobile === null) return null;
  return isMobile
    ? <div className="mobile-time-picker">{picker(<AlertDialogContent className="time-picker-modal" onOpenAutoFocus={(event) => event.preventDefault()}><AlertDialogHeader><AlertDialogTitle>Select inspection time</AlertDialogTitle><AlertDialogDescription>Choose an hour and minute, or type the time directly.</AlertDialogDescription></AlertDialogHeader>{content}</AlertDialogContent>)}</div>
    : <div className="desktop-time-picker">{picker(<PopoverContent className="time-picker-popover" side="bottom" align="end" collisionPadding={12} avoidCollisions>{content}</PopoverContent>)}</div>;
}
