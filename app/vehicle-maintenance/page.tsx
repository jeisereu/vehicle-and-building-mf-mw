"use client";

import Link from "next/link";
import { AlertCircle, CalendarDays, Check, CheckCheck, CheckCircle2, Download, Moon, Printer, RotateCcw, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, startTransition, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "../../components/ui/toast";
import { createVehicleInspection, type CreateVehicleInspectionPayload } from "../../lib/api/vehicle-inspections";
import { exportVehicleMaintenanceExcel, exportVehicleMaintenancePdf } from "../../lib/exports/vehicle-maintenance";
import { ChecklistCell, MobileChecklistItem } from "./checklist-items";
import { allItems, leftItems, mobileItems, rightItems, rowCount, type ChecklistStatus } from "./checklist-data";
import { InspectionTimePicker } from "./inspection-time-picker";

type Status = ChecklistStatus;
type ToastVariant = "error" | "success";

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

export default function VehicleMaintenancePage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, Exclude<Status, undefined>>>({});
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; description: string; variant: ToastVariant }>({
    title: "",
    description: "",
    variant: "error",
  });
  const [inspectionDate, setInspectionDate] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [inspectionTime, setInspectionTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingInspection, setPendingInspection] = useState<CreateVehicleInspectionPayload | null>(null);
  const submittingRef = useRef(false);

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

  function markAllAsPass() {
    setStatuses(Object.fromEntries(allItems.map((item) => [item.id, "pass"])));
    setErrors((current) => {
      const next = { ...current };
      allItems.forEach((item) => delete next[`status-${item.id}`]);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
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
      if (statuses[item.id] === "fail" && !getFindingValue(formData, item.id).trim()) {
        nextErrors[`finding-${item.id}`] = "Add a finding for this failed item.";
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstMessage = Object.values(nextErrors)[0];
      setToast({
        title: "A few details need attention",
        description: `${Object.keys(nextErrors).length} issue${Object.keys(nextErrors).length === 1 ? "" : "s"} found. ${firstMessage}`,
        variant: "error",
      });
      setToastOpen(true);
      setSubmitted(false);
      return;
    }

    setPendingInspection({
      vehicleType: String(formData.get("vehicle-type")),
      plateNumber: String(formData.get("plate-number")),
      driver: String(formData.get("driver")),
      inspectionDateTime: `${inspectionDate}T${inspectionTime}`,
      inspectedBy: String(formData.get("inspected-by")),
      results: allItems.map((item) => ({
        itemId: item.id,
        itemName: item.name,
        status: statuses[item.id] === "pass" ? "PASS" : "FAIL",
        findings: getFindingValue(formData, item.id),
      })),
    });
    setConfirmationOpen(true);
  }

  async function confirmSubmission() {
    if (!pendingInspection || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setConfirmationOpen(false);
    try {
      await createVehicleInspection(pendingInspection);
      setSubmitted(true);
      setToast({
        title: "Inspection saved successfully",
        description: "The inspection was saved to the database.",
        variant: "success",
      });
      setToastOpen(true);
      resetForm();
      setPendingInspection(null);
      router.push("/");
    } catch (error) {
      setSubmitted(false);
      setToast({
        title: "Could not save inspection",
        description: error instanceof Error ? error.message : "The inspection API is unavailable.",
        variant: "error",
      });
      setToastOpen(true);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
      setPendingInspection(null);
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
            {/* <div className="document-code">FM-VM-001<br /><span>Controlled form</span></div> */}
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
                  <InspectionTimePicker value={inspectionTime} onChange={setInspectionTime} onSelect={() => setErrors((current) => {
                    const next = { ...current };
                    delete next["inspection-time"];
                    return next;
                  })} />
                </div>
                <input type="hidden" name="inspection-time" value={inspectionTime} />
              </div>
            </div>
          </section>

          <section className="table-section">
            <div className="table-caption">
              <div><span>Inspection record</span><strong>Mark every row as Pass or Fail</strong></div>
              <div className="table-caption-actions">
                <small>{Object.keys(statuses).length} / {allItems.length} complete</small>
                <button className="mark-all-pass-button" type="button" onClick={markAllAsPass} title="Mark every checklist item as Pass">
                  <CheckCheck size={14} aria-hidden="true" /> Mark all pass
                </button>
              </div>
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
            <div className="mobile-checklist">
              {mobileItems.map((item) => (
                <MobileChecklistItem key={item.id} item={item} status={statuses[item.id]} errors={errors} onStatus={setStatus} />
              ))}
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
    <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit maintenance checklist?</AlertDialogTitle>
          <AlertDialogDescription>
            This will save the completed inspection to the database. Please confirm that the checklist details and findings are correct.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Review checklist</AlertDialogCancel>
          <AlertDialogAction onClick={confirmSubmission} disabled={submitting}>
            {submitting ? "Saving..." : "Confirm submission"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <Toast className={toast.variant === "success" ? "app-toast-success" : ""} open={toastOpen} onOpenChange={setToastOpen}>
      {toast.variant === "success" ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
      <div><ToastTitle>{toast.title}</ToastTitle><ToastDescription>{toast.description}</ToastDescription></div>
      <ToastClose />
    </Toast>
    <ToastViewport />
    </ToastProvider>
  );
}

function getFindingValue(formData: FormData, itemId: string) {
  return String(formData.get(`mobile-finding-${itemId}`) || formData.get(`finding-${itemId}`) || "");
}
