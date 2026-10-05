import { Router } from "express";
import { prisma } from "../lib/prisma";
import { PrismaInspectionRepository } from "../repositories/inspection-repository";
import { createInspectionSchema } from "../validators/inspection";

export const inspectionRouter = Router();
const repository = new PrismaInspectionRepository(prisma);

inspectionRouter.post("/", async (request, response) => {
  const parsed = createInspectionSchema.safeParse(request.body);

  if (!parsed.success) {
    console.warn("[POST /api/inspections] Validation failed", parsed.error.flatten());
    response.status(422).json({
      success: false,
      message: "Inspection data is invalid.",
      errors: parsed.error.flatten(),
    });
    return;
  }

  try {
    const inspection = await repository.create(parsed.data);
    console.log("[POST /api/inspections] Inspection saved to MySQL", {
      id: inspection.id,
      plateNumber: inspection.plateNumber,
    });
    response.status(201).json({ success: true, data: inspection });
  } catch (error) {
    console.error("[POST /api/inspections] Failed to save inspection to MySQL", error);
    response.status(500).json({ success: false, message: "The inspection could not be saved." });
  }
});
