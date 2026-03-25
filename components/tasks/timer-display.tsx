"use client";

import { useEffect, useState } from "react";
import type { TaskStatus } from "@/lib/types/task";
import { formatDuration } from "@/lib/formatting/time";
import { TICK_INTERVAL_MS } from "@/lib/constants/task";

interface TimerDisplayProps {
  accumulatedMs: number;
  startedAt: Date | null;
  status: TaskStatus;
  className?: string;
}

export function TimerDisplay({
  accumulatedMs,
  startedAt,
  status,
  className,
}: TimerDisplayProps) {
  const [elapsed, setElapsed] = useState(() => {
    if (status === "IN_PROGRESS" && startedAt) {
      return accumulatedMs + (Date.now() - new Date(startedAt).getTime());
    }
    return accumulatedMs;
  });

  useEffect(() => {
    if (status !== "IN_PROGRESS" || !startedAt) {
      setElapsed(accumulatedMs);
      return;
    }

    const startTime = new Date(startedAt).getTime();

    const tick = () => {
      setElapsed(accumulatedMs + (Date.now() - startTime));
    };

    tick();
    const interval = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, startedAt, accumulatedMs]);

  return <span className={className}>{formatDuration(elapsed)}</span>;
}
