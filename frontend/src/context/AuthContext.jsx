import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken, customFetch } from "../api/fetchInstance";
import { supabase } from "../clients/supabaseClient";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [session, setSession] = useState(null);
  const [fetchingUserData, setfetchingUserData] = useState(false);
  const [loading, setloading] = useState(true);

  const signOutRef = useRef();

  const fetchUser = async () => {
    try {
      setfetchingUserData(true);
      const response = await customFetch("/users/profile");
      const userData = await response.json();

      const hasValidLearningPreference =
        userData.learningPreference?.country &&
        userData.learningPreference?.learningStyles?.length > 0;
      const hasUsername = Boolean(userData.username);
      const isOnProfileCompletionPage =
        location.pathname === "/profile-completion" ||
        location.pathname === "/edit-profile";

      if (!hasUsername || !hasValidLearningPreference) {
        if (!isOnProfileCompletionPage) {
          navigate("/profile-completion");
        }
      }

      setUser(userData);
    } catch (error) {
      console.log(error);
    } finally {
      setfetchingUserData(false);
    }
  };

  const fetchSubscrption = async () => {
    try {
      const response = await customFetch("/users/subscription");
      const data = await response.json();

      console.log("subscription: ", data);

      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription data");
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error.message);
    }

    return { data, error };
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Sign up error:", error.message);
    }

    return { data, error };
  };

  const signInWithProvider = async (provider) => {
    const siteUrl = import.meta.env.VITE_SITE_URL;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/me`,
      },
    });

    if (error) {
      console.error(`Sign in with ${provider} error:`, error.message);
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      sessionStorage.clear();
      setUser(null);
      setSession(null);
      setAuthToken(null);
      navigate("/");
    }

    if (error) {
      console.error("Sign out error:", error.message);
    }

    return { error };
  };

  signOutRef.current = signOut;

  const recoverPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error("Resetting password error:", error.message);
    }

    return { data, error };
  };

  useEffect(() => {
    if (!isOnline) {
      setloading(false);
      return;
    }
    const handleAuthStateChange = async (event, session) => {
      setSession(session);
      setloading(true);

      if (session?.access_token) {
        setAuthToken(session.access_token);
        try {
          await fetchUser();
          await fetchSubscrption();
        } catch (error) {
          console.error("Failed to fetch user data", error);

          if (error.message.includes("401")) {
            try {
              const { data } = await supabase.auth.refreshSession();
              if (data?.session) {
                setAuthToken(data.session.access_token);
                await fetchUser();
                await fetchSubscrption();
              } else {
                signOutRef.current();
              }
            } catch (refreshError) {
              signOutRef.current();
            }
          }
        }
      } else {
        setUser(null);
        setAuthToken(null);
      }
      setloading(false);
    };

    const initializeSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await handleAuthStateChange("INITIAL_SESSION", session);
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, [isOnline]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        subscription,
        fetchingUserData,
        signIn,
        signUp,
        signOut,
        signInWithGoogle: () => signInWithProvider("google"),
        signInWithGitHub: () => signInWithProvider("github"),
        recoverPassword,
        fetchUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
