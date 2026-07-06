import { Injectable, NotFoundException } from "@nestjs/common";
import type { Task } from "@weios/shared-types";
import { nowIso } from "../../common/id";
import { seedTasks } from "../../common/seed";

@Injectable()
export class TasksService {
  private readonly tasks = [...seedTasks];

  findAll(projectId?: string): Task[] {
    if (!projectId) {
      return this.tasks;
    }

    return this.tasks.filter((task) => task.projectId === projectId);
  }

  findOne(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  create(task: Task): Task {
    const stamped = {
      ...task,
      createdAt: task.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
    this.tasks.push(stamped);
    return stamped;
  }

  update(id: string, patch: Partial<Task>): Task {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task ${id} was not found`);
    }

    const updated = {
      ...this.tasks[index],
      ...patch,
      id,
      updatedAt: nowIso(),
    };
    this.tasks[index] = updated;
    return updated;
  }
}
