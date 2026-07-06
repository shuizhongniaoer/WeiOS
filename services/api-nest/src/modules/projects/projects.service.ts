import { Injectable, NotFoundException } from "@nestjs/common";
import type { Project } from "@weios/shared-types";
import { nowIso } from "../../common/id";
import { seedProjects } from "../../common/seed";

@Injectable()
export class ProjectsService {
  private readonly projects = [...seedProjects];

  findAll(): Project[] {
    return this.projects.sort((a, b) => a.priority - b.priority);
  }

  findOne(id: string): Project | undefined {
    return this.projects.find((project) => project.id === id);
  }

  create(project: Project): Project {
    this.projects.push({ ...project, updatedAt: nowIso() });
    return project;
  }

  update(id: string, patch: Partial<Project>): Project {
    const index = this.projects.findIndex((project) => project.id === id);
    if (index === -1) {
      throw new NotFoundException(`Project ${id} was not found`);
    }

    const updated = {
      ...this.projects[index],
      ...patch,
      id,
      updatedAt: nowIso(),
    };
    this.projects[index] = updated;
    return updated;
  }
}
