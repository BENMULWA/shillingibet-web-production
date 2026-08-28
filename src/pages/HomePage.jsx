import { FaFire, FaGamepad, FaPlane, FaTrophy } from "react-icons/fa6";

import Banner from "../components/Banner";
import CategoryHeader from "../components/CategoryHeader";
import Footer from "../components/Footer";
import GameCategoryTabs from "../components/GameCategoryTabs";
import SpribeBetsCard from "../components/SpribeBetsCard";
import { categorizeGames } from "../features/games/virtualGameCatalog";
import { useGames } from "../hooks/useGames";

export default function HomePage() {
  const { games = [] } = useGames();
  const { mostPopular, crashGames, virtualGames, others } =
    categorizeGames(games);
  const categories = [
    { title: "Most Popular", icon: FaFire, games: mostPopular },
    { title: "Crash Games", icon: FaPlane, games: crashGames },
    { title: "Virtual Games", icon: FaTrophy, games: virtualGames },
    { title: "Others", icon: FaGamepad, games: others },
  ];

  return (
    <div>
      <div className="pt-2 md:px-4">
        <Banner />
      </div>

      <GameCategoryTabs games={mostPopular} />

      {categories.map((category) =>
        category.games.length ? (
          <section key={category.title} className="pt-4 md:px-2">
            <CategoryHeader
              title={category.title}
              icon={category.icon}
              showNav={false}
            />

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
              {category.games.map((game) => (
                <SpribeBetsCard
                  key={game.game_uuid || game._id}
                  title={game.game_name || game.title}
                  src={game.thumbnail || game.image}
                  gameID={game.game_uuid || game._id}
                  linkToPath={game.linkPath}
                />
              ))}
            </div>
          </section>
        ) : null
      )}

      <Footer />
    </div>
  );
}
