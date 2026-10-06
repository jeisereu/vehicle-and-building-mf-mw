"use client";

import type { ChecklistItem, ChecklistStatus } from "./checklist-data";

type ChecklistItemProps = {
  item: ChecklistItem;
  status: ChecklistStatus;
  errors: Record<string, string>;
  onStatus: (id: string, status: Exclude<ChecklistStatus, undefined>) => void;
};

function getItemClasses(item: ChecklistItem) {
  const isSubsection = /-(tread|pressure|cracks)$/.test(item.id)
    || /^(lug-wrench-jack|fire-extinguisher|first-aid-kit|flashlight|reflectors-flares|radiator|oil|auto-transmission|power-steering|brake-fluid|window-washer)$/.test(item.id);
  const isParent = /^(tire-[1-4]|spare-tire|emergency-equipment|liquid-level-check)$/.test(item.id);
  return { isSubsection, isParent };
}

export function ChecklistCell({ item, status, errors, onStatus }: { item?: ChecklistItem; status: ChecklistStatus; errors: Record<string, string>; onStatus: ChecklistItemProps["onStatus"] }) {
  if (!item) return <><td colSpan={4} className="empty-cell" /></>;
  const { isSubsection, isParent } = getItemClasses(item);
  const cellClass = isParent ? "parent-cell" : "";
  const statusError = Boolean(errors[`status-${item.id}`]);
  const findingError = Boolean(errors[`finding-${item.id}`]);
  return (
    <>
      <td className={`item-cell ${cellClass} ${isParent ? "parent-item" : ""} ${isSubsection ? "subsection-item" : ""}`}>{item.name}</td>
      <td className={`check-cell pass-cell ${cellClass} ${status === "pass" ? "checked" : ""} ${statusError ? "status-error" : ""}`}><label><input type="checkbox" checked={status === "pass"} onChange={() => onStatus(item.id, "pass")} aria-label={`${item.name}: Pass`} /><span aria-hidden="true" /></label></td>
      <td className={`check-cell fail-cell ${cellClass} ${status === "fail" ? "checked" : ""} ${statusError ? "status-error" : ""}`}><label><input type="checkbox" checked={status === "fail"} onChange={() => onStatus(item.id, "fail")} aria-label={`${item.name}: Fail`} /><span aria-hidden="true" /></label></td>
      <td className={`${cellClass} ${findingError ? "finding-error" : ""}`}><input className="finding-input" name={`finding-${item.id}`} placeholder="Add findings if needed" aria-label={`Findings for ${item.name}`} aria-invalid={findingError} /></td>
    </>
  );
}

export function MobileChecklistItem({ item, status, errors, onStatus }: ChecklistItemProps) {
  const { isSubsection, isParent } = getItemClasses(item);
  const statusError = Boolean(errors[`status-${item.id}`]);
  const findingError = Boolean(errors[`finding-${item.id}`]);
  return (
    <div className={`mobile-checklist-item ${isParent ? "parent-item" : ""}`}>
      <div className={`mobile-item-name ${isSubsection ? "subsection-item" : ""}`}>{item.name}</div>
      <div className="mobile-statuses">
        {(["pass", "fail"] as const).map((value) => (
          <label className={`mobile-status mobile-${value} ${status === value ? "checked" : ""} ${statusError ? "status-error" : ""}`} key={value}>
            <span>{value === "pass" ? "Pass" : "Fail"}</span>
            <input type="checkbox" checked={status === value} onChange={() => onStatus(item.id, value)} aria-label={`${item.name}: ${value === "pass" ? "Pass" : "Fail"}`} />
            <i aria-hidden="true" />
          </label>
        ))}
      </div>
      <div className={findingError ? "finding-error" : ""}>
        <input className="mobile-finding-input" name={`mobile-finding-${item.id}`} placeholder="Add findings if needed" aria-label={`Findings for ${item.name}`} aria-invalid={findingError} />
      </div>
    </div>
  );
}
