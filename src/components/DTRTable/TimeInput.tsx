import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { X, Check } from "lucide-react";
import {
  INPUT_STYLES,
  MOBILE_INPUT_STYLES,
  ANIMATION_CONFIG,
} from "./constants";

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
  isMobile?: boolean;
  showSuccessFeedback?: boolean;
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
  isMobile = false,
  showSuccessFeedback = false,
}: TimeInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // choose appropriate input styles based on device
  const inputStyles = isMobile ? MOBILE_INPUT_STYLES : INPUT_STYLES;
  const inputClass = disabled ? inputStyles.disabled : inputStyles.base;
  const hasValue = value && value !== "" && value !== "0";

  // handle input change with success feedback
  const handleChange = (newValue: string) => {
    onChange(newValue);

    // show success feedback for valid inputs
    if (showSuccessFeedback && newValue && newValue !== "0") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    }
  };

  // handle clear with animation
  const handleClear = () => {
    onClear();
    // focus back to input after clearing
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.quick}
    >
      <motion.label
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        animate={{
          color: isFocused ? "#3b82f6" : undefined,
        }}
        transition={ANIMATION_CONFIG.quick}
      >
        {label}
      </motion.label>

      <div className="relative">
        <motion.div
          animate={{
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused
              ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
              : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
          transition={ANIMATION_CONFIG.spring}
        >
          <Input
            ref={inputRef}
            type={type}
            min={min}
            max={max}
            step={step}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            className={`${isMobile ? "h-12" : "h-12"} text-lg ${inputClass}`}
            style={{ colorScheme: "dark light" }}
          />
        </motion.div>

        {/* clear button with smooth animation */}
        <AnimatePresence>
          {showClearButton && hasValue && !disabled && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 right-3 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
              aria-label={`Clear ${label}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={ANIMATION_CONFIG.quick}
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* success feedback indicator */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="absolute top-1/2 right-3 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={ANIMATION_CONFIG.quick}
            >
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
