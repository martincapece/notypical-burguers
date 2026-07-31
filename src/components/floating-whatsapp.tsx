"use client";

import { whatsappNumber } from "@/data/payment";

export function FloatingWhatsAppButton() {
  const whatsappMessage = encodeURIComponent(
    "¡Hola! Me gustaría realizar un pedido en NO TYPICAL"
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_40px_rgba(37,211,102,0.35)] transition-transform active:scale-95 hover:scale-110 hover:bg-[#1ebe57] md:bottom-6 md:right-6 md:h-16 md:w-16"
      aria-label="Abrir WhatsApp"
      title="Contactar por WhatsApp"
    >
      <svg
        className="h-7 w-7 md:h-8 md:w-8"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.77.463 3.5 1.344 5.03L2 22l5.116-1.34A9.96 9.96 0 0012.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.5a8.46 8.46 0 01-4.316-1.187l-.31-.183-3.207.84.856-3.12-.202-.32A8.47 8.47 0 013.504 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5zm4.638-6.368c-.254-.127-1.501-.741-1.734-.825-.233-.085-.402-.127-.572.127-.169.254-.656.825-.804.995-.148.17-.296.19-.55.064-.254-.127-1.073-.395-2.044-1.261-.756-.674-1.266-1.507-1.414-1.761-.148-.254-.016-.391.111-.518.114-.113.254-.296.381-.445.127-.148.169-.254.254-.423.085-.17.042-.318-.021-.445-.064-.127-.572-1.379-.784-1.888-.207-.497-.417-.43-.572-.437-.148-.007-.317-.008-.487-.008-.169 0-.444.063-.677.318-.233.254-.889.868-.889 2.117 0 1.25.91 2.457 1.037 2.627.127.169 1.792 2.736 4.342 3.837.607.262 1.081.419 1.451.536.609.194 1.163.166 1.601.101.489-.073 1.501-.614 1.712-1.207.212-.593.212-1.101.148-1.207-.063-.106-.232-.17-.487-.297z" />
      </svg>
    </a>
  );
}
