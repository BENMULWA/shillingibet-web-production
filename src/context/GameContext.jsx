import { createContext, useContext, useState, useEffect } from "react";

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [launchURL, setLaunchURLState] = useState("");
  const [sessionUserId, setSessionUserId] = useState(null);

  // Save URL + userId
  const setLaunchURL = (url, userId = null) => {
    setLaunchURLState(url);
    setSessionUserId(userId);
    if (url) {
      localStorage.setItem(
        "launchURL",
        JSON.stringify({ url, userId, savedAt: Date.now() })
      );
    } else {
      localStorage.removeItem("launchURL");
    }
  };

  // Reset on logout/login
  const resetGame = () => {
    setLaunchURLState("");
    setSessionUserId(null);
    localStorage.removeItem("launchURL");
  };

  // Restore on mount
  useEffect(() => {
    const saved = localStorage.getItem("launchURL");
    if (saved) {
      try {
        const { url, userId } = JSON.parse(saved);
        if (url) {
          setLaunchURLState(url);
          setSessionUserId(userId);
        }
      } catch {
        localStorage.removeItem("launchURL");
      }
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        launchURL,
        setLaunchURL,
        resetGame,
        sessionUserId,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return ctx;
};
