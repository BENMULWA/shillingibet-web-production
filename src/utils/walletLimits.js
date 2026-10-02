// Fallback only — the live values come from GET /transactions/limits
// (see hooks/useWalletLimits.js) so the UI always matches the backend.
export const WALLET_LIMITS = Object.freeze({
  deposit: Object.freeze({ min: 1, max: 250_000 }),
  withdrawal: Object.freeze({ min: 100, max: 15_000, dailyLimit: 1_000 }),
});
