export { TaskStatus, TaskType } from "@/lib/generated/prisma";
import type { TaskStatus, TaskType } from "@/lib/generated/prisma";

export type Owner = {
  id: string;
  name: string;
};

export type TaskWithComputed = {
  id: string;
  name: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  ownerId: string | null;
  owner: Owner | null;
  startedAt: Date | null;
  pausedAt: Date | null;
  accumulatedMs: number;
  budgetMs: number | null;
  createdAt: Date;
  updatedAt: Date;
};
