import { useEffect, useState } from "react";
import { useSportGames } from "../../hooks/useGames";
import Loader from "../../components/Loader";
import DepositHeader from "../../features/payment/DepositHeader";

function LaunchSports() {
  const [launchURL, setLaunchURL] = useState("");
  const { launchSport, isLoading } = useSportGames();

  useEffect(() => {
    if (!launchURL) {
      launchSport(null, {
        onSuccess: (data) => {
          const url = data?.data?.url;
          if (url) {
            setLaunchURL(url);
          }
        },
        onError: (err) => console.error("Sports launch failed:", err),
      });
    }
  }, [launchSport, launchURL]);

  if (isLoading || !launchURL) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader size={65} />
      </div>
    );
  }

  return (
    <>
      <DepositHeader />
      <iframe
        src={launchURL}
        title="Sportsbook"
        allowFullScreen
        className="w-full h-[calc(100dvh-48px)] lg:h-[calc(100vh-3rem)] border-none"
      />
    </>
  );
}

export default LaunchSports;
