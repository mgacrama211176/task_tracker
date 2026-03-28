"use client";

import { useState } from "react";
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
import type { Owner } from "@/lib/types/task";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, UserPlus, X } from "lucide-react";

interface OwnerComboboxProps {
  owners: Owner[];
  value: string;
  onChange: (value: string) => void;
}

export function OwnerCombobox({ owners, value, onChange }: OwnerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const matchesExisting = owners.some(
    (o) => o.name.toLowerCase() === search.toLowerCase()
  );

  function selectOwner(name: string) {
    onChange(name);
    setOpen(false);
    setSearch("");
  }

  function clear() {
    onChange("");
    setSearch("");
  }

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button variant="outline" />}
          className="w-full justify-between h-9 text-sm font-normal"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || "Select owner..."}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or add owner..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty className="py-2 px-3 text-sm text-muted-foreground">
                No owners found.
              </CommandEmpty>
              <CommandGroup>
                {owners.map((owner) => (
                  <CommandItem
                    key={owner.id}
                    value={owner.name}
                    onSelect={() => selectOwner(owner.name)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        value === owner.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {owner.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {search.trim() && !matchesExisting && (
                <CommandGroup>
                  <CommandItem
                    value={`__create__${search}`}
                    onSelect={() => selectOwner(search.trim())}
                  >
                    <UserPlus className="mr-2 h-3.5 w-3.5" />
                    Add &quot;{search.trim()}&quot;
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={clear}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
