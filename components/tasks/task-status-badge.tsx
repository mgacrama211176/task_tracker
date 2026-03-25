import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/lib/types/task";
import { STATUS_BADGE_CONFIG } from "@/lib/constants/task";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = STATUS_BADGE_CONFIG[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.showPulse && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
      )}
      {config.label}
    </Badge>
  );
}
