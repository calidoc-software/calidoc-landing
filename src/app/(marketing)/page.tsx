import { DoctorSearch } from "@/features/doctors";
import { Hero } from "@/features/home";
import { getPublicSpecialties } from "@/features/specialties/server";

export const revalidate = 3600;

export default async function Home() {
  const specialties = await getPublicSpecialties().catch((error: unknown) => {
    console.error("No se pudieron cargar las especialidades", error);
    return [];
  });

  return (
    <Hero
      search={
        <DoctorSearch
          specialties={specialties.map(({ slug, name }) => ({ value: slug, label: name }))}
        />
      }
    />
  );
}
