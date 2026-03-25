"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import {
  startTask,
  pauseTask,
  resumeTask,
  completeTask,
} from "@/lib/actions/tasks";
import type { TaskWithComputed } from "@/lib/types/task";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { TIMER_BUTTON_STYLES, TOAST_MESSAGES } from "@/lib/constants/task";

interface TaskTimerControlsProps {
  task: TaskWithComputed;
}

export function TaskTimerControls({ task }: TaskTimerControlsProps) {
  const start = useServerAction(startTask);
  const pause = useServerAction(pauseTask);
  const resume = useServerAction(resumeTask);
  const complete = useServerAction(completeTask, {
    successMessage: TOAST_MESSAGES.taskDone,
  });

  const isPending =
    start.isPending ||
    pause.isPending ||
    resume.isPending ||
    complete.isPending;

  if (task.status === "DONE") {
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
          className={TIMER_BUTTON_STYLES.play}
          onClick={() => start.execute(task.id)}
          disabled={isPending}
          title="Start timer"
        >
          <Play className="h-4 w-4 fill-current" />
        </Button>
      )}
      {task.status === "IN_PROGRESS" && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className={TIMER_BUTTON_STYLES.pause}
            onClick={() => pause.execute(task.id)}
            disabled={isPending}
            title="Pause timer"
          >
            <Pause className="h-4 w-4 fill-current" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={TIMER_BUTTON_STYLES.stop}
            onClick={() => complete.execute(task.id)}
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
            className={TIMER_BUTTON_STYLES.play}
            onClick={() => resume.execute(task.id)}
            disabled={isPending}
            title="Resume timer"
          >
            <Play className="h-4 w-4 fill-current" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={TIMER_BUTTON_STYLES.stop}
            onClick={() => complete.execute(task.id)}
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
