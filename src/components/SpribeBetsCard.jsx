import { memo } from "react";
import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import BaseClass from "../services/BaseClass";

const SpribeBetsCard = memo(function SpribeBetsCard({ src, title, gameName, linkToPath }) {
  const baseClass = new BaseClass();
  const game = gameName || title?.toLowerCase();
  const linkTo = baseClass.userId ? (linkToPath || `/${game}`) : `/login`;

  return (
    <Link to={linkTo} className="block w-full">
      <div className="group relative flex w-full min-w-0 flex-col overflow-hidden rounded-[4px] border border-[#9b7c25] bg-[#271f0d] shadow-lg transition-all duration-300 hover:scale-[1.02]">
        {/* Image Section */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
          <img
            src={src}
            alt={title || game}
            loading="lazy"
            className="block h-full w-full object-contain transition-all duration-300"
          />
          {/* Default Dark Overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-300"></div>
          
          {/* Play Icon Container (shows on hover) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)]">
               <FaPlay className="text-white text-xl md:text-2xl ml-1 shadow-black/50" />
            </div>
          </div>
        </div>
        
        {/* Title Section */}
        <div className="w-full py-2.5 px-2 bg-[#2a220e] flex items-center justify-center border-t border-[#463914]">
          <span className="text-white text-xs md:text-sm font-bold tracking-wide truncate capitalize">
            {title || gameName}
          </span>
        </div>
      </div>
    </Link>
  );
});

export default SpribeBetsCard;
