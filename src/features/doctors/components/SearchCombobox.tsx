"use client";

import { Command } from "cmdk";
import { Check, type LucideIcon } from "lucide-react";
import { useState } from "react";

export type SearchOption = { value: string; label: string };

type SearchComboboxProps = {
  name: string;
  label: string;
  placeholder: string;
  emptyText: string;
  icon: LucideIcon;
  options: SearchOption[];
  enabled?: boolean;
};

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export function SearchCombobox({
  name,
  label,
  placeholder,
  emptyText,
  icon: Icon,
  options,
  enabled = true,
}: SearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);

  const needle = normalize(query);
  const results = needle
    ? options.filter((option) => normalize(option.label).includes(needle))
    : options;

  function handleInput(value: string) {
    setQuery(value);
    setOpen(true);
    const exact = options.find((option) => normalize(option.label) === normalize(value));
    setSelected(exact?.value ?? "");
  }

  function handleSelect(option: SearchOption) {
    setQuery(option.label);
    setSelected(option.value);
    setOpen(false);
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="text-primary-600">
        <Icon size={20} />
      </span>
      <div className="relative flex min-w-0 flex-1 flex-col border-b-2 border-transparent transition-colors duration-200 focus-within:border-primary-500">
        <span aria-hidden className="text-xs font-semibold text-neutral-500">
          {label}
        </span>
        <Command
          label={label}
          shouldFilter={false}
          onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
        >
          <Command.Input
            value={query}
            onValueChange={handleInput}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !open) {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full truncate bg-transparent py-1 text-base font-semibold text-neutral-900 outline-none placeholder:font-medium placeholder:text-neutral-500"
          />
          <input type="hidden" name={name} value={selected} disabled={!enabled} />

          {open && (
            <Command.List
              onMouseDown={(event) => event.preventDefault()}
              className="absolute top-full left-0 z-30 mt-3 max-h-64 w-72 max-w-[calc(100vw-4rem)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-raised"
            >
              {results.length === 0 ? (
                <p className="px-3 py-3 text-sm font-medium text-neutral-500">{emptyText}</p>
              ) : (
                results.map((option) => (
                  <Command.Item
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-900 data-[selected=true]:bg-neutral-100"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors duration-200 group-data-[selected=true]:bg-white">
                      <Icon size={15} />
                    </span>
                    {option.label}
                    {option.value === selected && (
                      <Check size={16} aria-hidden className="ml-auto shrink-0 text-neutral-500" />
                    )}
                  </Command.Item>
                ))
              )}
            </Command.List>
          )}
        </Command>
      </div>
    </div>
  );
}
