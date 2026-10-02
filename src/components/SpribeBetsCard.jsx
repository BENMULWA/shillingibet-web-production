import { memo } from "react";
import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import BaseClass from "../services/BaseClass";

const SpribeBetsCard = memo(function SpribeBetsCard({ src, title, gameName, linkToPath, badge }) {
  const baseClass = new BaseClass();
  const game = gameName || title?.toLowerCase();
  const linkTo = baseClass.userId ? (linkToPath || `/${game}`) : `/login`;
  const label = title || game;

  return (
    <Link
      to={linkTo}
      className="group block w-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Play ${label}`}
    >
      <div className="relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-surface shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/60 group-hover:shadow-[0_8px_24px_rgba(250,204,21,0.15)]">
        <div className="relative aspect-square w-full overflow-hidden bg-[#050806]">
          <img
            src={src}
            alt=""
            loading="lazy"
            className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {badge && (
            <span className="absolute left-1.5 top-1.5 rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow">
              {badge}
            </span>
          )}
          <div className="absolute inset-0 hidden items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
            <span className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-black uppercase text-black shadow-lg">
              <FaPlay aria-hidden="true" /> Play
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-1 px-2 py-1.5">
          <span className="truncate text-[11px] font-bold text-white/90 md:text-xs">{label}</span>
          <FaPlay className="shrink-0 text-[9px] text-primary md:hidden" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
});

export default SpribeBetsCard;
