import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface TableMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const TableMultiSelect: React.FC<TableMultiSelectProps> = ({
  options,
  selected,
  onChange,
}) => {
  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-white shadow flex gap-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={selected.includes(option)}
            onCheckedChange={() => handleToggle(option)}
            className="h-4 w-4 rounded border border-input"
          />
          <span className="text-base">{option}</span>
        </label>
      ))}
    </div>
  );
};
