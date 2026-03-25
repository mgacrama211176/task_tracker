"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TaskSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";
  const [value, setValue] = useState(initialSearch);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [value, pathname, router]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search tasks..."
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setValue("")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
