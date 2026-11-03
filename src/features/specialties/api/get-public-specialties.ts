import { api, publicCache } from "@/shared/lib/api";
import { type PublicSpecialtyDto, toSpecialty } from "../mappers/specialty.mapper";
import type { Specialty } from "../types";

export async function getPublicSpecialties(): Promise<Specialty[]> {
  const dtos = await api.get<PublicSpecialtyDto[]>(
    "/Specialties/public",
    publicCache(["specialties"]),
  );
  return dtos.map(toSpecialty);
}
