import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../../components/Loader";
import { useGameSession } from "../../hooks/useGames";

export default function GameLauncher({ game, gameUuid, title }) {
  const { launchGame, isLoading } = useGameSession();
  const [launchUrl, setLaunchUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLaunchUrl(null);
    setError(null);

    launchGame(
      { game, game_uuid: gameUuid },
      {
        onSuccess: (response) => setLaunchUrl(response.launchUrl),
        onError: (launchError) => {
          const message = launchError?.message || `Unable to launch ${title}`;
          setError(message);
          toast.error(message);
        },
      }
    );
  }, [game, gameUuid, launchGame, title]);

  if (isLoading && !launchUrl) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size={62} iconClass="text-primary" />
      </div>
    );
  }

  if (error || !launchUrl) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <p className="text-red-400">{error || `${title} is unavailable`}</p>
      </div>
    );
  }

  return (
    <iframe
      src={launchUrl}
      title={title}
      allow="fullscreen; autoplay"
      allowFullScreen
      className="h-[calc(100vh-80px)] w-full border-none"
    />
  );
}
