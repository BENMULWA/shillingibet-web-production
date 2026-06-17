import Loader from "../../components/Loader";
import { useLaunchAviatrix } from "../../hooks/useGames";
function LaunchAviatrix() {
  // ✅ fix: use data instead of launchAviatrix
  const { data, isLoading, error } = useLaunchAviatrix();

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader size={62} iconClass="text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Failed to launch Aviatrix game
      </div>
    );
  }

  const gameUrl = data?.url;

  if (!gameUrl) {
    return (
      <div className="h-screen flex items-center justify-center text-yellow-500">
        Game URL not found
      </div>
    );
  }

  return (
    <>
      <iframe
        src={gameUrl}
        className="w-full h-screen border-none h-[100dvh]"
        title="Aviatrix Game"
        allowFullScreen
      />
    </>
  );
}

export default LaunchAviatrix;
