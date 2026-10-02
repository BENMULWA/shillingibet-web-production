import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFire, FaGamepad, FaPlane, FaTrophy } from "react-icons/fa6";
import { FiChevronRight, FiHeadphones, FiShield, FiZap } from "react-icons/fi";
import { MdOutlineSavings } from "react-icons/md";

import Banner from "../components/Banner";
import CategoryHeader from "../components/CategoryHeader";
import Footer from "../components/Footer";
import SpribeBetsCard from "../components/SpribeBetsCard";
import { categorizeGames } from "../features/games/virtualGameCatalog";
import { useGames } from "../hooks/useGames";

const TRUST_ITEMS = [
  { icon: FiZap, label: "Instant M-Pesa deposits" },
  { icon: MdOutlineSavings, label: "Daily cashback" },
  { icon: FiHeadphones, label: "24/7 live support" },
  { icon: FiShield, label: "18+ · Play responsibly" },
];

// Rows shown per category before "See all" — keeps the home page scannable.
const PREVIEW_COUNT = 12;

function GameSkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-2 px-1 sm:grid-cols-4 md:grid-cols-5 md:gap-3 xl:grid-cols-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="aspect-[5/6] animate-pulse rounded-xl bg-surface" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { games = [], isLoading } = useGames();
  const [activeKey, setActiveKey] = useState("all");
  const [expanded, setExpanded] = useState({});
  const { mostPopular, crashGames, virtualGames, others } =
    categorizeGames(games);
  const popularIds = new Set(mostPopular.map((game) => game.game_uuid || game._id));

  const categories = [
    { key: "popular", title: "Most Popular", icon: FaFire, games: mostPopular },
    { key: "crash", title: "Crash Games", icon: FaPlane, games: crashGames },
    { key: "virtual", title: "Virtual Sports", icon: FaTrophy, games: virtualGames },
    { key: "others", title: "More Games", icon: FaGamepad, games: others },
  ].filter((category) => category.games.length);

  const visibleCategories =
    activeKey === "all"
      ? categories
      : categories.filter((category) => category.key === activeKey);

  return (
    <div>
      <div className="px-2 pt-1 md:px-4">
        <Banner />
      </div>

      {/* Trust bar */}
      <ul className="no-scrollbar mx-2 mt-3 flex gap-2 overflow-x-auto md:mx-4 md:grid md:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <li
            key={item.label}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-white/5 bg-surface/80 px-3 py-2 text-[11px] font-bold text-white/80 md:justify-center md:text-xs"
          >
            <item.icon className="text-primary" size={15} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>

      {/* Category chips — sticky so players can switch while scrolling */}
      <nav
        aria-label="Game categories"
        className="no-scrollbar sticky top-0 z-20 mt-3 flex gap-2 overflow-x-auto bg-background/90 px-2 py-2 backdrop-blur md:px-4"
      >
        {[{ key: "all", title: "All Games", icon: FaGamepad }, ...categories].map(
          (chip) => {
            const { key, title } = chip;
            const active = activeKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveKey(key)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition-colors ${
                  active
                    ? "border-primary bg-primary text-black"
                    : "border-white/10 bg-surface text-white/75 hover:border-primary/50 hover:text-white"
                }`}
              >
                <chip.icon size={13} aria-hidden="true" />
                {title}
              </button>
            );
          }
        )}
      </nav>

      {isLoading && !games.length ? (
        <section className="pt-3 md:px-3">
          <GameSkeletonGrid />
        </section>
      ) : (
        visibleCategories.map((category) => {
          const showAll = activeKey !== "all" || expanded[category.key];
          const shown = showAll ? category.games : category.games.slice(0, PREVIEW_COUNT);
          const hiddenCount = category.games.length - shown.length;

          return (
            <section key={category.key} className="px-1 pt-4 md:px-3">
              <div className="flex items-center justify-between pr-1">
                <CategoryHeader title={category.title} icon={category.icon} showNav={false} />
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => ({ ...prev, [category.key]: true }))}
                    className="flex items-center gap-0.5 pb-2 text-xs font-bold text-primary hover:underline"
                  >
                    See all {category.games.length} <FiChevronRight aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 md:gap-3 xl:grid-cols-6">
                {shown.map((game) => {
                  const id = game.game_uuid || game._id;
                  return (
                    <SpribeBetsCard
                      key={id}
                      title={game.game_name || game.title}
                      src={game.thumbnail || game.image}
                      gameID={id}
                      linkToPath={game.linkPath}
                      badge={category.key !== "popular" && popularIds.has(id) ? "Hot" : undefined}
                    />
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {/* Promo strip */}
      <div className="mx-2 mt-6 grid gap-2 sm:grid-cols-2 md:mx-4">
        <Link
          to="/refer"
          className="flex items-center justify-between rounded-xl border border-primary/30 bg-[linear-gradient(120deg,rgba(250,204,21,0.18),rgba(0,200,83,0.08))] px-4 py-3"
        >
          <span>
            <span className="block text-sm font-black text-white">Refer &amp; Earn</span>
            <span className="block text-xs text-white/70">Invite friends and earn betting bonus</span>
          </span>
          <FiChevronRight className="text-primary" size={20} aria-hidden="true" />
        </Link>
        <Link
          to="/promotions/daily-cashback"
          className="flex items-center justify-between rounded-xl border border-accent/30 bg-[linear-gradient(120deg,rgba(0,200,83,0.18),rgba(250,204,21,0.06))] px-4 py-3"
        >
          <span>
            <span className="block text-sm font-black text-white">Daily Cashback</span>
            <span className="block text-xs text-white/70">Get a share of today&apos;s losses back</span>
          </span>
          <FiChevronRight className="text-accent" size={20} aria-hidden="true" />
        </Link>
      </div>

      <Footer />
    </div>
  );
}
