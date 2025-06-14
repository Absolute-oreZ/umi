import { Outlet } from "react-router-dom";
import LeftSideBar from "../../../components/common/LeftSideBar";

const RootLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden text-white">
      <LeftSideBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
