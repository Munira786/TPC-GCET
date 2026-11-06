"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEPARTMENTS, DEPARTMENT_LABELS, YEARS } from "@/lib/constants";

export function StudentFilters({
  department,
  year,
  minCgpa,
}: {
  department?: string;
  year?: string;
  minCgpa?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = department || year || minCgpa;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={department}
        onValueChange={(v) => updateParam("department", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENTS.map((d) => (
            <SelectItem key={d} value={d}>
              {DEPARTMENT_LABELS[d]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={(v) => updateParam("year", v)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>
              Year {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="number"
        step="0.1"
        min={0}
        max={10}
        placeholder="Min CGPA"
        defaultValue={minCgpa}
        className="w-28"
        onBlur={(e) => updateParam("minCgpa", e.target.value || undefined)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateParam("minCgpa", e.currentTarget.value || undefined);
        }}
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
