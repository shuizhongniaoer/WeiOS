import { Module } from "@nestjs/common";
import { AgentsModule } from "./modules/agents/agents.module";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module";
import { MemoriesModule } from "./modules/memories/memories.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TasksModule } from "./modules/tasks/tasks.module";

@Module({
  imports: [
    ProjectsModule,
    MemoriesModule,
    TasksModule,
    AgentsModule,
    PermissionsModule,
    AuditLogsModule,
  ],
})
export class AppModule {}
