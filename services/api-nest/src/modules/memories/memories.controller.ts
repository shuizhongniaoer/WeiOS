import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import type {
  Memory,
  MemorySummaryResult,
  SummarizeMemoryInput,
} from "@weios/shared-types";
import { MemoriesService } from "./memories.service";

@Controller("memories")
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Get()
  findAll(@Query("projectId") projectId?: string): Memory[] {
    return this.memoriesService.findAll(projectId);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Memory | undefined {
    return this.memoriesService.findOne(id);
  }

  @Post()
  create(@Body() memory: Memory): Memory {
    return this.memoriesService.create(memory);
  }

  @Post("summarize")
  summarize(@Body() input: SummarizeMemoryInput): MemorySummaryResult {
    return this.memoriesService.summarize(input);
  }
}
