import { fetchAPI } from "../utils/FetchApi";
import BaseClass from "./BaseClass";
import { tenantId } from "../utils/configs";

const API_URL = import.meta.env.VITE_API_URL;

class GameService extends BaseClass {
  constructor() {
    super();
  }

  // ── Spribe (Aviator) ──────────────────────────────────────────
  async getAllGames() {
    try {
      const res = await fetchAPI("spribe/getGames", "GET");
      return res?.data;
    } catch (error) {
      throw new Error(error?.message || "Unable to fetch all games");
    }
  }

  async generateGameSession({ game, userId }) {
    try {
      return await fetchAPI(
        "session/createGameSession",
        "POST",
        { userId, game },
        this.token
      );
    } catch (error) {
      throw new Error(error?.message || "Unable to launch game session");
    }
  }

  // ── Imoon ─────────────────────────────────────────────────────
  async getAllImoonGames() {
    try {
      const res = await fetchAPI("imoon/getGames", "GET");
      return res?.data;
    } catch (error) {
      throw new Error(error?.message || "Unable to fetch Imoon games");
    }
  }

  async launchImoonGame({ gameID }) {
    const userID =
      this.user?.userId ||
      this.user?.userID ||
      this.user?.id ||
      this.userId;
    if (!userID) throw new Error("User not authenticated");

    try {
      const res = await fetchAPI(
        "imoon/launchGame",
        "POST",
        { gameId: gameID, userID, tenantId },
        this.token
      );
      console.log("iMoon launch raw response:", res);
      return res;
    } catch (error) {
      throw new Error(error?.message || "Failed to launch Imoon game");
    }
  }

  // ── Turbo ─────────────────────────────────────────────────────
  async getTurboGames() {
    try {
      const res = await fetchAPI("turbo/getGames", "GET");
      return res?.data?.games;
    } catch (error) {
      throw new Error(error?.message || "Unable to fetch Turbo games");
    }
  }

  async launchTurboGame({ game }) {
    const userID =
      this.user?.userId ||
      this.user?.userID ||
      this.user?.id ||
      this.userId;
    try {
      const res = await fetchAPI(
        "turbo/launch",
        "POST",
        { game, tenantId, userId: userID },
        this.token
      );
      console.log("Turbo launch raw response:", res);
      return res;
    } catch (error) {
      throw new Error(error?.message || "Failed to launch Turbo game");
    }
  }

  // ── Aviatrix ──────────────────────────────────────────────────
  async launchAviatrix() {
    try {
      const res = await fetchAPI("aviatrix/game/url", "GET", null, this.token);
      return res;
    } catch (error) {
      throw new Error(error?.message || "Failed to launch Aviatrix game");
    }
  }

  // ── Sports ────────────────────────────────────────────────────
  async launchSportsbook() {
    try {
      const res = await fetch(`${API_URL}/sports/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: this.userId,
          tenantId,
        }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      throw new Error(error?.message || "Failed to launch Sportsbook");
    }
  }

  // ── Analytics ─────────────────────────────────────────────────
  async getWagerLeaderboard() {
    try {
      const res = await fetchAPI("analytics/getWagerLeaderboard", "GET", null, this.token);
      return res?.data || [];
    } catch (error) {
      throw new Error(error?.message || "Unable to fetch leaderboard");
    }
  }

  async getUserBetProfile(userId) {
    try {
      const res = await fetchAPI(`analytics/getUserBetProfile?userId=${userId}`, "GET", null, this.token);
      return res?.data || null;
    } catch (error) {
      throw new Error(error?.message || "Unable to fetch user bet profile");
    }
  }

  async getTopGames() {
    try {
      const res = await fetchAPI("analytics/getTopGames", "GET", null, this.token);
      return res?.data || [];
    } catch (error) {
      throw new Error(error?.message || "Unable to fetch top games");
    }
  }
}

export default GameService;
