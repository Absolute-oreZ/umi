import { Outlet } from "react-router-dom";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

const OnlineOnlyRoute = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gray-50">
      <img
        src="/images/offline.png"
        alt="Offline"
        className="w-64 max-w-full mb-6"
      />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        You're offline
      </h2>
      <p className="text-gray-500">
        Please check your internet connection to continue.
      </p>
    </div>
  );
};

export default OnlineOnlyRoute;
