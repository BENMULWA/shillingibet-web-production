import { FaWhatsapp } from "react-icons/fa";

import { buildSupportWhatsAppUrl } from "../utils/supportContact";

// Floating WhatsApp support shortcut, stacked just above the support-chat button
// (.support-fab sits at bottom: 5rem; right: 1rem; 3.5rem tall).
export default function WhatsAppButton() {
  return (
    <a
      href={buildSupportWhatsAppUrl()}
      // Rebuild at click time so the message carries the account that is logged in now.
      onClick={(event) => { event.currentTarget.href = buildSupportWhatsAppUrl(); }}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with ShilingiBet support on WhatsApp"
      className="group fixed right-4 bottom-[calc(9.25rem+env(safe-area-inset-bottom))] z-[2090] flex h-14 w-14 items-center justify-center md:bottom-[9.25rem]"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[#25D366]/60 motion-safe:animate-ping [animation-duration:2.4s]"
      />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2BE070] to-[#128C7E] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] ring-2 ring-white/20 transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
        <FaWhatsapp size={30} aria-hidden="true" />
      </span>
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-[#07110b] px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-200 group-hover:opacity-100 md:block">
        Chat on WhatsApp
      </span>
    </a>
  );
}
