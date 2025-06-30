import { Link, useLocation } from "react-router-dom";
import { MdGroups, MdEvent, MdLogout } from "react-icons/md";
import { FaFileArchive } from "react-icons/fa";
import { GiPlagueDoctorProfile } from "react-icons/gi";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  {
    to: "/groups",
    icon: <MdGroups />,
    tooltip: "Groups",
  },
  {
    to: "/events",
    icon: <MdEvent />,
    tooltip: "Events",
  },
  {
    to: "/resources",
    icon: <FaFileArchive />,
    tooltip: "Resources",
  },
  {
    to: "/me",
    icon: <GiPlagueDoctorProfile />,
    tooltip: "My Profile",
  },
];

const LeftSideBar = () => {
  const location = useLocation();

  const {signOut} = useAuth();

  return (
    <div className="h-screen w-[70px] bg-gray-900 flex flex-col justify-between items-center py-10 shadow-md">
      <div className="flex flex-col gap-6">
        {navLinks.map(({ to, icon, tooltip }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`group relative flex items-center justify-center p-3 rounded-md transition ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-500"
              }`}
              aria-label={tooltip}
            >
              <div className="text-xl">{icon}</div>
              <span className="pointer-events-none absolute left-16 z-10 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                {tooltip}
              </span>
            </Link>
          );
        })}
      </div>

      <button
        onClick={signOut}
        className="group relative flex items-center justify-center p-3 rounded-md text-gray-400 hover:bg-red-600 hover:text-white transition"
        aria-label="Logout"
      >
        <MdLogout className="text-xl" />
        <span className="absolute left-16 z-10 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
          Logout
        </span>
      </button>
    </div>
  );
};

export default LeftSideBar;
