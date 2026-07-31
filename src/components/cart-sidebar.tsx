"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  NAME_MAX_LENGTH,
  formatPhoneDisplay,
  formatPhoneSubmission,
  isValidAddress,
  isValidName,
  isValidNotes,
  isValidPhoneDigits,
  sanitizeAddress,
  sanitizeName,
  sanitizeNotes,
  sanitizePhoneDigits,
} from "@/lib/order-form";
import { MinusIcon, PlusIcon } from "./quantity-icons";
import { paymentAlias } from "@/data/payment";

type CartItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
};

interface CartSidebarProps {
  items: CartItem[];
  totalCents: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveItem: (variantId: string) => void;
  onAddItem: (variantId: string) => void;
  onCheckout: (data: { name: string; phone: string; address: string; notes: string }) => Promise<void>;
  isLoading?: boolean;
}

function ChevronIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function CartSidebar({
  items,
  totalCents,
  isOpen,
  onOpenChange,
  onRemoveItem,
  onAddItem,
  onCheckout,
  isLoading = false,
}: CartSidebarProps) {
  const [customerName, setCustomerName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [error, setError] = useState("");
  const [badgeBump, setBadgeBump] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [scrollThumb, setScrollThumb] = useState<{ heightPct: number; topPct: number } | null>(
    null,
  );
  const itemsScrollRef = useRef<HTMLDivElement | null>(null);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (itemCount === 0) {
      return;
    }
    setBadgeBump(true);
    const timeout = window.setTimeout(() => setBadgeBump(false), 320);
    return () => window.clearTimeout(timeout);
  }, [itemCount]);

  const updateScrollThumb = () => {
    const el = itemsScrollRef.current;
    if (!el) {
      return;
    }

    const { scrollHeight, clientHeight, scrollTop } = el;

    if (scrollHeight <= clientHeight + 1) {
      setScrollThumb(null);
      return;
    }

    const heightPct = Math.max((clientHeight / scrollHeight) * 100, 12);
    const maxTop = 100 - heightPct;
    const topPct = (scrollTop / (scrollHeight - clientHeight)) * maxTop;
    setScrollThumb({ heightPct, topPct });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    // Recalculate once the sidebar is actually visible/laid out.
    const raf = window.requestAnimationFrame(updateScrollThumb);
    return () => window.cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, items]);

  useEffect(() => {
    const el = itemsScrollRef.current;
    if (!el) {
      return;
    }

    const handleResize = () => updateScrollThumb();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Agregá al menos un producto a tu pedido.");
      return;
    }

    const trimmedName = customerName.trim();
    if (!isValidName(trimmedName)) {
      setError(
        trimmedName.length === 0
          ? "Ingresá tu nombre."
          : `El nombre solo puede tener letras (máximo ${NAME_MAX_LENGTH} caracteres).`,
      );
      return;
    }

    if (!isValidPhoneDigits(phoneDigits)) {
      setError("Ingresá un teléfono válido, ej: +54 11 2222-2222.");
      return;
    }

    const trimmedAddress = customerAddress.trim();
    if (!isValidAddress(trimmedAddress)) {
      setError("La dirección solo puede tener letras y números.");
      return;
    }

    const trimmedNotes = deliveryNotes.trim();
    if (!isValidNotes(trimmedNotes)) {
      setError("Las notas solo pueden tener letras.");
      return;
    }

    try {
      await onCheckout({
        name: trimmedName,
        phone: formatPhoneSubmission(phoneDigits),
        address: trimmedAddress,
        notes: trimmedNotes,
      });

      // Reset form on success
      setCustomerName("");
      setPhoneDigits("");
      setCustomerAddress("");
      setDeliveryNotes("");
      onOpenChange(false);
    } catch {
      setError("No pudimos procesar tu pedido. Intenta nuevamente.");
    }
  };

  return (
    <>
      {/* Floating Cart Button (desktop/tablet only, mobile uses the sticky bottom bar) */}
      <button
        onClick={() => onOpenChange(!isOpen)}
        className="fixed right-6 top-20 z-30 hidden items-center justify-center rounded-full bg-brand p-3 text-background shadow-lg transition-transform hover:scale-110 md:right-8 md:flex"
        aria-label="Abrir carrito"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {itemCount > 0 && (
          <span
            className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-background ${
              badgeBump ? "animate-bump" : ""
            }`}
          >
            {itemCount}
          </span>
        )}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Cart Sidebar */}
      <aside
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-md bg-surface shadow-[-16px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out md:max-w-sm ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {/* Header */}
          <div className="mb-4 flex flex-shrink-0 items-center justify-between">
            <h2 className="text-3xl font-bold text-brand">Tu Pedido</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-foreground hover:text-brand transition-colors"
              aria-label="Cerrar carrito"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Items (with a visible scroll indicator so nothing feels "lost") */}
          <div className="relative min-h-0 flex-1">
            <div
              ref={itemsScrollRef}
              onScroll={updateScrollThumb}
              className="no-native-scrollbar h-full space-y-3 overflow-y-auto pr-3"
            >
              {items.length === 0 ? (
                <p className="text-sm text-muted">Todavía no agregaste productos.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="animate-float-up flex items-center justify-between gap-3 rounded-lg border border-brand/20 bg-surface-soft p-3"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-brand-soft">
                        {formatCurrency(item.priceCents * item.quantity)}
                      </p>
                    </div>
                    <div className="flex h-10 flex-shrink-0 items-center justify-between gap-1.5 rounded-full border border-brand bg-brand/10 px-1.5">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-brand transition-transform active:scale-90"
                        aria-label={`Quitar una unidad de ${item.name}`}
                      >
                        <MinusIcon className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-4 text-center text-sm font-bold text-brand-soft">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAddItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-background transition-transform active:scale-90"
                        aria-label={`Agregar otra unidad de ${item.name}`}
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Custom scrollbar indicator */}
            {scrollThumb && (
              <div className="pointer-events-none absolute right-0 top-0 h-full w-1.5 rounded-full bg-surface-soft">
                <div
                  className="absolute right-0 w-1.5 rounded-full bg-brand transition-[top] duration-75"
                  style={{ height: `${scrollThumb.heightPct}%`, top: `${scrollThumb.topPct}%` }}
                />
              </div>
            )}
          </div>

          {/* Total */}
          {items.length > 0 && (
            <div className="flex-shrink-0 border-t border-brand/20 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-base text-muted">Total:</span>
                <span className="text-2xl font-bold text-brand">
                  {formatCurrency(totalCents)}
                </span>
              </div>

              {/* Collapse toggle: lets the user hide the form to see the full order again */}
              <button
                type="button"
                onClick={() => setIsFormOpen((prev) => !prev)}
                className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-brand/20 bg-surface-soft py-2 text-xs font-semibold text-muted transition-colors hover:text-brand"
              >
                {isFormOpen ? "Ocultar datos y ver mi pedido" : "Completar mis datos"}
                <ChevronIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isFormOpen ? "" : "rotate-180"
                  }`}
                />
              </button>

              {/* Checkout Form */}
              {isFormOpen && (
                <form onSubmit={handleSubmit} className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={customerName}
                      onChange={(e) => setCustomerName(sanitizeName(e.target.value))}
                      className="wn-input"
                      maxLength={NAME_MAX_LENGTH}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <div className="wn-input-group">
                      <span className="wn-input-prefix" aria-hidden="true">
                        🇦🇷 +54
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="11 2222-2222"
                        value={formatPhoneDisplay(phoneDigits)}
                        onChange={(e) => setPhoneDigits(sanitizePhoneDigits(e.target.value))}
                        className="wn-input-bare"
                        aria-label="Teléfono (código de área + número, sin +54)"
                        disabled={isLoading}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      Ej: 11 2222-2222 (código de área + número)
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="Dirección (opcional)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(sanitizeAddress(e.target.value))}
                    className="wn-input"
                    disabled={isLoading}
                  />
                  <textarea
                    placeholder="Notas especiales (opcional)"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(sanitizeNotes(e.target.value))}
                    className="wn-input min-h-[80px]"
                    disabled={isLoading}
                  />

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <p className="rounded-lg border border-brand/20 bg-surface-soft px-3 py-2 text-[11px] leading-relaxed text-muted">
                    Pago por transferencia al alias{" "}
                    <span className="font-bold text-brand-soft">{paymentAlias}</span>. Al
                    confirmar se abre WhatsApp con tu pedido y este dato para que envíes el
                    comprobante.
                  </p>

                  <button
                    type="submit"
                    className="wn-btn wn-btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Procesando..." : "Confirmar Pedido"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
