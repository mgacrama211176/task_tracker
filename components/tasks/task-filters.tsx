"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { TASK_TYPES, TASK_TYPE_CONFIG } from "@/lib/constants/task";
import type { TaskType, Owner } from "@/lib/types/task";
import { cn } from "@/lib/utils";
import { Check, Eye, EyeOff, User } from "lucide-react";

interface TaskFiltersProps {
  owners: Owner[];
}

export function TaskFilters({ owners }: TaskFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const activeType = searchParams.get("type") ?? "";
  const activeOwnerId = searchParams.get("ownerId") ?? "";
  const hideDone = searchParams.get("hideDone") === "true";
  const [ownerOpen, setOwnerOpen] = useState(false);

  const activeOwner = owners.find((o) => o.id === activeOwnerId);

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function toggleType(type: TaskType) {
    updateParams("type", activeType === type ? null : type);
  }

  function selectOwner(ownerId: string) {
    updateParams("ownerId", activeOwnerId === ownerId ? null : ownerId);
    setOwnerOpen(false);
  }

  function toggleHideDone() {
    updateParams("hideDone", hideDone ? null : "true");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TASK_TYPES.map((t) => {
        const isActive = activeType === t.value;
        const config = TASK_TYPE_CONFIG[t.value];
        return (
          <Button
            key={t.value}
            variant="outline"
            size="sm"
            className={cn(
              "h-7 px-2.5 text-xs",
              isActive && config.className
            )}
            onClick={() => toggleType(t.value)}
          >
            {t.label}
          </Button>
        );
      })}

      <div className="mx-1 h-4 w-px bg-border" />

      <Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
        <PopoverTrigger
          render={<Button variant="outline" size="sm" />}
          className={cn(
            "h-7 px-2.5 text-xs gap-1",
            activeOwnerId && "bg-blue-100 text-blue-800 border-blue-200"
          )}
        >
          <User className="h-3 w-3" />
          {activeOwner?.name || "Owner"}
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search owner..." />
            <CommandList>
              <CommandEmpty className="py-2 px-3 text-sm text-muted-foreground">
                No owners found.
              </CommandEmpty>
              <CommandGroup>
                {owners.map((owner) => (
                  <CommandItem
                    key={owner.id}
                    value={owner.name}
                    onSelect={() => selectOwner(owner.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        activeOwnerId === owner.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {owner.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="mx-1 h-4 w-px bg-border" />

      <Button
        variant="outline"
        size="sm"
        className={cn(
          "h-7 px-2.5 text-xs gap-1",
          hideDone && "bg-muted text-muted-foreground"
        )}
        onClick={toggleHideDone}
      >
        {hideDone ? (
          <EyeOff className="h-3 w-3" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
        Done
      </Button>
    </div>
  );
}
