"use client";

import { Baloo_2, Plus_Jakarta_Sans } from "next/font/google";
import { useEffect, useRef, useState } from "react";

const heading = Baloo_2({ subsets: ["latin"], weight: ["600", "700"] });
const body = Plus_Jakarta_Sans({ subsets: ["latin"] });

const CULQI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
const CONTAINER_ID = "culqi-container";

export type PaymentSummary = {
  amount: number;
  currency: string;
};

export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  cardType: string;
  expiryMonth: number | null;
  expiryYear: number | null;
  alias: string | null;
  isDefault: boolean;
};

export type PayRequest = {
  tokenId?: string;
  savedCardId?: string;
  saveCard?: boolean;
  isYape?: boolean;
};

const NEW_CARD = "new";
const CARD_TYPE_LABEL: Record<string, string> = { Debit: "Débito", Credit: "Crédito" };

type CulqiInstance = {
  open: () => void;
  close: () => void;
  culqi: () => void;
  token?: { id: string };
  error?: { user_message?: string; merchant_message?: string };
};

declare global {
  interface Window {
    CulqiCheckout?: new (publicKey: string, config: object) => CulqiInstance;
  }
}

type Props = {
  open: boolean;
  summary: PaymentSummary;
  email: string;
  savedCards: SavedCard[];
  onPay: (request: PayRequest) => void;
  onClose: () => void;
};

const money = (currency: string, value: number) => `${currency} ${value.toFixed(2)}`;

export function CulqiPaymentModal({ open, summary, email, savedCards, onPay, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [saveCard, setSaveCard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choice, setChoice] = useState<string | null>(null);

  const defaultChoice = (savedCards.find((c) => c.isDefault) ?? savedCards[0])?.id ?? NEW_CARD;
  const selected =
    savedCards.some((c) => c.id === choice) || choice === NEW_CARD ? choice! : defaultChoice;
  const payingNewCard = selected === NEW_CARD;
  const select = (id: string) => {
    setError(null);
    setChoice(id);
  };

  // Los callbacks de Culqi se crean una vez; leen siempre el valor vigente.
  const saveCardRef = useRef(saveCard);
  const onPayRef = useRef(onPay);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    saveCardRef.current = saveCard;
    onPayRef.current = onPay;
    onCloseRef.current = onClose;
  });

  const { currency, amount } = summary;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !payingNewCard || !window.CulqiCheckout || !CULQI_PUBLIC_KEY) return;

    const culqi = new window.CulqiCheckout(CULQI_PUBLIC_KEY, {
      settings: {
        title: "Calidoc",
        currency,
        amount: Math.round(amount * 100),
      },
      client: { email },
      options: {
        lang: "es",
        modal: false,
        container: `#${CONTAINER_ID}`,
        paymentMethods: { tarjeta: true, yape: true },
      },
      appearance: {
        theme: "default",
        hiddenBanner: true,
        hiddenToolBarAmount: true,
        hiddenEmail: true,
        buttonCardPayText: `Pagar ${money(currency, amount)}`,
        variables: {
          fontFamily: "inherit",
          borderRadius: "12px",
          colorBackground: "#FFFFFF",
          colorPrimary: "#00B7E2",
          colorPrimaryText: "#FFFFFF",
          colorText: "#37424A",
          colorTextSecondary: "#65767F",
          colorTextPlaceholder: "#94A3AC",
        },
        rules: {
          ".Culqi-Label": { color: "#37424A", fontWeight: "600", fontSize: "14px" },
          ".Culqi-Input": { borderColor: "#C2CDD3", borderRadius: "12px" },
          ".Culqi-Input:focus": { borderColor: "#00B7E2" },
          ".Culqi-Input.input-invalid": { borderColor: "#E5484D" },
          ".Culqi-Button": {
            background: "#00B7E2",
            color: "#FFFFFF",
            borderRadius: "12px",
            fontWeight: "700",
          },
        },
      },
    });

    culqi.culqi = () => {
      if (culqi.token) {
        const tokenId = culqi.token.id;
        culqi.close();
        // Culqi prefija los ids: tkn_ para tarjeta, ype_ para Yape.
        onPayRef.current({
          tokenId,
          saveCard: saveCardRef.current,
          isYape: tokenId.startsWith("ype_"),
        });
      } else {
        setError(culqi.error?.user_message ?? "No pudimos procesar la tarjeta. Intenta de nuevo.");
      }
    };

    culqi.open();

    const container = containerRef.current;
    return () => container?.replaceChildren();
  }, [open, payingNewCard, currency, amount, email]);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => onCloseRef.current()}
      aria-labelledby="pay-title"
      className={`${body.className} m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-neutral-700 shadow-2xl backdrop:bg-dark-bg/60`}
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <div>
          <h2
            id="pay-title"
            className={`${heading.className} text-xl leading-tight text-neutral-900`}
          >
            Pago de tu cita
          </h2>
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <span aria-hidden>🔒</span> Pago seguro con tarjeta o Yape
          </p>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Cerrar"
          className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-5 px-6 py-5">
        <dl className="flex flex-col gap-2 rounded-xl bg-neutral-50 p-4 text-sm">
          <div className="flex justify-between text-base font-bold text-neutral-900">
            <dt>Consulta médica</dt>
            <dd>{money(currency, amount)}</dd>
          </div>
        </dl>

        {savedCards.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold text-neutral-900">Medio de pago</legend>
            {savedCards.map((card) => (
              <CardOption
                key={card.id}
                checked={selected === card.id}
                onSelect={() => select(card.id)}
              >
                <span className="flex flex-col">
                  <span className="font-semibold text-neutral-900">
                    {card.alias ?? card.brand} •••• {card.last4}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {[
                      card.alias ? card.brand : null,
                      CARD_TYPE_LABEL[card.cardType] ?? card.cardType,
                      card.expiryMonth && card.expiryYear
                        ? `Vence ${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {card.isDefault && (
                  <span className="ml-auto rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
                    Predeterminada
                  </span>
                )}
              </CardOption>
            ))}
            <CardOption checked={payingNewCard} onSelect={() => select(NEW_CARD)}>
              <span className="font-semibold text-neutral-900">Usar otra tarjeta o Yape</span>
            </CardOption>
          </fieldset>
        )}

        {payingNewCard && (
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary-500"
            />
            <span>
              Guardar esta tarjeta para futuros pagos
              <span className="block text-xs text-neutral-500">
                Tus datos se guardan de forma segura en Culqi. Calidoc nunca almacena el número de
                tu tarjeta.
              </span>
            </span>
          </label>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        <div id={CONTAINER_ID} ref={containerRef} hidden={!payingNewCard} />

        {!payingNewCard && (
          <button
            type="button"
            onClick={() => onPay({ savedCardId: selected })}
            className="rounded-xl bg-primary-500 px-4 py-3 font-bold text-white hover:bg-primary-400 active:bg-primary-600"
          >
            Pagar {money(currency, amount)}
          </button>
        )}

        <p className="text-center text-xs text-neutral-500">
          Procesado por Culqi · Tus datos viajan cifrados
        </p>
      </div>
    </dialog>
  );
}

function CardOption({
  checked,
  onSelect,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
        checked ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300"
      }`}
    >
      <input
        type="radio"
        name="payment-method"
        checked={checked}
        onChange={onSelect}
        className="h-4 w-4 accent-primary-500"
      />
      {children}
    </label>
  );
}
