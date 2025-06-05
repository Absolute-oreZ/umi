import { useContext, createContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isFetchingUserData, setIsFetchingUserData] = useState(true);

  const fetchUser = async () => {
  try {
    setIsFetchingUserData(true);
    const response = await axiosInstance.get("/learners/profile");
    setUser(response.data);
  } catch (error) {
    console.error("Failed to fetch user data", error);
  } finally {
    setIsFetchingUserData(false);
  }
};

  return (
    <AuthContext.Provider value={{ user, setUser, isFetchingUserData, setIsFetchingUserData, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
