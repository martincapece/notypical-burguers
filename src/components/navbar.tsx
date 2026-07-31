"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-brand/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 md:px-8 md:py-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground md:text-3xl">NO</span>
            <span className="text-lg font-bold text-brand md:text-3xl">TYPICAL</span>
          </div>
        </Link>

        {/* Menu */}
        <ul className="flex items-center gap-3 md:gap-8">
          <li>
            <Link
              href="/"
              className={`text-xs font-semibold transition-colors md:text-sm ${
                isActive("/")
                  ? "text-brand"
                  : "text-foreground hover:text-brand-soft"
              }`}
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link
              href="/#menu"
              className="wn-btn wn-btn-secondary whitespace-nowrap px-3! py-1.5! text-[11px] md:px-5! md:py-2! md:text-xs"
            >
              Ver Menú
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
