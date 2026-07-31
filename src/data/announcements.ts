/**
 * ANUNCIOS / BANNER ROTATIVO
 * ===========================
 * Se muestran arriba del menú, rotando cada pocos segundos. Es opcional:
 * si dejás el array vacío, esa sección no se muestra.
 *
 * Cada anuncio usa "title" (una frase corta, tipo cartel) O "message"
 * (un texto más largo tipo banner). Usá uno u otro, no ambos.
 */

export type Announcement = {
  id: string;
  title: string;
  message: string;
};

export const announcements: Announcement[] = [
  {
    id: "promo-1",
    title: "PDM es la favorita",
    message: "",
  },
  {
    id: "promo-2",
    title: "",
    message: "Pedí online y elegí la capa que más te guste: Simple, Doble o Triple.",
  },
];
