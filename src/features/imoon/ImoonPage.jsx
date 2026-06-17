import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../../components/Loader";
import { useLaunchImoonGame } from "../../hooks/useGames";

function ImoonPlayGame() {
  const [launchURL, setLaunchURL] = useState(null);
  const { gameID } = useParams();

  const navigate = useNavigate();

  const { launchImoonGames, isLoading } = useLaunchImoonGame();

  const hasLaunched = useRef(false);

  useEffect(() => {
    // if (hasLaunched.current) return;

    const data = { gameID };

    launchImoonGames(data, {
      onSuccess: (data) => {
        // Backend response shape varies between providers/environments.
        // Try the common locations where a launch URL might be returned.
        // Exhaustively search common URL field names across all nesting levels
        const url =
          data?.url ??
          data?.launchUrl ??
          data?.gameUrl ??
          data?.link ??
          data?.data?.url ??
          data?.data?.launchUrl ??
          data?.data?.gameUrl ??
          data?.data?.link ??
          data?.data?.data?.url ??
          data?.data?.data?.launchUrl ??
          null;
        if (!url) {
          // eslint-disable-next-line no-console
          console.error("iMoon launch response missing URL. Full response:", JSON.stringify(data));
          toast.error("Unable to launch iMoon game (missing URL)");
          setLaunchURL(null);
          return;
        }
        setLaunchURL(url);
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to launch iMoon game");
        setLaunchURL(null);
      },
    });

    hasLaunched.current = true;
  }, [gameID, launchImoonGames]);

  // Add message handler for iframe communication
  useEffect(() => {
    function handleiMoonMessages(message) {
      if (!message.data) return;
      const { action, payload } = message.data;
      switch (action) {
        case "HOME":
          handleHomeAction(payload);
          break;
        case "INSUFFICIENT_FUNDS":
          handleInsufficientFunds(payload);
          break;
      }
    }

    window.addEventListener("message", handleiMoonMessages);

    return () => {
      window.removeEventListener("message", handleiMoonMessages);
    };
  }, []);

  // Define action handlers
  // eslint-disable-next-line no-unused-vars
  function handleHomeAction(payload) {
    // window.location.href = "/";
    navigate("/");
  }

  // eslint-disable-next-line no-unused-vars
  function handleInsufficientFunds(payload) {
    toast.error("Insufficient funds top up to continue playing");
  }
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader size={62} iconClass="text-primary" />
      </div>
    );
  }

  if (!launchURL) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-3 text-white">
        <div>Game not launched.</div>
        <button
          className="px-4 py-2 rounded bg-primary text-black font-semibold"
          onClick={() => navigate("/")}
        >
          Back home
        </button>
      </div>
    );
  }
  return (
    <iframe
      className="w-full h-screen h-[100dvh] border-none"
      src={launchURL || undefined}
      title="Game"
    ></iframe>
  );
}

export default ImoonPlayGame;
