import { useMutation, useQuery } from "@tanstack/react-query";
import GameService from "../services/GameService";
import { tenantId } from "../utils/configs";

const gameService = new GameService();

// Game lists rarely change — cache aggressively
const GAME_LIST_CACHE_CONFIG = {
  staleTime: 10 * 60 * 1000, // 10 minutes fresh
  gcTime: 60 * 60 * 1000,    // 1 hour in cache
  refetchOnMount: false,
  refetchOnWindowFocus: false,
};

// ── Spribe / Aviator ──────────────────────────────────────────

export function useGames() {
  const { data: games, isLoading, error } = useQuery({
    queryKey: ["games"],
    queryFn: gameService.getAllGames.bind(gameService),
    ...GAME_LIST_CACHE_CONFIG,
  });
  return { games, isLoading, error };
}

export function useGameSession() {
  const { mutate: launchGame, isPending: isLoading, error } = useMutation({
    mutationFn: gameService.generateGameSession.bind(gameService),
  });
  return { launchGame, isLoading, error };
}

// ── Imoon ─────────────────────────────────────────────────────

export function useImoonGames() {
  const { data: imoonGames, isLoading, error } = useQuery({
    queryKey: ["imoonGames"],
    queryFn: gameService.getAllImoonGames.bind(gameService),
    ...GAME_LIST_CACHE_CONFIG,
  });
  return { imoonGames, isLoading, error };
}

export function useLaunchImoonGame() {
  const { mutate: launchImoonGames, isPending: isLoading, error } = useMutation({
    mutationFn: gameService.launchImoonGame.bind(gameService),
  });
  return { launchImoonGames, isLoading, error };
}

// ── Turbo ─────────────────────────────────────────────────────

export function useGetTurboGames() {
  const { data: turboGames, isLoading, error } = useQuery({
    queryKey: ["turboGames"],
    queryFn: gameService.getTurboGames.bind(gameService),
    ...GAME_LIST_CACHE_CONFIG,
  });
  return { turboGames, isLoading, error };
}

export function useLaunchTurboGame() {
  const { mutate: launchTurbo, isPending: isLoading, error } = useMutation({
    mutationFn: gameService.launchTurboGame.bind(gameService),
  });
  return { launchTurbo, isLoading, error };
}

// ── Aviatrix ──────────────────────────────────────────────────

export function useLaunchAviatrix() {
  return useQuery({
    queryKey: ["aviatrixGame"],
    queryFn: () => gameService.launchAviatrix(),
  });
}

// ── Sports ────────────────────────────────────────────────────

export async function getSportGames() {
  const userId = gameService.userId;
  const API_URL = import.meta.env.VITE_API_URL;
  try {
    const response = await fetch(`${API_URL}/sports/launch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, tenantId }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error?.message || "Something went wrong");
  }
}

export function useSportGames() {
  const { mutate: launchSport, isPending: isLoading, error } = useMutation({
    mutationFn: getSportGames,
  });
  return { launchSport, isLoading, error };
}

// ── Analytics ─────────────────────────────────────────────────

export function useWagerLeaderboard() {
  const isAuth = gameService.isAuthenticated();
  const { data: leaderboard = [], isLoading, error } = useQuery({
    queryKey: ["wagerLeaderboard"],
    queryFn: gameService.getWagerLeaderboard.bind(gameService),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: isAuth,
  });
  return { leaderboard, isLoading, error };
}

export function useUserBetProfile(userId) {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["userBetProfile", userId],
    queryFn: () => gameService.getUserBetProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  return { profile, isLoading, error };
}

export function useTopGames() {
  const isAuth = gameService.isAuthenticated();
  const { data: topGames = [], isLoading, error } = useQuery({
    queryKey: ["topGames"],
    queryFn: gameService.getTopGames.bind(gameService),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: isAuth,
  });
  return { topGames, isLoading, error };
}
