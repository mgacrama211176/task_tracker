import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@prisma/client";

const statusConfig: Record<
  TaskStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  NOT_STARTED: { label: "Not started", variant: "outline" },
  RUNNING: { label: "Running", variant: "default" },
  PAUSED: { label: "Paused", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "secondary" },
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={
        status === "RUNNING"
          ? "bg-green-500 hover:bg-green-600 text-white border-transparent"
          : status === "COMPLETED"
          ? "bg-muted text-muted-foreground"
          : status === "PAUSED"
          ? "bg-amber-100 text-amber-800 border-amber-200"
          : ""
      }
    >
      {status === "RUNNING" && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
      )}
      {config.label}
    </Badge>
  );
}
