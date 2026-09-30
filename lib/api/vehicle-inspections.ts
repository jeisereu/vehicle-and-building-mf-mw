export type InspectionResultPayload = {
  itemId: string;
  itemName: string;
  status: "PASS" | "FAIL";
  findings: string;
};

export type CreateVehicleInspectionPayload = {
  vehicleType: string;
  plateNumber: string;
  driver: string;
  inspectionDateTime: string;
  inspectedBy: string;
  results: InspectionResultPayload[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function createVehicleInspection(payload: CreateVehicleInspectionPayload) {
  const response = await fetch(`${apiUrl}/inspections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? "The inspection could not be saved.");
  }

  return body as { success: true; data: { id: string; createdAt: string } };
}