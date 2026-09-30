import { randomUUID } from "node:crypto";
import type { CreateInspectionInput } from "../validators/inspection";

type StoredInspection = CreateInspectionInput & {
  id: string;
  createdAt: string;
};

export interface InspectionRepository {
  create(input: CreateInspectionInput): Promise<StoredInspection>;
}

export class InMemoryInspectionRepository implements InspectionRepository {
  private readonly inspections: StoredInspection[] = [];

  async create(input: CreateInspectionInput) {
    const inspection: StoredInspection = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.inspections.push(inspection);
    return inspection;
  }
}
