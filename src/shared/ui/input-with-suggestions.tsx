'use client';

import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

type Props = {
  placeholder?: string;
  setValue: (value: string) => void;
  suggestions: string[];
  value: string;
};

/**
 * Adapted from shadcn to have a freeform input but with a suggestion dropdown.
 *
 * It is not perfect because the input loses focus when clicking on it (to open the popover)
 *
 * At the component, shadcn's combobox does not allow freeform entry (it must match a suggestion)
 */
export function InputWithSuggestion({ value, setValue, suggestions, placeholder }: Props) {
  return (
    <Popover>
      <PopoverTrigger>
        <Input
          className="w-14"
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? 'Type or select an option...'}
          value={value}
        />
      </PopoverTrigger>
      <PopoverContent className="w-fit p-1" align="start">
        <div className="grid grid-cols-2 gap-1">
          {suggestions.map((item) => (
            <Button
              key={item}
              className="text-sm cursor-pointer"
              onClick={() => setValue(item)}
              variant="outline"
            >
              {item}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
