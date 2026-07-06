import { Body, Controller, Get, Post } from "@nestjs/common";
import type { AuditLog } from "@weios/shared-types";
import { AuditLogsService } from "./audit-logs.service";

@Controller("audit-logs")
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(): AuditLog[] {
    return this.auditLogsService.findAll();
  }

  @Post()
  create(@Body() auditLog: AuditLog): AuditLog {
    return this.auditLogsService.create(auditLog);
  }
}
