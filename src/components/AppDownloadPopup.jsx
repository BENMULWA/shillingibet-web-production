import { FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { usePwaInstall } from "../hooks/usePwaInstall";

export default function AppDownloadPopup({ isOpen, onClose }) {
  const [isMobile, setIsMobile] = useState(false);
  const { installed, install } = usePwaInstall();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Only show on mobile
  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) {
      onClose();
      return;
    }

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    toast(isIos
      ? "To install: tap Share, then Add to Home Screen."
      : "Open your browser menu and choose Install app or Add to Home screen."
    );
  };

  if (!isOpen || !isMobile || installed) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 z-40 transition-opacity duration-500 opacity-100"
        onClick={onClose}
      />
      {/* Bottom Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] translate-y-0 opacity-100">
        <div className="relative bg-surface text-[#d7e1d9] rounded-t-3xl p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] w-full max-w-md mx-auto transform transition-all duration-700 scale-100">
          {/* Subtle glowing top border */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#f9ce36] to-transparent" />

          {/* Handle bar */}
          <div className="w-14 h-1.5 bg-background/50 rounded-full mx-auto mb-5" />

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-center text-[#d7e1d9]">
            Get the ShilingiBet App
          </h2>
          <p className="text-sm text-[#aab8ad] text-center mb-6">
            Install it on your home screen for quick access.
          </p>

          {/* Android Icon */}
          <img
            src="/app-1.png"
            alt="Android"
            className="w-16 h-16 mx-auto mb-6 animate-bounce"
          />

          {/* Install button */}
          <button
            type="button"
            onClick={handleInstall}
            className="block w-full bg-[#f9ce36] text-black font-bold py-3 rounded-xl mb-5 transition-all duration-300 text-center cursor-pointer"
          >
            🚀 Install Now
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center mx-auto rounded-full bg-background/40 hover:bg-background/60 text-[#d7e1d9] transition-all"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
}
