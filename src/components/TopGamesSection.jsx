import { FaGamepad, FaUsers, FaChartLine } from "react-icons/fa6";
import { useTopGames } from "../hooks/useGames";

function formatAmount(amount) {
  return new Intl.NumberFormat("en-KE").format(Math.round(amount));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}

const providerColors = {
  spribe_aviator: "from-red-500 to-orange-500",
  kagames: "from-purple-500 to-pink-500",
  imoon: "from-blue-500 to-cyan-500",
  bgaming: "from-green-500 to-emerald-500",
  Turbo: "from-yellow-500 to-amber-500",
  spribe_crypto: "from-indigo-500 to-violet-500",
};

function TopGamesSection() {
  const { topGames, isLoading } = useTopGames();

  const top8 = topGames.slice(0, 8);

  if (isLoading) {
    return (
      <section className="px-2 pt-4">
        <div className="flex items-center gap-2 px-1 pb-2">
          <FaGamepad className="h-4 w-4 md:h-5 md:w-5 text-[#b7c4ba]" />
          <h4 className="text-[#b7c4ba] md:text-md text-sm md:font-semibold font-semibold">
            Top Games
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-secondary rounded-xl p-4 animate-pulse h-32"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-2 pt-4">
      <div className="flex items-center gap-2 px-1 pb-2">
        <FaGamepad className="h-4 w-4 md:h-5 md:w-5 text-[#b7c4ba]" />
        <h4 className="text-[#b7c4ba] md:text-md text-sm md:font-semibold font-semibold">
          Top Games
        </h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {top8.map((game) => (
          <div
            key={`${game.provider}-${game.game}`}
            className="bg-secondary rounded-xl p-3 hover:bg-primary/10 transition-colors relative overflow-hidden"
          >
            {/* Rank badge */}
            <div
              className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-r ${
                providerColors[game.provider] || "from-gray-500 to-gray-400"
              } flex items-center justify-center text-xs font-bold text-white`}
            >
              {game.rank}
            </div>

            {/* Game name */}
            <h5 className="text-white font-semibold text-sm mb-1 pr-8 truncate capitalize">
              {game.game?.replace(/_/g, " ")}
            </h5>

            {/* Provider */}
            <p className="text-[#75877a] text-[10px] mb-3 truncate">
              {game.provider?.replace(/_/g, " ")}
            </p>

            {/* Stats */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#9cae9f]">
                  <FaChartLine className="w-3 h-3" />
                  <span className="text-[10px]">Wagered</span>
                </div>
                <span className="text-green-400 text-xs font-semibold">
                  KES {formatAmount(game.totalWagered)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#9cae9f]">
                  <FaUsers className="w-3 h-3" />
                  <span className="text-[10px]">Players</span>
                </div>
                <span className="text-white text-xs font-medium">
                  {game.uniquePlayers}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[#9cae9f]">
                  <span className="text-[10px]">Bets</span>
                </div>
                <span className="text-white text-xs font-medium">
                  {formatAmount(game.totalBets)}
                </span>
              </div>
            </div>

            {/* Last played */}
            <div className="mt-2 pt-2 border-t border-primary/20">
              <span className="text-[#6f7f73] text-[9px]">
                Last played: {formatDate(game.lastPlayed)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TopGamesSection;
