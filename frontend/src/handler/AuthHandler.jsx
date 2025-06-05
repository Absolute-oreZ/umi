import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useLocation, useNavigate } from "react-router-dom";
import LeftSideBar from "../components/common/LeftSideBar";
import {
  ProfilePageSkeleton,
  EditProfileSkeleton,
  EventsSkeleton,
  GroupsSkeleton,
  ResourcesSkeleton,
} from "../skeletons";
import FullScreenLoader from "../components/common/FullScreenLoader";
import { LandingPage } from "../routes";

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

const AuthHandler = ({ children }) => {
  const { initialized } = useKeycloak();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) return;

    // Clean up hash in URL after Keycloak redirects back
    if (location.hash.includes("state=")) {
      const path = location.pathname;
      setTimeout(() => {
        navigate(path, { replace: true });
      }, 100);
    }
  }, [initialized, location, navigate]);

  if (!initialized) {
    return (
      <div className="flex w-full h-screen">
        {getSkeletonByRoute(location.pathname)}
      </div>
    );
  }

  return children;
};

export default AuthHandler;
