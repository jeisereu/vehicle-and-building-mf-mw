import type { PrismaClient } from "@prisma/client";
import type { CreateInspectionInput } from "../validators/inspection";

export interface InspectionRepository {
  create(input: CreateInspectionInput): ReturnType<PrismaInspectionRepository["create"]>;
}

export class PrismaInspectionRepository implements InspectionRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(input: CreateInspectionInput) {
    return this.client.vehicleInspection.create({
      data: {
        vehicleType: input.vehicleType,
        plateNumber: input.plateNumber,
        driver: input.driver,
        inspectionDateTime: input.inspectionDateTime,
        inspectedBy: input.inspectedBy,
        results: {
          create: input.results,
        },
      },
      include: { results: true },
    });
  }
}
