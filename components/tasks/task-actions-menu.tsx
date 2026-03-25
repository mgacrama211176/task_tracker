"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { completeTask, resetTask } from "@/lib/actions/tasks";
import type { TaskWithComputed } from "@/lib/types/task";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { TOAST_MESSAGES } from "@/lib/constants/task";

interface TaskActionsMenuProps {
  task: TaskWithComputed;
  onEdit: () => void;
  onDeleteConfirm: () => void;
}

export function TaskActionsMenu({
  task,
  onEdit,
  onDeleteConfirm,
}: TaskActionsMenuProps) {
  const complete = useServerAction(completeTask, {
    successMessage: TOAST_MESSAGES.taskMarkedDone,
  });
  const reset = useServerAction(resetTask, {
    successMessage: TOAST_MESSAGES.taskTimerReset,
  });

  const isPending = complete.isPending || reset.isPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        disabled={isPending}
        aria-label="Task options"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        {task.status !== "DONE" && (
          <DropdownMenuItem onClick={() => complete.execute(task.id)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark complete
          </DropdownMenuItem>
        )}
        {task.status !== "NOT_STARTED" && (
          <DropdownMenuItem onClick={() => reset.execute(task.id)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset timer
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDeleteConfirm}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
