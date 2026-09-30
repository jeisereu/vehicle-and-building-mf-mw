"use client";

import Link from "next/link";
import { AlertCircle, CalendarDays, Check, Clock3, Download, Moon, Printer, RotateCcw, Sun } from "lucide-react";
import { FormEvent, startTransition, useEffect, useState } from "react";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "../../components/ui/toast";
import { createVehicleInspection } from "../../lib/api/vehicle-inspections";
import { exportVehicleMaintenanceExcel, exportVehicleMaintenancePdf } from "../../lib/exports/vehicle-maintenance";

type ChecklistItem = {
  id: string;
  name: string;
};

type Status = "pass" | "fail" | undefined;

const leftItems: ChecklistItem[] = [
  { id: "safety-belts", name: "Safety Belts" },
  { id: "brakes", name: "Brakes" },
  { id: "steering", name: "Steering" },
  { id: "engine", name: "Engine" },
  { id: "transmission", name: "Transmission" },
  { id: "air-conditioning", name: "Air conditioning" },
  { id: "wipers", name: "Wipers" },
  { id: "high-beam", name: "Headlights High Beam" },
  { id: "low-beam", name: "Headlights Low Beam" },
  { id: "window-4", name: "Window 4" },
  { id: "windshield", name: "Windshield" },
  { id: "radio", name: "Radio" },
  { id: "horn", name: "Horn" },
  { id: "seatbelts", name: "Seatbelts" },
  { id: "tire-1", name: "Tire 1" },
  { id: "tire-1-tread", name: "Tread Depth" },
  { id: "tire-1-pressure", name: "Inflation Pressure" },
  { id: "tire-1-cracks", name: "Cracks and Cuts" },
  { id: "tire-2", name: "Tire 2" },
  { id: "tire-2-tread", name: "Tread Depth" },
  { id: "tire-2-pressure", name: "Inflation Pressure" },
  { id: "tire-2-cracks", name: "Cracks and Cuts" },
  { id: "emergency-equipment", name: "Emergency Equipment" },
  { id: "lug-wrench-jack", name: "Lug Wrench / Jack" },
  { id: "fire-extinguisher", name: "Fire Extinguisher" },
  { id: "first-aid-kit", name: "First Aid Kit" },
  { id: "flashlight", name: "Flashlight" },
  { id: "reflectors-flares", name: "Warning Reflectors and Flares" },
  { id: "liquid-level-check", name: "Liquid Level Check" },
  { id: "radiator", name: "Radiator" },
  { id: "oil", name: "Oil" },
  { id: "auto-transmission", name: "Auto Transmission" },
  { id: "power-steering", name: "Power Steering" },
  { id: "brake-fluid", name: "Brakes" },
  { id: "window-washer", name: "Window Washer" },
];

const rightItems: ChecklistItem[] = [
  { id: "turn-signals", name: "Turn Signals" },
  { id: "brake-tail-lights", name: "Brake Lights/Tail Lights" },
  { id: "door-1", name: "Door 1" },
  { id: "door-2", name: "Door 2" },
  { id: "door-3", name: "Door 3" },
  { id: "door-4", name: "Door 4" },
  { id: "window-1", name: "Window 1" },
  { id: "window-2", name: "Window 2" },
  { id: "window-3", name: "Window 3" },
  { id: "tire-3", name: "Tire 3" },
  { id: "tire-3-tread", name: "Tread Depth" },
  { id: "tire-3-pressure", name: "Inflation Pressure" },
  { id: "tire-3-cracks", name: "Cracks and Cuts" },
  { id: "tire-4", name: "Tire 4" },
  { id: "tire-4-tread", name: "Tread Depth" },
  { id: "tire-4-pressure", name: "Inflation Pressure" },
  { id: "tire-4-cracks", name: "Cracks and Cuts" },
  { id: "spare-tire", name: "Spare Tire" },
  { id: "spare-tread", name: "Tread Depth" },
  { id: "spare-pressure", name: "Inflation Pressure" },
  { id: "spare-cracks", name: "Cracks and Cuts" },
  { id: "documentation", name: "Documentation" },
  { id: "insurance", name: "Insurance" },
  { id: "registration", name: "Registration" },
  { id: "plate", name: "Plate" },
  { id: "stickers", name: "Stickers" },
  { id: "body", name: "Body" },
  { id: "rear-view-mirror", name: "Rear View Mirror" },
  { id: "side-view-mirror", name: "Side View Mirror" },
  { id: "cameras", name: "Cameras" },
  { id: "airbags", name: "Airbags" },
  { id: "chairs", name: "Chairs" },
  { id: "speedometers-gauges", name: "Speedometers, Gauges" },
];

const allItems = [...leftItems, ...rightItems];
const rowCount = Math.max(leftItems.length, rightItems.length);

function formatDisplayDate(value: string) {
  if (!value) return "dd / mm / yyyy";
  const [year, month, day] = value.split("-");
  return `${day} / ${month} / ${year}`;
}

function parseDateValue(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatTimeDisplay(value: string) {
  if (!value) return "Select time";
  const [rawHour, minute] = value.split(":").map(Number);
  const period = rawHour >= 12 ? "PM" : "AM";
  const hour = rawHour % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

function to24Hour(value: string) {
  const [time, period] = value.split(" ");
  let hour = Number(time.split(":")[0]);
  const minute = Number(time.split(":")[1]);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export default function VehicleMaintenancePage() {
  const [statuses, setStatuses] = useState<Record<string, Exclude<Status, undefined>>>({});
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toast, setToast] = useState({ title: "", description: "" });
  const [inspectionDate, setInspectionDate] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [inspectionTime, setInspectionTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("vehicle-checklist-theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const nextTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : systemTheme;
    startTransition(() => setTheme(nextTheme));
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function setStatus(id: string, status: Exclude<Status, undefined>) {
    setStatuses((current) => ({ ...current, [id]: status }));
    setErrors((current) => {
      const next = { ...current };
      delete next[`status-${id}`];
      if (status === "pass") delete next[`finding-${id}`];
      return next;
    });
    setSubmitted(false);
  }

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("vehicle-checklist-theme", nextTheme);
  }

  function resetForm() {
    setStatuses({});
    setErrors({});
    setSubmitted(false);
    setInspectionDate("");
    setInspectionTime("");
    document.querySelectorAll<HTMLInputElement>(".checklist-form input").forEach((input) => {
      if (input.type !== "checkbox") input.value = "";
    });
  }

  function chooseDate(date: Date | undefined) {
    if (!date) return;
    setInspectionDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
    setDatePickerOpen(false);
    setErrors((current) => {
      const next = { ...current };
      delete next["inspection-date"];
      return next;
    });
  }

  function chooseTime(time: string) {
    setInspectionTime(to24Hour(time));
    setErrors((current) => {
      const next = { ...current };
      delete next["inspection-time"];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextErrors: Record<string, string> = {};
    const requiredFields = [
      ["vehicle-type", "Vehicle Type"],
      ["driver", "Driver"],
      ["plate-number", "Plate Number"],
      ["inspected-by", "Inspected By"],
    ];

    requiredFields.forEach(([id, label]) => {
      if (!String(formData.get(id) || "").trim()) nextErrors[id] = `${label} is required.`;
    });

    const inspectionDate = String(formData.get("inspection-date") || "");
    const inspectionTime = String(formData.get("inspection-time") || "");
    if (!inspectionDate) nextErrors["inspection-date"] = "Inspection date is required.";
    if (!inspectionTime) nextErrors["inspection-time"] = "Inspection time is required.";
    if (inspectionDate && inspectionTime && Number.isNaN(new Date(`${inspectionDate}T${inspectionTime}`).getTime())) {
      nextErrors["inspection-date"] = "Enter a valid inspection date and time.";
    }

    allItems.forEach((item) => {
      if (!statuses[item.id]) nextErrors[`status-${item.id}`] = `${item.name} needs a Pass or Fail selection.`;
      if (statuses[item.id] === "fail" && !String(formData.get(`finding-${item.id}`) || "").trim()) {
        nextErrors[`finding-${item.id}`] = "Add a finding for this failed item.";
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstMessage = Object.values(nextErrors)[0];
      setToast({
        title: "A few details need attention",
        description: `${Object.keys(nextErrors).length} issue${Object.keys(nextErrors).length === 1 ? "" : "s"} found. ${firstMessage}`,
      });
      setToastOpen(true);
      setSubmitted(false);
      return;
    }

    setSubmitting(true);
    try {
      await createVehicleInspection({
        vehicleType: String(formData.get("vehicle-type")),
        plateNumber: String(formData.get("plate-number")),
        driver: String(formData.get("driver")),
        inspectionDateTime: `${inspectionDate}T${inspectionTime}`,
        inspectedBy: String(formData.get("inspected-by")),
        results: allItems.map((item) => ({
          itemId: item.id,
          itemName: item.name,
          status: statuses[item.id] === "pass" ? "PASS" : "FAIL",
          findings: String(formData.get(`finding-${item.id}`) || ""),
        })),
      });
      setSubmitted(true);
      setToast({ title: "Inspection complete", description: "The inspection was accepted by the API." });
      setToastOpen(true);
    } catch (error) {
      setSubmitted(false);
      setToast({ title: "Could not save inspection", description: error instanceof Error ? error.message : "The inspection API is unavailable." });
      setToastOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ToastProvider>
    <main className="document-shell">
      <div className="document-toolbar no-print">
        <Link className="back-link" href="/">← Back</Link>
        <div className="toolbar-actions">
          <button className="tool-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
            {theme === "light" ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />} {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
          <button className="tool-button" type="button" onClick={exportVehicleMaintenancePdf}><Printer size={14} aria-hidden="true" /> Print / PDF</button>
          <button className="tool-button export-button" type="button" onClick={() => exportVehicleMaintenanceExcel({ statuses, leftItems, rightItems })}><Download size={14} aria-hidden="true" /> Export Excel</button>
        </div>
      </div>

      <form className="checklist-form" onSubmit={handleSubmit} noValidate>
        <article className="paper-document">
          <header className="document-heading">
            <div className="department-lockup">
              <strong>DICT</strong>
              <span>Department of Information and Communication Technology<br />Region 5 · Legazpi City</span>
            </div>
            <div className="document-code">FM-VM-001<br /><span>Controlled form</span></div>
            <h1>Vehicle Maintenance Daily Checklist</h1>
          </header>

          <section className="vehicle-meta">
            <label className={errors["vehicle-type"] ? "field-error" : ""}>Vehicle Type<input name="vehicle-type" placeholder="Enter vehicle type" aria-invalid={Boolean(errors["vehicle-type"])} /></label>
            <label className={errors.driver ? "field-error" : ""}>Driver<input name="driver" placeholder="Enter driver name" aria-invalid={Boolean(errors.driver)} /></label>
            <label className={errors["plate-number"] ? "field-error" : ""}>Plate Number<input name="plate-number" placeholder="Enter plate number" aria-invalid={Boolean(errors["plate-number"])} /></label>
            <div className={`date-time-field ${errors["inspection-date"] || errors["inspection-time"] ? "field-error" : ""}`}>
              <span>Inspection Date and Time</span>
              <div className="date-time-picker">
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild><button className="picker-trigger" type="button"><CalendarDays size={15} aria-hidden="true" /><span>{formatDisplayDate(inspectionDate)}</span></button></PopoverTrigger>
                  <PopoverContent align="start"><Calendar mode="single" selected={parseDateValue(inspectionDate)} onSelect={chooseDate} captionLayout="dropdown" startMonth={new Date(2000, 0)} endMonth={new Date(new Date().getFullYear() + 1, 11)} /></PopoverContent>
                </Popover>
                <input type="hidden" name="inspection-date" value={inspectionDate} />
                <div className="picker-wrap">
                  <Clock3 size={15} className="picker-icon" aria-hidden="true" />
                  <Select value={inspectionTime ? formatTimeDisplay(inspectionTime) : undefined} onValueChange={chooseTime}>
                    <SelectTrigger className="picker-trigger time-trigger"><SelectValue placeholder="Select time" /></SelectTrigger>
                    <SelectContent>{Array.from({ length: 24 }, (_, hour) => ["00", "30"].map((minute) => `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`)).flat().map((time) => <SelectItem value={time} key={time}>{time}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <input type="hidden" name="inspection-time" value={inspectionTime} />
              </div>
            </div>
          </section>

          <section className="table-section">
            <div className="table-caption">
              <div><span>Inspection record</span><strong>Mark every row as Pass or Fail</strong></div>
              <small>{Object.keys(statuses).length} / {allItems.length} complete</small>
            </div>
            <div className="table-scroll">
              <table className="checklist-table">
                <thead>
                  <tr>
                    <th>Items</th><th>Pass</th><th>Fail</th><th>Findings</th>
                    <th>Items</th><th>Pass</th><th>Fail</th><th>Findings</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowCount }, (_, index) => (
                    <tr key={index}>
                      <ChecklistCell item={leftItems[index]} status={statuses[leftItems[index]?.id]} errors={errors} onStatus={setStatus} />
                      <ChecklistCell item={rightItems[index]} status={statuses[rightItems[index]?.id]} errors={errors} onStatus={setStatus} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="signoff-row">
            <label className={errors["inspected-by"] ? "field-error" : ""}>Inspected By:<input name="inspected-by" placeholder="Enter inspector name" aria-invalid={Boolean(errors["inspected-by"])} /></label>
            <p>By signing, the inspector confirms that the vehicle was checked and any findings have been reported.</p>
          </section>
        </article>

        <div className="form-actions no-print">
          <button className="secondary-button" type="button" onClick={resetForm}><RotateCcw size={14} aria-hidden="true" /> Clear form</button>
          <button className="primary-button" type="submit" disabled={submitting}><Check size={15} aria-hidden="true" /> {submitting ? "Saving inspection..." : "Complete inspection"}</button>
        </div>
        {submitted && <p className="submit-message no-print" role="status">Inspection recorded for this session.</p>}
      </form>
    </main>
    <Toast open={toastOpen} onOpenChange={setToastOpen}>
      <AlertCircle size={18} aria-hidden="true" />
      <div><ToastTitle>{toast.title}</ToastTitle><ToastDescription>{toast.description}</ToastDescription></div>
      <ToastClose />
    </Toast>
    <ToastViewport />
    </ToastProvider>
  );
}

function ChecklistCell({ item, status, errors, onStatus }: { item?: ChecklistItem; status: Status; errors: Record<string, string>; onStatus: (id: string, status: Exclude<Status, undefined>) => void }) {
  if (!item) return <><td colSpan={4} className="empty-cell" /></>;
  const isSubsection = /-(tread|pressure|cracks)$/.test(item.id) || /^(lug-wrench-jack|fire-extinguisher|first-aid-kit|flashlight|reflectors-flares|radiator|oil|auto-transmission|power-steering|brake-fluid|window-washer)$/.test(item.id);
  const isParent = /^(tire-[1-4]|spare-tire|emergency-equipment|liquid-level-check)$/.test(item.id);
  const cellClass = isParent ? "parent-cell" : "";
  const statusError = Boolean(errors[`status-${item.id}`]);
  const findingError = Boolean(errors[`finding-${item.id}`]);
  return (
    <>
      <td className={`item-cell ${cellClass} ${isParent ? "parent-item" : ""} ${isSubsection ? "subsection-item" : ""}`}>{item.name}</td>
      <td className={`check-cell pass-cell ${cellClass} ${status === "pass" ? "checked" : ""} ${statusError ? "status-error" : ""}`}>
        <label><input type="checkbox" checked={status === "pass"} onChange={() => onStatus(item.id, "pass")} aria-label={`${item.name}: Pass`} /><span aria-hidden="true" /></label>
      </td>
      <td className={`check-cell fail-cell ${cellClass} ${status === "fail" ? "checked" : ""} ${statusError ? "status-error" : ""}`}>
        <label><input type="checkbox" checked={status === "fail"} onChange={() => onStatus(item.id, "fail")} aria-label={`${item.name}: Fail`} /><span aria-hidden="true" /></label>
      </td>
      <td className={`${cellClass} ${findingError ? "finding-error" : ""}`}><input className="finding-input" name={`finding-${item.id}`} aria-label={`Findings for ${item.name}`} aria-invalid={findingError} /></td>
    </>
  );
}
