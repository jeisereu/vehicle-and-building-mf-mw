import { z } from "zod";

const inspectionResultSchema = z.object({
  itemId: z.string().trim().min(1).max(80),
  itemName: z.string().trim().min(1).max(160),
  status: z.enum(["PASS", "FAIL"]),
  findings: z.string().trim().max(2000),
}).superRefine((result, context) => {
  if (result.status === "FAIL" && !result.findings) {
    context.addIssue({ code: "custom", path: ["findings"], message: "Findings are required for failed items." });
  }
});

export const createInspectionSchema = z.object({
  vehicleType: z.string().trim().min(1).max(120),
  plateNumber: z.string().trim().min(1).max(40),
  driver: z.string().trim().min(1).max(160),
  inspectionDateTime: z.coerce.date(),
  inspectedBy: z.string().trim().min(1).max(160),
  results: z.array(inspectionResultSchema).min(1),
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
