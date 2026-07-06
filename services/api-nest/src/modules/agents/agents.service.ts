import { Injectable } from "@nestjs/common";
import type { Agent } from "@weios/shared-types";
import { seedAgents } from "../../common/seed";

@Injectable()
export class AgentsService {
  private readonly agents = [...seedAgents];

  findAll(): Agent[] {
    return this.agents;
  }

  findOne(id: string): Agent | undefined {
    return this.agents.find((agent) => agent.id === id);
  }
}
