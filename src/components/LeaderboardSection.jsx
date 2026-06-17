import { FaTrophy, FaMedal, FaCrown } from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi2";
import { useWagerLeaderboard } from "../hooks/useGames";

function useIsLoggedIn() {
  const user = localStorage.getItem("user");
  return !!user;
}

const rankColors = {
  "Silver III": "bg-gradient-to-r from-slate-400 to-slate-300",
  "Silver II": "bg-gradient-to-r from-slate-300 to-slate-200",
  "Silver I": "bg-gradient-to-r from-slate-200 to-slate-100",
  Bronze: "bg-gradient-to-r from-amber-600 to-amber-500",
};

const positionStyles = {
  1: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/30",
  2: "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-black shadow-lg shadow-slate-400/30",
  3: "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/30",
};

const rowGlowStyles = {
  1: "bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10 border-l-2 border-yellow-500",
  2: "bg-gradient-to-r from-slate-400/10 via-transparent to-slate-400/10 border-l-2 border-slate-400",
  3: "bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 border-l-2 border-amber-500",
};

function maskPhone(phone) {
  if (!phone || phone.length < 6) return phone;
  return phone.slice(0, 4) + "***" + phone.slice(-3);
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-KE").format(amount);
}

function LeaderboardSection() {
  const isLoggedIn = useIsLoggedIn();
  const { leaderboard, isLoading } = useWagerLeaderboard();

  const top10 = leaderboard.slice(0, 10);

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <section id="top-wagerers" className="scroll-mt-24 px-2 pt-4 pb-2">
        <div className="flex items-center gap-2 px-1 pb-2">
          <div className="relative">
            <FaTrophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
            <HiSparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-yellow-300 animate-pulse" />
          </div>
          <h4 className="text-[#d7e1d9] md:text-base text-sm font-bold">
            Top Wagerers
          </h4>
        </div>
        <div className="bg-gradient-to-br from-[#2a2550] to-[#1e1a3a] rounded-xl p-3 border border-primary/20/50">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gradient-to-r from-[#163522]/50 to-[#214d32]/30 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="top-wagerers" className="scroll-mt-24 px-2 pt-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <FaTrophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
            <HiSparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-yellow-300 animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>
          <h4 className="text-[#d7e1d9] md:text-base text-sm font-bold tracking-wide">
            Top Wagerers
          </h4>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20/50">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          <span className="text-[9px] text-green-400 font-medium">LIVE</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#2a2550] to-[#1e1a3a] rounded-xl overflow-hidden border border-primary/20/50 shadow-lg shadow-purple-900/20">
        {/* Table Header */}
        <div className="grid grid-cols-[24px_1fr_auto_60px] md:grid-cols-[40px_1fr_1fr_70px_70px_90px] gap-1.5 px-2 md:px-3 py-1.5 bg-primary/10 text-[10px] md:text-xs text-[#9cae9f] font-semibold uppercase tracking-wider border-b border-primary/20/50">
          <div>#</div>
          <div>Player</div>
          <div className="text-right">Wagered</div>
          <div className="hidden md:block text-center">Bets</div>
          <div className="hidden md:block text-right">Avg</div>
          <div className="text-right">Rank</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-primary/10">
          {top10.map((player, index) => (
            <div
              key={player.userId}
              className={`
                grid grid-cols-[24px_1fr_auto_60px] md:grid-cols-[40px_1fr_1fr_70px_70px_90px]
                gap-1.5 px-2 md:px-3 py-1.5 md:py-2 items-center text-xs md:text-sm
                hover:bg-primary/10 transition-all duration-300
                animate-[fadeSlideIn_0.4s_ease-out_forwards] opacity-0
                ${rowGlowStyles[player.position] || ""}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Position */}
              <div className="flex items-center justify-center">
                {player.position === 1 ? (
                  <div className="relative">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full text-[10px] md:text-xs font-bold ${positionStyles[1]} animate-[glow_2s_ease-in-out_infinite]`}
                    >
                      {player.position}
                    </span>
                    <FaCrown className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 md:w-3 md:h-3 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.8)] animate-[bounce_2s_ease-in-out_infinite]" />
                  </div>
                ) : player.position <= 3 ? (
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full text-[10px] md:text-xs font-bold ${positionStyles[player.position]}`}
                  >
                    {player.position}
                  </span>
                ) : (
                  <span className="text-[#75877a] font-semibold text-xs md:text-sm">
                    {player.position}
                  </span>
                )}
              </div>

              {/* Player */}
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[9px] md:text-[10px] font-bold shadow ${player.position <= 3 ? 'ring-1 ring-offset-1 ring-offset-[#1e1a3a]' : ''} ${player.position === 1 ? 'ring-yellow-400' : player.position === 2 ? 'ring-slate-400' : player.position === 3 ? 'ring-amber-500' : ''}`}>
                  {player.phone?.slice(0, 2) || "??"}
                </div>
                <span className="text-[#d7e1d9] font-medium truncate text-[11px] md:text-xs">
                  {maskPhone(player.phone)}
                </span>
              </div>

              {/* Wagered */}
              <div className="text-right">
                <span className={`font-bold text-[11px] md:text-xs ${player.position === 1 ? 'text-yellow-400' : player.position <= 3 ? 'text-green-400' : 'text-green-500'}`}>
                  {formatAmount(player.totalWagered)}
                </span>
              </div>

              {/* Bets */}
              <div className="hidden md:block text-center text-[#aab8ad] font-medium text-xs">
                {formatAmount(player.totalBets)}
              </div>

              {/* Avg Wager */}
              <div className="hidden md:block text-right text-[#aab8ad] font-medium text-xs">
                {formatAmount(player.avgWager)}
              </div>

              {/* Rank */}
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-semibold ${
                    rankColors[player.rank] || "bg-gradient-to-r from-[#163522] to-[#214d32]"
                  } text-gray-800 shadow-sm`}
                >
                  <FaMedal className="w-2 h-2 md:w-2.5 md:h-2.5" />
                  <span className="hidden sm:inline">{player.rank}</span>
                  <span className="sm:hidden">{player.rank?.split(" ")[0]}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {leaderboard.length > 10 && (
          <div className="px-3 py-1.5 bg-gradient-to-r from-[#163522]/20 via-[#214d32]/40 to-[#163522]/20 text-center border-t border-primary/20">
            <span className="text-[10px] text-[#9cae9f] font-medium">
              Showing top 10 of {leaderboard.length} players
            </span>
          </div>
        )}
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(234, 179, 8, 0.5), 0 0 10px rgba(234, 179, 8, 0.3);
          }
          50% {
            box-shadow: 0 0 15px rgba(234, 179, 8, 0.8), 0 0 25px rgba(234, 179, 8, 0.5);
          }
        }
      `}</style>
    </section>
  );
}

export default LeaderboardSection;
