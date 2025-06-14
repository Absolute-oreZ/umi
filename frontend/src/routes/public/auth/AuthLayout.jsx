import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const AuthLayout = () => {
  const { session } = useAuth();
  return (
    <>
      {session ? (
        <Navigate to="/me" />
      ) : (
        <div className="flex">
          <section className="flex flex-1 justify-center items-center">
            <Outlet />
          </section>

          <img
            src="/images/auth-bg.jpg"
            alt="logo"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </div>
      )}
    </>
  );
};

export default AuthLayout;
