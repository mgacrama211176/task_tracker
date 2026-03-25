"use client";

import { useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTask } from "@/lib/actions/tasks";
import type { TaskWithComputed } from "@/lib/actions/tasks";
import { toast } from "sonner";

interface DeleteTaskDialogProps {
  task: TaskWithComputed | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTaskDialog({ task, open, onOpenChange }: DeleteTaskDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!task) return;

    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result.success) {
        toast.success("Task deleted");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold">&quot;{task?.name}&quot;</span> and all its
            timer data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
