import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import { useLaunchTurboGame } from "../../hooks/useGames";

function LaunchTurboGame() {
  const { gameAlias } = useParams();

  const { launchTurbo, isLoading, error } = useLaunchTurboGame();

  const [launchURL, setLaunchURL] = useState(null);

  useEffect(() => {
    let hasLaunched = false;

    if (!hasLaunched) {
      const launchData = { game: gameAlias };
      launchTurbo(launchData, {
        onSuccess: (res) => {
          console.log("Turbo launch response:", res);
          const finalUrl = res?.url || res?.data?.url || res?.gameUrl || (typeof res?.data === "string" ? res.data : null);
          setLaunchURL(finalUrl);
        },
        onError: (err) => {
          console.error("Turbo launch error:", err);
        }
      });

      hasLaunched = true;
    }
  }, [gameAlias, launchTurbo]);

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader size={62} iconClass="text-primary" />
      </div>
    );
  }

  if (error) {
    return <div>Game Error</div>;
  }

  const launchUrl = launchURL;

  return (
    <>
      <iframe
        src={`${launchUrl}`}
        className="w-full h-screen border-none h-[100dvh]"
        title="Turbo "
      ></iframe>
    </>
  );
}

export default LaunchTurboGame;
