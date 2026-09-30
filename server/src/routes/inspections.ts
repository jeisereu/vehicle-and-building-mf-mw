import { Router } from "express";
import { InMemoryInspectionRepository } from "../repositories/inspection-repository";
import { createInspectionSchema } from "../validators/inspection";

export const inspectionRouter = Router();
const repository = new InMemoryInspectionRepository();

inspectionRouter.post("/", async (request, response) => {
  const parsed = createInspectionSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(422).json({
      success: false,
      message: "Inspection data is invalid.",
      errors: parsed.error.flatten(),
    });
    return;
  }

  const inspection = await repository.create(parsed.data);
  response.status(201).json({ success: true, data: inspection });
});
