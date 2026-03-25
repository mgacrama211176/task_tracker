import type { Task } from "@/lib/generated/prisma";
import type { TaskWithComputed } from "@/lib/types/task";

type TransitionResult =
  | { valid: true; data: Record<string, unknown> }
  | { valid: false; error: string };

export function serializeTask(task: Task): TaskWithComputed {
  return {
    ...task,
    accumulatedMs: Number(task.accumulatedMs),
    budgetMs: task.budgetMs != null ? Number(task.budgetMs) : null,
  };
}

export function computeElapsedMs(task: Task, now: Date): number {
  const accumulated = Number(task.accumulatedMs);
  if (task.startedAt) {
    return accumulated + (now.getTime() - task.startedAt.getTime());
  }
  return accumulated;
}

export function transitionToRunning(task: Task): TransitionResult {
  if (task.status === "IN_PROGRESS") {
    return { valid: false, error: "Task is already in progress" };
  }
  if (task.status === "DONE") {
    return { valid: false, error: "Task is already done" };
  }
  return {
    valid: true,
    data: { status: "IN_PROGRESS", startedAt: new Date(), pausedAt: null },
  };
}

export function transitionToPaused(task: Task): TransitionResult {
  if (task.status !== "IN_PROGRESS") {
    return { valid: false, error: "Task is not in progress" };
  }
  const now = new Date();
  return {
    valid: true,
    data: {
      status: "PAUSED",
      pausedAt: now,
      startedAt: null,
      accumulatedMs: computeElapsedMs(task, now),
    },
  };
}

export function transitionToCompleted(task: Task): TransitionResult {
  if (task.status === "DONE") {
    return { valid: false, error: "Task is already done" };
  }
  const now = new Date();
  let finalAccumulatedMs = Number(task.accumulatedMs);
  if (task.status === "IN_PROGRESS" && task.startedAt) {
    finalAccumulatedMs += now.getTime() - task.startedAt.getTime();
  }
  return {
    valid: true,
    data: {
      status: "DONE",
      startedAt: null,
      pausedAt: null,
      accumulatedMs: finalAccumulatedMs,
    },
  };
}

export function transitionToReset(): TransitionResult {
  return {
    valid: true,
    data: {
      status: "NOT_STARTED",
      startedAt: null,
      pausedAt: null,
      accumulatedMs: 0,
    },
  };
}
