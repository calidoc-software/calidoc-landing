import type { Metadata } from "next";
import { PaymentTest } from "./PaymentTest";

export const metadata: Metadata = {
  title: "Prueba de pago (Culqi)",
  robots: { index: false, follow: false },
};

export default function TestPagoPage() {
  return <PaymentTest />;
}
