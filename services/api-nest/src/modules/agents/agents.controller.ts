import { Controller, Get, Param } from "@nestjs/common";
import type { Agent } from "@weios/shared-types";
import { AgentsService } from "./agents.service";

@Controller("agents")
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  findAll(): Agent[] {
    return this.agentsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Agent | undefined {
    return this.agentsService.findOne(id);
  }
}
