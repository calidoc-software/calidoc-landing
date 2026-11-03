import { FileText, Lock, ShieldCheck } from "lucide-react";
import { Container } from "@/shared/layout/Container";

const highlights = [
  { icon: ShieldCheck, label: "Médicos verificados" },
  { icon: FileText, label: "Receta digital" },
  { icon: Lock, label: "Pago seguro" },
];

export function TrustHighlights() {
  return (
    <section aria-label="Por qué elegir Calidoc" className="mt-10">
      <Container>
        <ul className="reveal grid gap-3 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-4 text-sm font-semibold text-neutral-900"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-tertiary-50 text-primary-600">
                <Icon size={18} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
