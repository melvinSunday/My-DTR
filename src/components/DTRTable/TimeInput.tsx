import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { INPUT_STYLES } from "./constants";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
  label: string;
  placeholder?: string;
  type?: "time" | "number";
  min?: number;
  max?: number;
  step?: string;
  showClearButton?: boolean;
}

export default function TimeInput({
  value,
  onChange,
  onClear,
  disabled = false,
  label,
  placeholder,
  type = "time",
  min,
  max,
  step = "60",
  showClearButton = true,
}: TimeInputProps) {
  const inputClass = disabled ? INPUT_STYLES.disabled : INPUT_STYLES.base;
  const hasValue = value && value !== "" && value !== "0";

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <Input
        type={type}
        min={min}
        max={max}
        step={step}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`h-12 text-lg ${inputClass}`}
        style={{ colorScheme: "dark light" }}
      />
      {showClearButton && hasValue && !disabled && (
        <button
          type="button"
          onClick={onClear}
          className="absolute top-9 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
          aria-label={`Clear ${label}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
