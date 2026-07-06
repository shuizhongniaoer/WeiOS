import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import type { Task } from "@weios/shared-types";
import { TasksService } from "./tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query("projectId") projectId?: string): Task[] {
    return this.tasksService.findAll(projectId);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Task | undefined {
    return this.tasksService.findOne(id);
  }

  @Post()
  create(@Body() task: Task): Task {
    return this.tasksService.create(task);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() patch: Partial<Task>): Task {
    return this.tasksService.update(id, patch);
  }
}
