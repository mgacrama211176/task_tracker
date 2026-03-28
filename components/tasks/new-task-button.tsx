"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskForm } from "./task-form";
import type { Owner } from "@/lib/types/task";

interface NewTaskButtonProps {
  owners: Owner[];
}

export function NewTaskButton({ owners }: NewTaskButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5 shrink-0">
        <Plus className="h-4 w-4" />
        New task
      </Button>
      <TaskForm open={open} onOpenChange={setOpen} owners={owners} />
    </>
  );
}
