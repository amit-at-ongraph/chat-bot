import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

interface EnumSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  triggerClassName?: string;
  renderOption?: (option: string) => React.ReactNode;
  allOptionLabel?: string;
}

export function EnumSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  triggerClassName,
  renderOption = (option) => option,
  allOptionLabel,
}: EnumSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allOptionLabel && (
          <SelectItem value="ALL">{allOptionLabel}</SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {renderOption(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
