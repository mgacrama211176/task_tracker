"use client";

import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, RotateCcw, CheckCircle } from "lucide-react";
import { deleteTask, completeTask, resetTask } from "@/lib/actions/tasks";
import type { TaskWithComputed } from "@/lib/actions/tasks";
import { toast } from "sonner";

interface TaskActionsMenuProps {
  task: TaskWithComputed;
  onEdit: () => void;
  onDeleteConfirm: () => void;
}

export function TaskActionsMenu({ task, onEdit, onDeleteConfirm }: TaskActionsMenuProps) {
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      const result = await completeTask(task.id);
      if (result.success) {
        toast.success("Task marked as completed");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleReset() {
    startTransition(async () => {
      const result = await resetTask(task.id);
      if (result.success) {
        toast.success("Task timer reset");
      } else {
        toast.error(result.error);
      }
    });
  }

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
        {task.status !== "COMPLETED" && (
          <DropdownMenuItem onClick={handleComplete}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark complete
          </DropdownMenuItem>
        )}
        {task.status !== "NOT_STARTED" && (
          <DropdownMenuItem onClick={handleReset}>
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
