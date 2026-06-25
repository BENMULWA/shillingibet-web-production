import { useMemo, useEffect, useState } from "react";
import { FaFire } from "react-icons/fa6";
import { BsTrophyFill } from "react-icons/bs";
import { Link } from "react-router-dom";

import Banner from "../components/Banner";
import CategoryHeader from "../components/CategoryHeader";
import LeaderboardSection from "../components/LeaderboardSection";
import Footer from "../components/Footer";
import SpribeBetsCard from "../components/SpribeBetsCard";
import GameCategoryTabs from "../components/GameCategoryTabs";
import { useGames, useGetTurboGames, useImoonGames } from "../hooks/useGames";
import { isGameProviderVisible } from "../config/gameVisibility";

//  Media Query Hook

function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

function Homepage({ chatOpen }) {
  const { games: spribeGames = [] } = useGames();
  const { turboGames = [] } = useGetTurboGames();
  const { imoonGames = [] } = useImoonGames();

  const isMobile = useMediaQuery("(max-width: 767px)");
  const limit = isMobile ? 6 : 12;
  const showTurboGames = isGameProviderVisible("turbo");
  const showImoonGames = isGameProviderVisible("imoon");

  const [gamesPage, setGamesPage] = useState(0);

  useEffect(() => {
    setGamesPage(0);
  }, [limit]);

  //  Pagination helpers (CIRCULAR)

  const getMaxPage = (total) => Math.max(0, Math.ceil(total / limit) - 1);

  const nextPage = (page, total) => (page >= getMaxPage(total) ? 0 : page + 1);

  const prevPage = (page, total) => (page <= 0 ? getMaxPage(total) : page - 1);

  const paginate = (arr, page) => arr.slice(page * limit, page * limit + limit);

  const getGameLabel = (game) =>
    String(game?.gameName || game?.name || game?.title || game?.game || "");

  const getGameImage = (game, fallback) =>
    game?.image || game?.icon || game?.thumbnail || game?.imgUrl || game?.src || fallback;

  const uniqueByPath = (games) => {
    const seen = new Set();
    return games.filter((game) => {
      const key = game.linkPath || `${game.__provider}-${game.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  //  All Spribe games + Specific Turbo Games (Crash X, Aero) + Aviatrix
  const allSpribeGames = useMemo(() => {
    let games = spribeGames.map((g) => ({ ...g, __provider: "spribe", linkPath: `/${g.title?.toLowerCase()}` }));
    
    // Inject Crash X and Aero from turbo games
    const specificTurbo = showTurboGames ? turboGames.filter(g => {
       const titleStr = String(g.gameName || g.name || g.title || "").toLowerCase().replace(/\s/g, "");
       return titleStr === "crashx" || titleStr === "aero";
    }).map(g => {
       const rawTitle = String(g.gameName || g.name || g.title || "").toLowerCase().replace(/\s/g, "");
       const alias = g.gameAlias || (rawTitle === "crashx" ? "crash" : rawTitle);
       return {
         ...g,
         title: g.gameName || g.name || g.title,
         image: g.image || g.icon || g.thumbnail || g.imgUrl,
         __provider: "turbo",
         gameAlias: alias,
         linkPath: `/turbo/${alias}`
       };
    }) : [];

    // Manually inject Aviatrix
    const aviatrixGame = {
      _id: "aviatrix-manual-id",
      title: "Aviatrix",
      image: "/aviatrix.png",
      __provider: "aviatrix",
      linkPath: "/aviatrix"
    };

    // Manually inject Crash Royale
    const crashRoyaleGame = {
      _id: "imoon-1001",
      title: "Crash Royale",
      image: "/icons/airport.png", 
      __provider: "imoon",
      linkPath: "/imoon/1001"
    };

    // Manually inject Sports
    const sportsGame = {
      _id: "sports-manual",
      title: "Sports",
      image: "/icons/football copy.png",
      __provider: "sports",
      linkPath: "/sports"
    };

    games = [
      ...games,
      ...specificTurbo,
      aviatrixGame,
      ...(showImoonGames ? [crashRoyaleGame] : []),
      sportsGame,
    ];

    // Sort to put Aviator first
    return games.sort((a, b) => {
      const aIsAviator = a.title?.toLowerCase() === "aviator";
      const bIsAviator = b.title?.toLowerCase() === "aviator";
      if (aIsAviator && !bIsAviator) return -1;
      if (!aIsAviator && bIsAviator) return 1;
      return 0;
    });
  }, [spribeGames, turboGames, showTurboGames, showImoonGames]);

  const crashXGames = useMemo(() => {
    if (!showTurboGames) return [];

    const fallback = [
      { _id: "turbo-crash", title: "Crash X", image: "/icons/rocket.png", __provider: "turbo", linkPath: "/turbo/crash" },
      { _id: "turbo-crashfootball", title: "Crash Football", image: "/icons/football.png", __provider: "turbo", linkPath: "/turbo/crashfootball" },
      { _id: "turbo-aero", title: "Aero", image: "/icons/transport.png", __provider: "turbo", linkPath: "/turbo/aero" },
      { _id: "turbo-vortex", title: "Vortex", image: "/crash-games.svg", __provider: "turbo", linkPath: "/turbo/vortex" },
      { _id: "turbo-bookofmines", title: "Book of Mines", image: "/icons/casino.svg", __provider: "turbo", linkPath: "/turbo/bookofmines" },
      { _id: "turbo-crystalpoker", title: "Crystal Poker", image: "/casino.svg", __provider: "turbo", linkPath: "/turbo/crystalpoker" },
      { _id: "turbo-ringsofolympus", title: "Rings of Olympus", image: "/slots.svg", __provider: "turbo", linkPath: "/turbo/ringsofolympus" },
      { _id: "turbo-catanza", title: "Catanza", image: "/slots.webp", __provider: "turbo", linkPath: "/turbo/catanza" },
      { _id: "turbo-goalpenalty", title: "Goal Penalty", image: "/icons/football-award.png", __provider: "turbo", linkPath: "/turbo/goalpenalty" },
      { _id: "turbo-hotdice", title: "Hot Dice", image: "/icons/badge.png", __provider: "turbo", linkPath: "/turbo/hotdice" },
      { _id: "turbo-fireball", title: "Fireball", image: "/icons/rocket.png", __provider: "turbo", linkPath: "/turbo/fireball" },
      { _id: "turbo-luckyjet", title: "Lucky Jet", image: "/icons/flight.png", __provider: "turbo", linkPath: "/turbo/luckyjet" },
    ];

    const wanted = new Set([
      "crash",
      "crashx",
      "crashfootball",
      "aero",
      "vortex",
      "bookofmines",
      "crystalpoker",
      "ringsofolympus",
      "catanza",
      "goalpenalty",
      "hotdice",
      "fireball",
      "luckyjet",
    ]);
    const apiGames = turboGames
      .map((game) => {
        const label = getGameLabel(game);
        const normalized = label.toLowerCase().replace(/\s/g, "");
        const alias = game.gameAlias || (normalized === "crashx" ? "crash" : normalized);

        return {
          ...game,
          title: label || alias,
          image: getGameImage(game, alias === "aero" ? "/icons/transport.png" : "/icons/rocket.png"),
          __provider: "turbo",
          gameAlias: alias,
          linkPath: `/turbo/${alias}`,
          normalized,
        };
      })
      .filter((game) => wanted.has(game.normalized) || wanted.has(game.gameAlias));

    return uniqueByPath([...apiGames, ...fallback]).slice(0, limit);
  }, [turboGames, limit, showTurboGames]);

  const crashRoyaleGames = useMemo(() => {
    if (!showImoonGames) return [];

    const fallback = [
      { _id: "imoon-1001", title: "Crash Royale", image: "/icons/airport.png", __provider: "imoon", linkPath: "/imoon/1001" },
      { _id: "imoon-1917", title: "Crash 1917", image: "/icons/flight.png", __provider: "imoon", linkPath: "/imoon/1010:1917" },
      { _id: "imoon-5014", title: "City Wheel", image: "/virtuals.png", __provider: "imoon", linkPath: "/imoon/5014" },
      { _id: "imoon-3dx", title: "Crash 3DX", image: "/crash-games.svg", __provider: "imoon", linkPath: "/imoon/1010:3dx" },
      { _id: "imoon-ghostly", title: "Ghostly Crash", image: "/casino.svg", __provider: "imoon", linkPath: "/imoon/1010:ghostly" },
      { _id: "imoon-dragonflare", title: "Dragon Flare", image: "/slots.svg", __provider: "imoon", linkPath: "/imoon/1010:dragonflare" },
      { _id: "imoon-dice", title: "Dice", image: "/icons/casino.svg", __provider: "imoon", linkPath: "/imoon/5002" },
      { _id: "imoon-limbo", title: "Limbo", image: "/icons/rocket.png", __provider: "imoon", linkPath: "/imoon/5008" },
      { _id: "imoon-mines", title: "Mines", image: "/slots.webp", __provider: "imoon", linkPath: "/imoon/2005" },
      { _id: "imoon-bloodburst", title: "Blood Burst", image: "/casino.svg", __provider: "imoon", linkPath: "/imoon/1010:bloodburst" },
      { _id: "imoon-minesrush", title: "Mines Rush", image: "/icons/casino.svg", __provider: "imoon", linkPath: "/imoon/2005" },
    ];

    const wanted = new Set([
      "1001",
      "1010:1917",
      "5014",
      "1010:3dx",
      "1010",
      "1010:ghostly",
      "1010:dragonflare",
      "1010:bloodburst",
      "5002",
      "5008",
      "2005",
    ]);
    const apiGames = imoonGames
      .map((game) => {
        const label = getGameLabel(game);
        const gameId = String(game.gameID || game.gameId || game._id || game.id || label || "").toLowerCase();
        const normalized = label.toLowerCase().replace(/\s/g, "");
        const routeId = game.gameID || game.gameId || game._id || game.id || label;

        return {
          ...game,
          title: label || routeId,
          image: getGameImage(game, "/icons/airport.png"),
          __provider: "imoon",
          linkPath: `/imoon/${routeId}`,
          gameId,
          normalized,
        };
      })
      .filter((game) => wanted.has(game.gameId) || wanted.has(game.normalized));

    return uniqueByPath([...apiGames, ...fallback]).slice(0, limit);
  }, [imoonGames, limit, showImoonGames]);

  const gridClass = `
  grid gap-3 transition-all duration-300
  ${chatOpen ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3 md:grid-cols-6"}
`;
  const popularGridClass = `
  grid gap-3 transition-all duration-300
  ${chatOpen ? "grid-cols-2 md:grid-cols-3" : "grid-cols-3"}
  max-w-[820px] mx-auto
`;
  const visiblePopularGames = paginate(allSpribeGames, gamesPage);

  return (
    <div>
      {/* ================= BANNER ================= */}
      <div className="pt-2 px-2 md:px-4">
        <Banner />
      </div>

      {/* <GameCategories /> */}
      <GameCategoryTabs />

      {/* ================= JACKPOT CTA ================= */}
      {/*
      <section className="px-2 pt-4">
        <Link
          to="/jackpot"
          className="block rounded-3xl overflow-hidden border border-yellow-400/20 bg-gradient-to-r from-[#1d1602] via-[#2d2204] to-[#0f170c] shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between gap-4 p-4 md:p-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-yellow-400/15 flex items-center justify-center text-yellow-400 shrink-0">
                <BsTrophyFill className="text-2xl" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-yellow-300/70 font-bold">
                  Jackpot
                </p>
                <h2 className="text-white font-black text-lg md:text-xl truncate">
                  Predict 7 matches. Win the pool.
                </h2>
                <p className="text-[#9cae9f] text-sm mt-1 truncate">
                  View the active draw, place your picks, and check results in one place.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="text-[10px] uppercase tracking-widest text-[#75877a] font-semibold">
                New
              </span>
              <span className="text-black bg-primary hover:bg-yellow-400 transition-colors px-4 py-2 rounded-xl font-black text-sm">
                Play Now
              </span>
            </div>
          </div>
        </Link>
      </section>
      */}

      {/* ================= SPRIBE GAMES ================= */}
      <section className="px-2 pt-4">
        <CategoryHeader
          title="Most Popular"
          icon={FaFire}
          provider="popular"
          onPrev={() => setGamesPage((p) => prevPage(p, allSpribeGames.length))}
          onNext={() => setGamesPage((p) => nextPage(p, allSpribeGames.length))}
          viewAllState={{ title: "Most Popular", games: allSpribeGames }}
        />

        <div className={popularGridClass}>
          {visiblePopularGames.map((g, idx) => (
            <SpribeBetsCard
              key={idx}
              title={g.title}
              src={g.image}
              gameID={g._id}
              linkToPath={g.linkPath}
            />
            
          ))}
        </div>
      </section>

      {/* ================= CRASH X COMMUNITY ================= */}
      {showTurboGames && (
        <section className="px-2 pt-4">
          <CategoryHeader
            title="Crash X Community"
            icon={FaFire}
            provider="turbo"
            showNav={false}
            viewAllState={{ title: "Crash X Community", games: crashXGames }}
          />

          <div className={gridClass}>
            {crashXGames.map((g, idx) => (
              <SpribeBetsCard
                key={`${g.__provider}-${g._id || g.title || idx}`}
                title={g.title}
                src={g.image}
                gameID={g._id}
                linkToPath={g.linkPath}
              />
            ))}
          </div>
        </section>
      )}

      {/* ================= CRASH ROYALE ================= */}
      {showImoonGames && (
        <section className="px-2 pt-4">
          <CategoryHeader
            title="Crash Royale"
            icon={FaFire}
            provider="imoon"
            showNav={false}
            viewAllState={{ title: "Crash Royale", games: crashRoyaleGames }}
          />

          <div className={gridClass}>
            {crashRoyaleGames.map((g, idx) => (
              <SpribeBetsCard
                key={`${g.__provider}-${g._id || g.title || idx}`}
                title={g.title}
                src={g.image}
                gameID={g._id}
                linkToPath={g.linkPath}
              />
            ))}
          </div>
        </section>
      )}

      {/* ================= LEADERBOARD ================= */}
      <LeaderboardSection />

      <Footer />
    </div>
  );
}

export default Homepage;
