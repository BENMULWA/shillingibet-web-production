import { useLocation, useNavigate } from "react-router-dom";

import BaseClass from "../services/BaseClass";

const NAV_ITEMS = [
  { icon: "/icons/house.png", label: "Home", path: "/" },
  { icon: "/aviator.svg", label: "Aviator", path: "/aviator", auth: true },
  { icon: "/icons/add-payment.png", label: "Deposit", path: "/deposit", auth: true },
  { icon: "/icons/boy.png", label: "Profile", path: "/profile", auth: true },
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
    <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] md:hidden">
      <nav
        aria-label="Primary navigation"
        className="relative mx-auto flex h-[76px] max-w-lg items-stretch overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(145deg,rgba(16,25,19,0.98),rgba(5,9,7,0.99))] px-1 shadow-[0_-8px_35px_rgba(0,0,0,0.55),0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent" />

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavigation(item)}
              aria-current={active ? "page" : undefined}
              className="group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 outline-none"
            >
              {active && (
                <span className="absolute inset-x-2 inset-y-2 rounded-2xl border border-yellow-300/20 bg-gradient-to-b from-yellow-300/15 to-yellow-500/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_20px_rgba(250,204,21,0.08)]" />
              )}

              <span
                className={`relative flex h-9 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
                  active
                    ? "-translate-y-0.5 text-yellow-300 drop-shadow-[0_0_9px_rgba(250,204,21,0.5)]"
                    : "text-white/40 group-active:scale-90 group-active:text-white/70"
                }`}
              >
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className={`h-7 w-7 object-contain transition-all duration-300 ${
                    active ? "scale-110 saturate-125" : "opacity-55 saturate-50"
                  }`}
                />
                {active && (
                  <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-yellow-300 shadow-[0_0_8px_2px_rgba(250,204,21,0.55)]" />
                )}
              </span>

              <span
                className={`relative truncate text-[10px] font-extrabold tracking-wide transition-colors ${
                  active ? "text-yellow-300" : "text-white/40"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
