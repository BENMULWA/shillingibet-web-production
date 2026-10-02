import { useLocation, useNavigate } from "react-router-dom";
import { FiClock, FiGrid, FiHome, FiPlus, FiUser } from "react-icons/fi";

import BaseClass from "../services/BaseClass";

// Five-tab layout with a raised centre Deposit action, the pattern Kenyan
// players know from SportPesa/Odibets: browse on the left, money in the
// middle, account on the right.
const NAV_ITEMS = [
  { icon: FiHome, label: "Home", path: "/" },
  { icon: FiGrid, label: "Games", path: "/search" },
  { icon: FiPlus, label: "Deposit", path: "/deposit", auth: true, primary: true },
  { icon: FiClock, label: "My Bets", path: "/history", auth: true },
  { icon: FiUser, label: "Account", path: "/profile", auth: true },
];

export default function BottomNav({ closeAll, isSomethingOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const base = new BaseClass();

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const handleNavigation = (item) => {
    if (isSomethingOpen) {
      closeAll?.();
      return;
    }

    navigate(item.auth && !base.userId ? "/login" : item.path);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <nav
        aria-label="Primary navigation"
        className="relative mx-auto flex h-[64px] max-w-lg items-stretch border-t border-white/10 bg-[#07110b]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        style={{ height: "calc(64px + env(safe-area-inset-bottom))" }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          if (item.primary) {
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigation(item)}
                aria-current={active ? "page" : undefined}
                className="group relative flex min-w-0 flex-1 flex-col items-center justify-end gap-0.5 pb-2 outline-none"
              >
                <span className="absolute -top-5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#07110b] bg-primary text-black shadow-[0_6px_20px_rgba(250,204,21,0.45)] transition-transform group-active:scale-90">
                  <Icon size={26} strokeWidth={3} aria-hidden="true" />
                </span>
                <span className="text-[11px] font-extrabold text-primary">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavigation(item)}
              aria-current={active ? "page" : undefined}
              className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 outline-none transition-colors ${
                active ? "text-primary" : "text-white/60 active:text-white"
              }`}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
              )}
              <Icon size={21} aria-hidden="true" className="transition-transform group-active:scale-90" />
              <span className="truncate text-[11px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
