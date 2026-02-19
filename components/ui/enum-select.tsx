import { useTranslation } from "@/app/i18n/useTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnumSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
  triggerClassName?: string;
  allOptionLabel?: string;
}

export function EnumSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  triggerClassName,
  allOptionLabel,
}: EnumSelectProps) {
  const { t } = useTranslation();

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allOptionLabel && <SelectItem value="ALL">{allOptionLabel}</SelectItem>}
        {options.map((option) => {
          const translateKey = `upload.${option.value}`;
          const value = t(translateKey);

          return (
            <SelectItem key={option.value} value={option.value}>
              {value === translateKey ? option.label : value}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
