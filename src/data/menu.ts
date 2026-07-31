/**
 * MENU DE NO TYPICAL
 * ===================
 * Este archivo es la única fuente de verdad del menú. El sitio lo lee
 * directamente de acá, no hay base de datos ni panel de administración.
 *
 * Para agregar, sacar o modificar una hamburguesa: edita el array `burgers`
 * de más abajo y guarda el archivo. Si estás corriendo `npm run dev` el
 * cambio se ve al instante; si el sitio ya está publicado, hay que volver
 * a hacer deploy (un solo comando/push) para que se vea online.
 *
 * ESTRUCTURA DE CADA HAMBURGUESA
 * -------------------------------
 * - id: identificador único, sin espacios (ej: "cheese-burger"). Usalo para
 *   armar los nombres de archivo de las fotos, así es más fácil ordenarse.
 * - name: nombre que ve el cliente.
 * - description: bajada corta, aparece debajo del nombre. Describe la
 *   hamburguesa en sí (sabor/ingredientes), sin mencionar "simple" o
 *   "doble" — esa elección la hace el cliente con los botones de variante.
 * - variants: array con cada "capa" de la hamburguesa (Simple, Doble, Triple,
 *   o el nombre que quieras). Cada variante es independiente y tiene:
 *     - label: nombre de la variante (ej: "Simple").
 *     - layers: cantidad de capas de carne (1, 2, 3, ...). Es informativo,
 *       no afecta el precio automáticamente.
 *     - priceCents: precio en CENTAVOS. Regla simple: tomá el precio en
 *       pesos y multiplicalo por 100. Ejemplo: $8.900 -> 890000.
 *       Si el precio no tiene centavos (caso normal acá), siempre termina
 *       en "00".
 *     - images: array de rutas de fotos (mínimo 1). Las fotos van dentro de
 *       `public/images/menu/` y acá se referencian como
 *       "/images/menu/nombre-del-archivo.jpg".
 *
 * Si una hamburguesa no tiene fotos reales todavía, dejá
 * "/images/burger-placeholder.svg" y reemplazalo cuando tengas las fotos.
 *
 * OJO: los precios de acá abajo están en 0 a propósito (PRECIO_PENDIENTE)
 * porque todavía no me pasaste los valores reales. Buscá "PRECIO_PENDIENTE"
 * y reemplazá el 0 por el precio en centavos de cada una antes de publicar.
 * Cada variante (Simple/Doble) puede tener su propio precio distinto.
 */

export type BurgerVariant = {
  id: string;
  label: string;
  layers: number;
  priceCents: number;
  images: string[];
};

export type Burger = {
  id: string;
  name: string;
  description: string;
  variants: BurgerVariant[];
};

export const burgers: Burger[] = [
  {
    id: "la-clasica",
    name: "La Clásica",
    description: "Carne jugosa, cebolla y nuestra salsa de la casa. Simple, directa y efectiva.",
    variants: [
      {
        id: "la-clasica-simple",
        label: "Simple",
        layers: 1,
        priceCents: 0, // PRECIO_PENDIENTE
        images: ["/images/burger-placeholder.svg","/images/burger-placeholder.svg"],
      },
    ],
  },
  {
    id: "la-picantona",
    name: "La Picantona",
    description: "Picantón, cebolla caramelizada y salsa de miel y mostaza con un toque picante.",
    variants: [
      {
        id: "la-picantona-simple",
        label: "Simple",
        layers: 1,
        priceCents: 0, // PRECIO_PENDIENTE
        images: ["/images/burger-placeholder.svg"],
      },
    ],
  },
  {
    id: "roast-beef-miel-mostaza",
    name: "Roast Beef Miel & Mostaza",
    description: "Roast beef, cheddar, cebolla caramelizada y salsa de miel y mostaza.",
    variants: [
      {
        id: "roast-beef-miel-mostaza-simple",
        label: "Simple",
        layers: 1,
        priceCents: 0, // PRECIO_PENDIENTE
        images: ["/images/burger-placeholder.svg"],
      },
    ],
  },
  {
    id: "roast-beef-de-la-casa",
    name: "Roast Beef de la Casa",
    description: "Roast beef, cheddar, cebolla caramelizada y nuestra salsa de la casa.",
    variants: [
      {
        id: "roast-beef-de-la-casa-simple",
        label: "Simple",
        layers: 1,
        priceCents: 0, // PRECIO_PENDIENTE
        images: ["/images/burger-placeholder.svg"],
      },
    ],
  },
  {
    id: "doble-bbq",
    name: "BBQ",
    description: "Ojo de bife, cebolla caramelizada, cheddar y salsa barbacoa ahumada.",
    variants: [
      {
        id: "doble-bbq-simple",
        label: "Simple",
        layers: 1,
        priceCents: 0, // PRECIO_PENDIENTE
        images: ["/images/burger-placeholder.svg"],
      },
      {
        id: "doble-bbq-doble",
        label: "Doble",
        layers: 2,
        priceCents: 0, // PRECIO_PENDIENTE
        images: ["/images/burger-placeholder.svg","/images/burger-placeholder.svg"],
      },
    ],
  },
  {
    id: "roast-beef-inglesa",
    name: "Roast Beef a la Inglesa",
    description: "Roast beef, cebolla en vinagre, salsa inglesa y cheddar.",
    variants: [
      {
        id: "roast-beef-inglesa-simple",
        label: "Simple",
        layers: 1,
        priceCents: 0, // PRECIO_PENDIENTE
        images: ["/images/burger-placeholder.svg"],
      },
    ],
  },
  {
    id: "la-full",
    name: "La Full",
    description: "Ojo de bife, cheddar y todas nuestras salsas juntas: la más completa de la casa.",
    variants: [
      {
        id: "la-full-simple",
        label: "Simple",
        layers: 1,
        priceCents: 0, // PRECIO_PENDIENTE
        images: ["/images/burger-placeholder.svg"],
      },
      {
        id: "la-full-doble",
        label: "Doble",
        layers: 2,
        priceCents: 0, // PRECIO_PENDIENTE
        images: ["/images/burger-placeholder.svg"],
      },
    ],
  },
  {
    id: "bife-bbq-mostaza",
    name: "Bife BBQ Mostaza",
    description: "Ojo de bife, cebolla cortada en cuadraditos, barbacoa, mostaza y cheddar.",
    variants: [
      {
        id: "bife-bbq-mostaza-simple",
        label: "Simple",
        layers: 1,
        priceCents: 0, // PRECIO_PENDIENTE
        images: ["/images/burger-placeholder.svg"],
      },
    ],
  },
];
