"use client";

import type * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type Category } from "@/types";

interface CategorySelectProps {
  value?: Category | string; // Allow string for initial empty or non-standard value
  onValueChange: (value: Category) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CategorySelect({
  value,
  onValueChange,
  disabled,
  placeholder = "Select a category...",
}: CategorySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onValueChange(val as Category)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
