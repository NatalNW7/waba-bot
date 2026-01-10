"use client";

import { useState, useCallback, useMemo } from "react";
import {
  BRAZILIAN_DDDS,
  searchDDDs,
  type BrazilianDDD,
} from "@/lib/constants/brazilian-ddd";

interface BrazilianPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

/**
 * Brazilian phone input component with +55 prefix and DDD selector
 * Outputs phone in format: "+55 DD NNNNNNNNN"
 */
export function BrazilianPhoneInput({
  value,
  onChange,
  className = "",
  required = false,
  placeholder = "99999-9999",
}: BrazilianPhoneInputProps) {
  // Parse the current value to extract DDD and number
  const parsedValue = useMemo(() => {
    // Expected format: "+55 DD NNNNNNNNN" or variations
    const cleaned = value.replace(/\D/g, "");

    // If starts with 55, extract DDD and number
    if (cleaned.startsWith("55") && cleaned.length > 2) {
      return {
        ddd: cleaned.slice(2, 4),
        number: cleaned.slice(4),
      };
    }
    return { ddd: "", number: cleaned };
  }, [value]);

  const [ddd, setDdd] = useState(parsedValue.ddd || "11");
  const [number, setNumber] = useState(parsedValue.number);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDDDs = useMemo(() => searchDDDs(searchQuery), [searchQuery]);

  const selectedDDD = useMemo(
    () => BRAZILIAN_DDDS.find((d) => d.code === ddd),
    [ddd],
  );

  // Update parent when DDD or number changes
  const updateValue = useCallback(
    (newDdd: string, newNumber: string) => {
      const formattedNumber = newNumber.replace(/\D/g, "");
      onChange(`+55 ${newDdd} ${formattedNumber}`);
    },
    [onChange],
  );

  const handleDddSelect = (selected: BrazilianDDD) => {
    setDdd(selected.code);
    setIsDropdownOpen(false);
    setSearchQuery("");
    updateValue(selected.code, number);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    // Limit to 9 digits (mobile) or 8 digits (landline)
    const limited = inputValue.slice(0, 9);
    setNumber(limited);
    updateValue(ddd, limited);
  };

  // Format number for display (NNNNN-NNNN or NNNN-NNNN)
  const formatNumber = (num: string) => {
    if (num.length <= 4) return num;
    if (num.length <= 8) {
      return `${num.slice(0, 4)}-${num.slice(4)}`;
    }
    return `${num.slice(0, 5)}-${num.slice(5)}`;
  };

  const inputBaseStyles =
    "px-3 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent";

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* +55 Prefix (readonly) */}
      <div className="flex items-center px-3 py-3 rounded-lg border border-input bg-muted text-muted-foreground font-medium min-w-[60px] justify-center">
        +55
      </div>

      {/* DDD Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`${inputBaseStyles} min-w-[100px] flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50`}
        >
          <span className="font-medium">{ddd}</span>
          <span className="text-xs text-muted-foreground truncate">
            {selectedDDD?.stateAbbr}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 mt-1 w-64 max-h-60 overflow-auto rounded-lg border border-border bg-popover shadow-lg">
            {/* Search input */}
            <div className="sticky top-0 bg-popover p-2 border-b border-border">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar DDD ou estado..."
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>

            {/* DDD list */}
            <div className="py-1">
              {filteredDDDs.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleDddSelect(item)}
                  className={`w-full px-3 py-2 text-left hover:bg-muted flex items-center justify-between ${
                    item.code === ddd ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <span className="font-medium">{item.code}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.state} ({item.stateAbbr})
                  </span>
                </button>
              ))}
              {filteredDDDs.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhum DDD encontrado
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      <input
        type="tel"
        value={formatNumber(number)}
        onChange={handleNumberChange}
        className={`${inputBaseStyles} flex-1`}
        placeholder={placeholder}
        required={required}
        maxLength={11}
      />
    </div>
  );
}
