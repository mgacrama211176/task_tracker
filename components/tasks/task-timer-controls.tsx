"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { startTask, pauseTask, resumeTask, completeTask } from "@/lib/actions/tasks";
import type { TaskWithComputed } from "@/lib/actions/tasks";
import { toast } from "sonner";

interface TaskTimerControlsProps {
  task: TaskWithComputed;
}

export function TaskTimerControls({ task }: TaskTimerControlsProps) {
  const [isPending, startTransition] = useTransition();

  function handleStart() {
    startTransition(async () => {
      const result = await startTask(task.id);
      if (!result.success) toast.error(result.error);
    });
  }

  function handlePause() {
    startTransition(async () => {
      const result = await pauseTask(task.id);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleResume() {
    startTransition(async () => {
      const result = await resumeTask(task.id);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleComplete() {
    startTransition(async () => {
      const result = await completeTask(task.id);
      if (result.success) {
        toast.success("Task completed");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (task.status === "COMPLETED") {
    return (
      <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-muted rounded-md">
        Done
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {task.status === "NOT_STARTED" && (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={handleStart}
          disabled={isPending}
          title="Start timer"
        >
          <Play className="h-4 w-4 fill-current" />
        </Button>
      )}
      {task.status === "RUNNING" && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={handlePause}
            disabled={isPending}
            title="Pause timer"
          >
            <Pause className="h-4 w-4 fill-current" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleComplete}
            disabled={isPending}
            title="Complete task"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        </>
      )}
      {task.status === "PAUSED" && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={handleResume}
            disabled={isPending}
            title="Resume timer"
          >
            <Play className="h-4 w-4 fill-current" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleComplete}
            disabled={isPending}
            title="Complete task"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        </>
      )}
    </div>
  );
}
