import { useCallback, useEffect, useState } from "react";

let deferredInstallPrompt = null;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  window.dispatchEvent(new Event("pwa-install-available"));
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  window.dispatchEvent(new Event("pwa-installed"));
});

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(Boolean(deferredInstallPrompt));
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const handleAvailable = () => setCanInstall(true);
    const handleInstalled = () => {
      setCanInstall(false);
      setInstalled(true);
    };

    window.addEventListener("pwa-install-available", handleAvailable);
    window.addEventListener("pwa-installed", handleInstalled);
    return () => {
      window.removeEventListener("pwa-install-available", handleAvailable);
      window.removeEventListener("pwa-installed", handleInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredInstallPrompt) return false;

    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    setCanInstall(false);
    return outcome === "accepted";
  }, []);

  return { canInstall, installed, install };
}
