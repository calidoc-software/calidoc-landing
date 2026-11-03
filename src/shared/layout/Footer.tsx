import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-200 bg-white">
      <Container className="flex flex-col gap-3 py-8 text-sm text-neutral-500">
        <p>
          <strong className="font-semibold text-neutral-900">
            Calidoc no atiende emergencias.
          </strong>{" "}
          Si tienes una urgencia, acude al centro de salud más cercano o llama al servicio de
          emergencias de tu localidad.
        </p>
        <p>© {new Date().getFullYear()} Calidoc</p>
      </Container>
    </footer>
  );
}
