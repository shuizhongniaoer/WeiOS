import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import type { Project } from "@weios/shared-types";
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(): Project[] {
    return this.projectsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Project | undefined {
    return this.projectsService.findOne(id);
  }

  @Post()
  create(@Body() project: Project): Project {
    return this.projectsService.create(project);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() patch: Partial<Project>): Project {
    return this.projectsService.update(id, patch);
  }
}
