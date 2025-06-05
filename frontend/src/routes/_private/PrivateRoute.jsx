import { Navigate, Outlet } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect } from "react";
import { setupAxiosInterceptors } from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute = () => {
  const { keycloak } = useKeycloak();
  const { setUser, setIsFetchingUserData, fetchUser } = useAuth();

  useEffect(() => {
    const run = async () => {
      if (keycloak.authenticated) {
        setupAxiosInterceptors(keycloak.token);
        await fetchUser();
      } else {
        setUser(null);
        setIsFetchingUserData(false);
      }
    };

    run();
  }, [keycloak.authenticated, keycloak.token]);

  if (!keycloak.authenticated) {
    setUser(null);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
