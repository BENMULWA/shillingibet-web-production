const DEVICE_ID_STORAGE_KEY = "shilingibet:device-id";

function createDeviceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const randomPart = Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${randomPart}`;
}

export function getDeviceId() {
  if (typeof window === "undefined") return null;

  try {
    const storedDeviceId = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (storedDeviceId) return storedDeviceId;

    const deviceId = createDeviceId();
    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    return deviceId;
  } catch {
    // Storage can be unavailable in privacy-restricted browsers. Keep requests
    // working, although the identifier will not persist in that environment.
    return createDeviceId();
  }
}

export function isMobilePaymentClient() {
  if (typeof window === "undefined") return false;

  const hasCoarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

  const mobileUserAgent =
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent || ""
    );

  return hasCoarsePointer || mobileUserAgent;
}
