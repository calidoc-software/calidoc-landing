"use client";

// Pagina SOLO de pruebas: Culqi Checkout Custom + endpoints de pago de calidoc-api.
// Flujo: checkout (monto con comision) -> Culqi genera token -> POST payment/card, saved-card o yape.

import Script from "next/script";
import { useState } from "react";
import { CulqiPaymentModal, type PayRequest, type SavedCard } from "@/features/payments";
import { env } from "@/shared/lib/env";

const API = env.NEXT_PUBLIC_API_BASE_URL;
const CULQI_PUBLIC_KEY = env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;

type CheckoutResponse = {
  appointmentPaymentId: string;
  amount: number;
  currency: string;
  checkoutExpiresAt: string;
};

export function PaymentTest() {
  const [scriptReady, setScriptReady] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [email, setEmail] = useState("");
  const [bearer, setBearer] = useState("");
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);

  const addLog = (label: string, data?: unknown) =>
    setLog((l) => [
      ...l,
      `${label}${data === undefined ? "" : "\n" + JSON.stringify(data, null, 2)}`,
    ]);

  const paymentPath = (path: string) => `/appointments/${appointmentId.trim()}/payment/${path}`;

  const apiFetch = async (path: string, method: "GET" | "POST", body?: object) => {
    const res = await fetch(`${API}/api/v1${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(bearer && { Authorization: `Bearer ${bearer.trim()}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: unknown = text;
    try {
      json = JSON.parse(text);
    } catch {}
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
    return json;
  };

  const getCheckout = async () => {
    setBusy(true);
    try {
      const data = (await apiFetch(paymentPath("checkout"), "GET")) as CheckoutResponse;
      setCheckout(data);
      addLog("checkout OK", data);
      try {
        const cards = (await apiFetch("/payment-methods", "GET")) as SavedCard[];
        setSavedCards(cards);
        addLog(`tarjetas guardadas: ${cards.length}`);
      } catch (e) {
        setSavedCards([]);
        addLog(`payment-methods ERROR: ${(e as Error).message}`);
      }
    } catch (e) {
      addLog(`checkout ERROR: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const pay = async ({ tokenId, savedCardId, saveCard, isYape }: PayRequest) => {
    setModalOpen(false);
    addLog(
      savedCardId
        ? `tarjeta guardada: ${savedCardId}`
        : `token Culqi: ${tokenId} (${isYape ? "Yape" : `tarjeta, guardar: ${saveCard}`})`,
    );
    try {
      const appointmentPaymentId = checkout?.appointmentPaymentId;
      const data = savedCardId
        ? await apiFetch(paymentPath("saved-card"), "POST", { appointmentPaymentId, savedCardId })
        : isYape
          ? await apiFetch(paymentPath("yape"), "POST", { appointmentPaymentId, token: tokenId })
          : await apiFetch(paymentPath("card"), "POST", {
              appointmentPaymentId,
              token: tokenId,
              saveCard: saveCard ?? false,
            });
      addLog("pago OK", data);
    } catch (e) {
      addLog(`pago ERROR: ${(e as Error).message}`);
    }
  };

  const missingEnv = !CULQI_PUBLIC_KEY || !API;
  const inputCls =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none";

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-6 py-12">
      <Script src="https://js.culqi.com/checkout-js" onReady={() => setScriptReady(true)} />

      <h1 className="font-heading text-2xl font-bold">Prueba de pago · Culqi</h1>
      <p className="text-sm text-neutral-500">
        Pagina temporal de pruebas. Tarjeta de prueba Culqi: 4111 1111 1111 1111, cualquier CVV y
        fecha futura.
      </p>

      {missingEnv && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Falta NEXT_PUBLIC_CULQI_PUBLIC_KEY o NEXT_PUBLIC_API_BASE_URL en .env.local (reinicia el
          dev server tras editarlo).
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        ID de la cita
        <input
          className={inputCls}
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
          placeholder="01a14599-6daf-78c9-bc99-78e46a60e89a"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email del paciente
        <input
          className={inputCls}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="paciente@correo.com"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Bearer token de la API (si los endpoints requieren auth)
        <input className={inputCls} value={bearer} onChange={(e) => setBearer(e.target.value)} />
      </label>

      <button
        type="button"
        onClick={getCheckout}
        disabled={busy || !appointmentId.trim() || missingEnv}
        className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-400 active:bg-primary-600 disabled:opacity-50"
      >
        1. Obtener checkout
      </button>

      {checkout && (
        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
          <p className="font-semibold">
            Total a pagar: {checkout.currency} {checkout.amount.toFixed(2)}
          </p>
          <p className="text-neutral-500">
            Expira: {new Date(checkout.checkoutExpiresAt).toLocaleString()}
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={!scriptReady || !email}
            className="mt-3 rounded-lg bg-secondary-500 px-4 py-2 font-medium text-white hover:bg-secondary-400 active:bg-secondary-600 disabled:opacity-50"
          >
            2. Pagar con Culqi
          </button>
          {!email && (
            <p className="mt-1 text-xs text-neutral-500">
              Ingresa un email para habilitar el pago.
            </p>
          )}
        </section>
      )}

      {checkout && (
        <CulqiPaymentModal
          open={modalOpen}
          summary={checkout}
          email={email}
          savedCards={savedCards}
          onPay={pay}
          onClose={() => setModalOpen(false)}
        />
      )}

      {log.length > 0 && (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-dark-bg p-4 text-xs text-dark-text">
          {log.join("\n\n")}
        </pre>
      )}
    </main>
  );
}
