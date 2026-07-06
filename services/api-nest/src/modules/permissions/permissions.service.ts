import { Injectable } from "@nestjs/common";
import type { Permission, RiskLevel } from "@weios/shared-types";
import { classifyRisk } from "../../common/risk-classifier";
import { seedPermissions } from "../../common/seed";

@Injectable()
export class PermissionsService {
  private readonly permissions = [...seedPermissions];

  findAll(): Permission[] {
    return this.permissions;
  }

  classify(action: string): RiskLevel {
    return classifyRisk(action);
  }
}
