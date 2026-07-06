import { Body, Controller, Get, Post } from "@nestjs/common";
import type { Permission, RiskLevel } from "@weios/shared-types";
import { PermissionsService } from "./permissions.service";

@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll(): Permission[] {
    return this.permissionsService.findAll();
  }

  @Post("classify")
  classify(@Body("action") action: string): { action: string; riskLevel: RiskLevel } {
    return {
      action,
      riskLevel: this.permissionsService.classify(action),
    };
  }
}
