"use client";

import { MapPin, Search, Stethoscope } from "lucide-react";
import { useState } from "react";
import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils/cn";
import { Button } from "@/shared/ui/Button";
import { SearchCombobox, type SearchOption } from "./SearchCombobox";

export type { SearchOption };

type DoctorSearchProps = {
  specialties: SearchOption[];
  cities?: SearchOption[];
};

// Datos de ejemplo mientras no exista el endpoint de ciudades de calidoc-api.
const defaultCities: SearchOption[] = [
  { value: "lima", label: "Lima" },
  { value: "arequipa", label: "Arequipa" },
  { value: "trujillo", label: "Trujillo" },
  { value: "chiclayo", label: "Chiclayo" },
  { value: "piura", label: "Piura" },
  { value: "cusco", label: "Cusco" },
  { value: "huancayo", label: "Huancayo" },
  { value: "iquitos", label: "Iquitos" },
];

const modalities = [
  { value: "virtual", label: "Virtual" },
  { value: "presencial", label: "Presencial" },
] as const;

type Modality = (typeof modalities)[number]["value"];

export function DoctorSearch({ specialties, cities = defaultCities }: DoctorSearchProps) {
  const [modality, setModality] = useState<Modality>("virtual");
  const inPerson = modality === "presencial";

  return (
    <search>
      <form
        action={routes.doctors}
        method="get"
        aria-label="Buscar"
        className="relative flex flex-col drop-shadow-[0_12px_28px_rgb(2_25_44/0.10)]"
      >
        <div
          className={cn(
            "flex flex-col gap-4 border border-neutral-200 bg-white p-5 transition-[border-radius,border-color] duration-300 focus-within:border-neutral-300 lg:flex-row lg:items-center lg:gap-6 lg:py-3.5 lg:pr-3.5 lg:pl-8",
            inPerson
              ? "rounded-t-2xl rounded-b-none border-b-neutral-200 lg:rounded-t-[2rem]"
              : "rounded-2xl lg:rounded-[2rem]",
          )}
        >
          <SearchCombobox
            name="especialidad"
            label="Especialidad"
            placeholder="Busca tu especialidad"
            emptyText="No encontramos esa especialidad."
            icon={Stethoscope}
            options={specialties}
          />

          <span aria-hidden className="hidden h-8 w-px bg-neutral-200 lg:block" />

          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-xs font-semibold text-neutral-500">Modalidad</legend>
            <div className="flex gap-2">
              {modalities.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="modalidad"
                    value={option.value}
                    checked={modality === option.value}
                    onChange={() => setModality(option.value)}
                    className="peer sr-only"
                  />
                  <span className="flex h-9 items-center rounded-full border border-neutral-300 px-4 text-sm font-semibold text-neutral-700 transition-colors duration-200 peer-checked:border-neutral-900 peer-checked:bg-neutral-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Button type="submit" className="lg:ml-1">
            <Search size={18} />
            Buscar
          </Button>
        </div>

        <div
          inert={!inPerson}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out lg:absolute lg:inset-x-0 lg:top-full",
            inPerson
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 lg:pointer-events-none",
          )}
        >
          <div className={cn("min-h-0", inPerson ? "overflow-visible" : "overflow-hidden")}>
            <div className="rounded-b-2xl border border-t-0 border-neutral-200 bg-white px-5 py-4 lg:rounded-b-[2rem] lg:px-8">
              <SearchCombobox
                name="ciudad"
                label="Ciudad"
                placeholder="Busca tu ciudad"
                emptyText="No encontramos esa ciudad."
                icon={MapPin}
                options={cities}
                enabled={inPerson}
              />
            </div>
          </div>
        </div>
      </form>
    </search>
  );
}
