import { fetchAPI } from "../utils/FetchApi";
import BaseClass from "./BaseClass";
import { normalizeGameName } from "../features/games/virtualGameCatalog";

class GameService extends BaseClass {
  async getAllGames() {
    try {
      // The game catalog is public. Authentication is only required when a
      // player requests a launch session.
      const res = await fetchAPI("virtuals/games", "GET");
      const games = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(games?.data) ? games.data : games;

      return (Array.isArray(list) ? list : [])
        .filter((game) => Number(game?.status) === 1)
        .map((game) => {
          const gameUuid =
            game.game_uuid ?? game.game_uid ?? game.uuid ?? game.uid ?? game._id;

          return {
            ...game,
            game_uuid: gameUuid,
            _id: gameUuid,
            title: game.game_name,
            image: game.thumbnail,
            linkPath: gameUuid
              ? `/virtual/${gameUuid}`
              : `/virtual/name/${normalizeGameName(game.game_name).replace(/\s+/g, "-")}`,
          };
        });
    } catch (error) {
      throw new Error(error?.message || "Unable to fetch all games");
    }
  }

  async generateGameSession({ game_uuid: gameUuid, game }) {
    try {
      let resolvedUuid = gameUuid;

      // Keep the existing /aviator entry working while using the new catalog.
      if (!resolvedUuid && game) {
        const requestedGame = normalizeGameName(game);
        const games = await this.getAllGames();
        resolvedUuid = games.find(
          (item) =>
            normalizeGameName(item.game_name) === requestedGame
        )?.game_uuid;
      }

      if (!resolvedUuid) throw new Error("Game is unavailable");

      const res = await fetchAPI(
        "virtuals/launch",
        "POST",
        { game_uuid: resolvedUuid },
        this.token
      );

      const url = res?.data?.url ?? res?.url;
      if (!url) throw new Error(res?.status_description || "Launch URL missing");

      return { ...res, launchUrl: url };
    } catch (error) {
      throw new Error(error?.message || "Unable to launch game session");
    }
  }
}

export default GameService;
