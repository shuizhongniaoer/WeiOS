import { Injectable } from "@nestjs/common";
import type { AuditLog } from "@weios/shared-types";
import { makeId, nowIso } from "../../common/id";
import { seedAuditLogs } from "../../common/seed";

@Injectable()
export class AuditLogsService {
  private readonly auditLogs = [...seedAuditLogs];

  findAll(): AuditLog[] {
    return this.auditLogs;
  }

  create(auditLog: AuditLog): AuditLog {
    const stamped = {
      ...auditLog,
      id: auditLog.id ?? makeId("audit"),
      timestamp: auditLog.timestamp ?? nowIso(),
    };
    this.auditLogs.push(stamped);
    return stamped;
  }
}
