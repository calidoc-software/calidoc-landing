import type { Specialty } from "../types";

export type PublicSpecialtyDto = {
  id: number;
  name: string;
  slug: string;
  shortConcept?: string | null;
  isFeatured?: boolean;
};

export function toSpecialty(dto: PublicSpecialtyDto): Specialty {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    shortConcept: dto.shortConcept ?? null,
    isFeatured: dto.isFeatured ?? false,
  };
}
