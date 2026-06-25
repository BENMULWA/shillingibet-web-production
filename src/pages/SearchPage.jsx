import { useState, useMemo, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import SpribeBetsCard from "../components/SpribeBetsCard";
import { useGames, useGetTurboGames } from "../hooks/useGames";
import { MdOutlineSportsSoccer } from "react-icons/md";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { isGameProviderVisible } from "../config/gameVisibility";

export default function SearchPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(18);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setDisplayCount(12);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Providers
  const { games: spribeGames = [] } = useGames();
  const { turboGames = [] } = useGetTurboGames();
  const showTurboGames = isGameProviderVisible("turbo");
  const showImoonGames = isGameProviderVisible("imoon");

  // Merge games
  const allGames = useMemo(
    () => {
      const turboSpecific = showTurboGames ? turboGames.map(g => {
         const rawTitle = String(g.gameName || g.name || g.title || "").toLowerCase().replace(/\s/g, "");
         const alias = g.gameAlias || (rawTitle === "crashx" ? "crash" : rawTitle);
         return {
           title: g.gameName || g.name || g.title,
           src: g.image || g.icon || g.thumbnail || g.imgUrl,
           provider: "turbo",
           gameID: g._id || alias,
           gameName: g.gameName || g.name || g.title,
           linkPath: `/turbo/${alias}`
         };
      }) : [];

      return [
        { title: "Sports", provider: "sports" },
        ...spribeGames.map((g) => ({
          title: g?.title,
          src: g?.image,
          provider: "spribe",
          gameID: g?.gameId,
          gameName: g?.title,
        })),
        ...turboSpecific,
        {
          title: "Aviatrix",
          src: "/aviatrix.png",
          provider: "aviatrix",
          gameID: "aviatrix",
          gameName: "Aviatrix",
          linkPath: "/aviatrix"
        },
        ...(showImoonGames ? [{
          title: "Crash Royale",
          src: "/icons/airport.png",
          provider: "imoon",
          gameID: "imoon-1001",
          gameName: "Crash Royale",
          linkPath: "/imoon/1001"
        }] : [])
      ];
    },
    [spribeGames, turboGames, showTurboGames, showImoonGames]
  );

  // Partial search logic
  const norm = (s) => String(s || "").toLowerCase().trim();
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  const isSearching = tokens.length > 0;

  const filtered = useMemo(() => {
    if (!isSearching) return allGames;
    return allGames.filter((g) => {
      const title = norm(g.title);
      return tokens.every((t) => title.includes(t));
    });
  }, [allGames, tokens, isSearching]);

  const visible = isSearching ? filtered : filtered.slice(0, displayCount);

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + (isMobile ? 12 : 18));
  };

  const openGame = (game) => {
    if (game.linkPath) {
      navigate(game.linkPath);
    } else if (game.provider === "sports") {
      navigate(`/sports`);
    } else if (game.provider === "spribe") {
      navigate(`/aviator`);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-background py-4 flex flex-col gap-4">
        <h1 className="text-2xl font-black text-white px-2">Search Games</h1>
        <div className="relative w-full max-w-4xl px-2">
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-surface border-2 border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all shadow-xl"
            placeholder="Search titles, providers..."
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val) setDisplayCount(isMobile ? 12 : 18);
            }}
            autoFocus
          />
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 pb-10 mt-2 px-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 mb-8">
          {visible.length > 0 ? (
            visible.map((game, idx) => (
              <div
                key={`${game.provider}-${game.gameID || idx}`}
                onClick={() => openGame(game)}
                className="cursor-pointer group"
              >
                {game.provider === "sports" ? (
                  <div className="relative w-full rounded-xl overflow-hidden border border-white/5 bg-[#271f0d] transition-all duration-300 group-hover:scale-[1.03] flex flex-col shadow-lg">
                    <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-green-600 to-green-900 flex flex-col items-center justify-center">
                      <MdOutlineSportsSoccer className="text-white text-5xl mb-2 opacity-80" />
                    </div>
                    <div className="w-full py-2.5 px-2 bg-[#2a220e] flex items-center justify-center border-t border-[#463914]">
                      <span className="text-white text-xs md:text-sm font-bold tracking-wide truncate capitalize">
                        Sports
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="transition-transform duration-200">
                    <SpribeBetsCard
                      title={game.title}
                      gameName={game.gameName}
                      src={game.src}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <FiSearch size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">
                No games found for "{query}"
              </p>
              <button 
                onClick={() => setQuery("")}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Load More */}
        {!isSearching && filtered.length > displayCount && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 px-6 py-3 bg-surface border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              <FiChevronDown size={18} />
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
