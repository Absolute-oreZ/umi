import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LeftSideBar from "../../components/common/LeftSideBar";
import {
  ProfilePageSkeleton,
  EditProfileSkeleton,
  EventsSkeleton,
  GroupsSkeleton,
  ResourcesSkeleton,
} from "../../skeletons";
import FullScreenLoader from "../../components/common/FullScreenLoader";
import LandingPage from "../public/LandingPage";

const withSidebar = (SkeletonComponent) => (
  <div className="flex w-screen h-screen overflow-hidden text-white">
    <LeftSideBar />
    <main className="flex-1 overflow-y-auto">
      <SkeletonComponent />
    </main>
  </div>
);

const getSkeletonByRoute = (pathname) => {
  if (pathname.includes("/me")) return withSidebar(ProfilePageSkeleton);
  if (pathname.includes("/edit-profile"))
    return withSidebar(EditProfileSkeleton);
  if (pathname.includes("/events")) return withSidebar(EventsSkeleton);
  if (pathname.includes("/groups")) return withSidebar(GroupsSkeleton);
  if (pathname.includes("/resources")) return withSidebar(ResourcesSkeleton);
  if (pathname === "/") return <LandingPage />;
  return <FullScreenLoader text="Loading..." />;
};

const PrivateRoute = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex w-full h-screen">
        {getSkeletonByRoute(location.pathname)}
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
