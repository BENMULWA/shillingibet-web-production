export const gameProviderVisibility = {
  turbo: false,
  imoon: false,
};

export function isGameProviderVisible(provider) {
  const key = String(provider || "").toLowerCase();
  return gameProviderVisibility[key] ?? true;
}

export function isVisibleGameRoute(route) {
  const path = String(route || "").toLowerCase();

  if (!isGameProviderVisible("turbo") && path.includes("/turbo/")) {
    return false;
  }

  if (!isGameProviderVisible("imoon") && path.includes("/imoon/")) {
    return false;
  }

  return true;
}
