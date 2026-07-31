"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { burgers } from "@/data/menu";
import { announcements } from "@/data/announcements";
import { paymentAlias, whatsappNumber } from "@/data/payment";
import { CartSidebar } from "./cart-sidebar";
import { MinusIcon, PlusIcon } from "./quantity-icons";

type CartMap = Record<string, number>;
const CART_STORAGE_KEY = "notypical-cart-v1";

const MARQUEE_WORDS = ["Crispy", "Juicy", "Different", "Not For Everyone", "Smash Burgers"];

export function Storefront() {
  const [cart, setCart] = useState<CartMap>({});
  const [cartReady, setCartReady] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [variantAlert, setVariantAlert] = useState<string | null>(null);
  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);
  const [justAddedVariant, setJustAddedVariant] = useState<string | null>(null);
  // Si una hamburguesa tiene una sola variante (capa), se preselecciona porque
  // no hay nada que elegir. Si tiene varias (ej: Simple/Doble), arranca sin
  // selección: el cliente tiene que elegir explícitamente antes de agregarla.
  const [selectedVariantByBurger, setSelectedVariantByBurger] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      for (const burger of burgers) {
        if (burger.variants.length === 1 && burger.variants[0]) {
          initial[burger.id] = burger.variants[0].id;
        }
      }
      return initial;
    },
  );
  const [selectedImageByVariant, setSelectedImageByVariant] = useState<Record<string, number>>({});
  const [lightboxBurgerId, setLightboxBurgerId] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCart(JSON.parse(storedCart) as CartMap);
      }
    } catch {
      // Ignore malformed storage.
    } finally {
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    if (!cartReady || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, cartReady]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) {
        return;
      }

      try {
        setCart(event.newValue ? (JSON.parse(event.newValue) as CartMap) : {});
      } catch {
        setCart({});
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!justAddedVariant) {
      return;
    }

    const timeout = window.setTimeout(() => setJustAddedVariant(null), 900);
    return () => window.clearTimeout(timeout);
  }, [justAddedVariant]);

  useEffect(() => {
    if (!variantAlert) {
      return;
    }

    const timeout = window.setTimeout(() => setVariantAlert(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [variantAlert]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setStatusMessage(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  // Lightbox: bloquea el scroll de fondo y permite cerrar con Escape.
  useEffect(() => {
    if (!lightboxBurgerId) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxBurgerId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxBurgerId]);

  const openLightbox = (burgerId: string) => {
    setIsImageZoomed(false);
    setLightboxBurgerId(burgerId);
  };

  const allVariants = useMemo(() => {
    return burgers.flatMap((burger) =>
      burger.variants.map((variant) => ({
        ...variant,
        burgerId: burger.id,
        burgerName: burger.name,
      })),
    );
  }, []);

  const cartItems = useMemo(() => {
    return allVariants
      .filter((variant) => cart[variant.id] > 0)
      .map((variant) => ({
        id: variant.id,
        name: `${variant.burgerName} · ${variant.label}`,
        priceCents: variant.priceCents,
        quantity: cart[variant.id],
      }));
  }, [allVariants, cart]);

  const totalCents = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.priceCents * item.quantity, 0);
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  useEffect(() => {
    if (announcements.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeAnnouncement = announcements[activeAnnouncementIndex] ?? null;

  const addToCart = (variantId: string) => {
    setCart((prev) => ({
      ...prev,
      [variantId]: (prev[variantId] ?? 0) + 1,
    }));
    setJustAddedVariant(variantId);
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => {
      const nextQty = (prev[variantId] ?? 0) - 1;
      if (nextQty <= 0) {
        const { [variantId]: _removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [variantId]: nextQty,
      };
    });
  };

  const selectVariant = (burgerId: string, variantId: string) => {
    setSelectedVariantByBurger((prev) => ({ ...prev, [burgerId]: variantId }));
  };

  const handleAddClick = (burgerName: string, selectedVariantId: string | undefined) => {
    if (!selectedVariantId) {
      setVariantAlert(`Elegí una capa (Simple o Doble) antes de agregar "${burgerName}" a tu pedido.`);
      return;
    }

    addToCart(selectedVariantId);
  };

  const selectImage = (variantId: string, imageIndex: number) => {
    setSelectedImageByVariant((prev) => ({ ...prev, [variantId]: imageIndex }));
  };

  const handleCheckout = async (data: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  }) => {
    setSubmitting(true);
    setStatusMessage("");

    try {
      // El pedido se confirma por WhatsApp: armamos un mensaje con el
      // detalle completo (productos, datos del cliente y el alias para
      // transferir) y abrimos wa.me con todo pre-cargado. No hay pasarela
      // de pago conectada a propósito: así no se paga ninguna comisión,
      // el cliente transfiere directo y el negocio confirma manualmente
      // cuando recibe el comprobante.
      const itemsLines = cartItems
        .map((item) => `- ${item.quantity}x ${item.name}`)
        .join("\n");

      const messageLines = [
        "¡Hola! Quiero confirmar mi pedido de NO TYPICAL 🍔",
        "",
        "*Pedido:*",
        itemsLines,
        "",
        `*Total:* ${formatCurrency(totalCents)}`,
        "",
        "*Mis datos:*",
        `Nombre: ${data.name}`,
        `Teléfono: ${data.phone}`,
        `Dirección: ${data.address || "-"}`,
        `Notas: ${data.notes || "-"}`,
        "",
        `*Pago:* Transfiero al alias "${paymentAlias}" y mando el comprobante acá mismo.`,
      ];

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        messageLines.join("\n"),
      )}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      setCart({});
      setStatusMessage(
        `¡Gracias ${data.name}! Te abrimos WhatsApp con tu pedido y el alias para transferir. Enviá el mensaje para confirmarlo.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 md:px-8 md:py-16 md:pb-16">
        {/* Hero Section */}
        <section className="mb-10 md:mb-14">
          <h1 className="text-[2.75rem] leading-[0.95] font-bold tracking-tight text-brand sm:text-6xl md:text-7xl md:leading-[0.95]">
            Smasheadas a la
            <br />
            perfección.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted md:text-lg">
            Smash burgers no aptas para todo el mundo. Elegí tu capa, sumá la que más te
            guste y hacé tu pedido en línea.
          </p>
          <a
            href="#menu"
            className="wn-btn wn-btn-primary mt-6 inline-flex w-full justify-center text-base sm:w-auto"
          >
            Ver el Menú ↓
          </a>
        </section>

        {/* Marquee ticker */}
        <div className="relative -mx-4 mb-10 overflow-hidden border-y border-brand/20 bg-surface-soft py-3 md:-mx-8 md:mb-14">
          <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap text-xs font-bold uppercase tracking-[0.3em] text-brand-soft md:text-sm">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((word, index) => (
              <span key={`${word}-${index}`} className="flex items-center gap-8">
                <span>{word}</span>
                <span className="text-brand">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Announcements */}
        {activeAnnouncement && (
          <section className="mb-10 md:mb-14">
            <div className="relative overflow-hidden rounded-[2rem] border border-brand/20 bg-[radial-gradient(circle_at_15%_20%,rgba(255,152,26,0.2),transparent_40%),linear-gradient(140deg,#1a1a1a_0%,#211203_100%)] p-4 md:p-6">
              <article
                key={activeAnnouncement.id}
                className="wn-card flex h-48 min-w-full flex-col justify-center rounded-[1.5rem] border px-6 py-5 md:h-64 md:px-10 animate-fade-in"
              >
                {activeAnnouncement.title ? (
                  <p className="mb-4 text-xs uppercase tracking-[0.36em] text-brand-soft md:text-sm">
                    {activeAnnouncement.title}
                  </p>
                ) : null}
                <p className="max-w-4xl text-xl leading-snug text-foreground md:text-4xl">
                  {activeAnnouncement.message || activeAnnouncement.title}
                </p>
              </article>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {announcements.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeAnnouncementIndex ? "w-8 bg-brand" : "w-2.5 bg-brand/35"
                      }`}
                      onClick={() => setActiveAnnouncementIndex(index)}
                      aria-label={`Ir al anuncio ${index + 1}`}
                    />
                  ))}
                </div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Auto</p>
              </div>
            </div>
          </section>
        )}

        {/* Menu Section */}
        <section>
          <h2 id="menu" className="scroll-mt-24 text-3xl font-bold text-brand mb-6 sm:text-4xl md:text-5xl md:mb-8">
            Menú de Hamburguesas
          </h2>

          {burgers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted text-lg">No hay hamburguesas disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {burgers.map((burger) => {
                const selectedVariantId = selectedVariantByBurger[burger.id];
                const selectedVariant = burger.variants.find(
                  (variant) => variant.id === selectedVariantId,
                );
                const previewVariant = selectedVariant ?? burger.variants[0];
                const selectedImageIndex = previewVariant
                  ? selectedImageByVariant[previewVariant.id] ?? 0
                  : 0;
                const activeImage =
                  previewVariant?.images[selectedImageIndex] ?? "/images/burger-placeholder.svg";
                const wasJustAdded = selectedVariant?.id === justAddedVariant;
                const quantityInCart = selectedVariant ? cart[selectedVariant.id] ?? 0 : 0;

                return (
                  <article
                    key={burger.id}
                    className="wn-card group flex h-full flex-col overflow-hidden rounded-2xl border transition-transform duration-300 active:scale-[0.98] md:hover:-translate-y-1 md:hover:scale-[1.02]"
                  >
                    {/* Image (tocar para ver en grande) */}
                    <button
                      type="button"
                      onClick={() => openLightbox(burger.id)}
                      className="group/photo relative h-52 w-full overflow-hidden bg-surface-soft sm:h-56"
                      aria-label={`Ver foto en grande de ${burger.name}`}
                    >
                      <img
                        src={activeImage}
                        alt={burger.name}
                        className="h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-110"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = "/images/burger-placeholder.svg";
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur transition-opacity md:opacity-0 md:group-hover/photo:opacity-100">
                        🔍 Ver foto
                      </span>
                    </button>

                    {/* Thumbnails */}
                    {previewVariant && previewVariant.images.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto px-5 pt-3">
                        {previewVariant.images.map((image, index) => (
                          <button
                            key={image}
                            type="button"
                            onClick={() => selectImage(previewVariant.id, index)}
                            className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                              index === selectedImageIndex ? "border-brand" : "border-transparent"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${burger.name} foto ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <div className="flex-1 space-y-4">
                        {/* Title & Price */}
                        <div>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                            📷 Foto {selectedImageIndex + 1} de {previewVariant?.images.length ?? 1}
                          </p>
                          <h3 className="text-2xl font-bold text-brand-soft mb-2">{burger.name}</h3>
                          {selectedVariant ? (
                            <p className="text-4xl font-bold text-brand">
                              {formatCurrency(selectedVariant.priceCents)}
                            </p>
                          ) : (
                            <p className="text-lg font-semibold text-muted-strong">
                              Elegí el tamaño para ver el precio ↓
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-strong leading-relaxed">{burger.description}</p>

                        {/* Variant selector: siempre visible, incluso con una sola opción,
                            para que quede claro qué capa trae la hamburguesa. */}
                        <div className="flex flex-wrap gap-2">
                          {burger.variants.map((variant) => (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => selectVariant(burger.id, variant.id)}
                              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                variant.id === selectedVariant?.id
                                  ? "border-brand bg-brand text-background"
                                  : "border-brand/30 text-muted hover:border-brand/60 hover:text-foreground"
                              }`}
                            >
                              {variant.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add to Cart Button / Quantity Stepper */}
                      {quantityInCart === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleAddClick(burger.name, selectedVariant?.id)}
                          className="wn-btn wn-btn-primary h-12 w-full"
                          aria-label={`Agregar ${burger.name} al pedido`}
                        >
                          Agregar al Pedido
                        </button>
                      ) : (
                        <div
                          className={`flex h-12 items-center justify-between gap-2 rounded-full border border-brand bg-brand/10 px-2 ${
                            wasJustAdded ? "animate-add-pulse" : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => selectedVariant && removeFromCart(selectedVariant.id)}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface text-brand transition-transform active:scale-90"
                            aria-label={`Quitar una unidad de ${burger.name}`}
                          >
                            <MinusIcon />
                          </button>
                          <span className="text-sm font-bold text-brand-soft">
                            {quantityInCart} en tu pedido
                          </span>
                          <button
                            type="button"
                            onClick={() => selectedVariant && addToCart(selectedVariant.id)}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-background transition-transform active:scale-90"
                            aria-label={`Agregar otra unidad de ${burger.name}`}
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Cart Sidebar */}
        <CartSidebar
          items={cartItems}
          totalCents={totalCents}
          isOpen={isCartOpen}
          onOpenChange={setIsCartOpen}
          onRemoveItem={removeFromCart}
          onAddItem={addToCart}
          onCheckout={handleCheckout}
          isLoading={submitting}
        />

        {/* Status Message (pedido confirmado) */}
        {statusMessage && (
          <div className="fixed left-1/2 top-20 z-[60] w-[calc(100%-2rem)] max-w-sm animate-slide-down md:top-24">
            <div className="flex items-start gap-3 rounded-2xl border-2 border-ok bg-surface/95 p-4 shadow-[0_16px_44px_rgba(55,214,122,0.3)] backdrop-blur">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ok/15 text-lg">
                ✅
              </span>
              <p className="flex-1 pt-1 text-sm font-semibold leading-snug text-foreground">
                {statusMessage}
              </p>
              <button
                type="button"
                onClick={() => setStatusMessage("")}
                className="flex-shrink-0 text-muted transition-colors hover:text-ok"
                aria-label="Cerrar aviso"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Variant selection alert (custom, on-brand — no window.alert) */}
        {variantAlert && (
          <div className="fixed left-1/2 top-20 z-[60] w-[calc(100%-2rem)] max-w-sm animate-slide-down md:top-24">
            <div className="flex items-start gap-3 rounded-2xl border-2 border-brand bg-surface/95 p-4 shadow-[0_16px_44px_rgba(255,152,26,0.3)] backdrop-blur">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 text-lg">
                🍔
              </span>
              <p className="flex-1 pt-1 text-sm font-semibold leading-snug text-foreground">
                {variantAlert}
              </p>
              <button
                type="button"
                onClick={() => setVariantAlert(null)}
                className="flex-shrink-0 text-muted transition-colors hover:text-brand"
                aria-label="Cerrar aviso"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile sticky cart bar */}
      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand/30 bg-surface/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.45)] backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-full bg-brand px-5 py-3 text-background active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20 text-xs">
                {itemCount}
              </span>
              Ver pedido
            </span>
            <span className="text-base font-extrabold">{formatCurrency(totalCents)}</span>
          </button>
        </div>
      )}

      {/* Lightbox: foto en grande con zoom y opción de agregar directo */}
      {lightboxBurgerId &&
        (() => {
          const burger = burgers.find((item) => item.id === lightboxBurgerId);
          if (!burger) {
            return null;
          }

          const selectedVariantId = selectedVariantByBurger[burger.id];
          const selectedVariant = burger.variants.find(
            (variant) => variant.id === selectedVariantId,
          );
          const previewVariant = selectedVariant ?? burger.variants[0];
          const imageIndex = previewVariant
            ? selectedImageByVariant[previewVariant.id] ?? 0
            : 0;
          const image = previewVariant?.images[imageIndex] ?? "/images/burger-placeholder.svg";
          const quantityInCart = selectedVariant ? cart[selectedVariant.id] ?? 0 : 0;
          const wasJustAdded = selectedVariant?.id === justAddedVariant;

          return (
            <div
              className="fixed inset-0 z-[70] flex flex-col bg-black/92 backdrop-blur-sm animate-fade-in"
              onClick={() => setLightboxBurgerId(null)}
            >
              <button
                type="button"
                onClick={() => setLightboxBurgerId(null)}
                className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-lg transition-transform active:scale-90"
                aria-label="Cerrar foto"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Foto (tocar para hacer zoom) */}
              <div
                className="flex flex-1 items-center justify-center overflow-auto p-4"
                onClick={(event) => event.stopPropagation()}
              >
                <img
                  src={image}
                  alt={burger.name}
                  onClick={() => setIsImageZoomed((prev) => !prev)}
                  className={`max-h-full max-w-full rounded-2xl object-contain shadow-2xl transition-transform duration-300 ${
                    isImageZoomed ? "scale-[1.9] cursor-zoom-out" : "scale-100 cursor-zoom-in"
                  }`}
                />
              </div>

              {/* Footer: nombre, precio, capa y agregar — todo sin salir del modal */}
              <div
                className="border-t border-brand/20 bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mx-auto w-full max-w-md">
                  <h3 className="text-xl font-bold text-brand-soft">{burger.name}</h3>
                  {selectedVariant ? (
                    <p className="mb-3 text-2xl font-bold text-brand">
                      {formatCurrency(selectedVariant.priceCents)}
                    </p>
                  ) : (
                    <p className="mb-3 text-sm font-semibold text-muted-strong">
                      Elegí una capa para ver el precio
                    </p>
                  )}

                  {burger.variants.length > 1 ? (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {burger.variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => selectVariant(burger.id, variant.id)}
                          className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                            variant.id === selectedVariant?.id
                              ? "border-brand bg-brand text-background"
                              : "border-brand/30 text-muted hover:border-brand/60 hover:text-foreground"
                          }`}
                        >
                          {variant.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleAddClick(burger.name, selectedVariant?.id)}
                    className={`wn-btn h-12 w-full transition-colors ${
                      wasJustAdded ? "animate-add-pulse bg-ok text-[#0b2313]" : "wn-btn-primary"
                    }`}
                  >
                    {quantityInCart > 0
                      ? `✓ En tu pedido (${quantityInCart}) · Agregar otra`
                      : "Agregar al Pedido"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
