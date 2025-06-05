import { ReactKeycloakProvider } from "@react-keycloak/web";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  LandingPage,
  PrivateRoute,
  RootLayout,
  Profile,
  ProfileCompletionContainer,
  EditProfile,
  Events,
  Groups,
  Resources,
} from "./routes/index";
import { keycloakInstance } from "./keycloak/keycloakInstance";
import AuthHandler from "./handler/AuthHandler";
import AuthProvider from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import WebSocketProvider from "./context/WebSocketContext";

const App = () => {
  return (
    <ReactKeycloakProvider
      authClient={keycloakInstance}
      initOptions={{
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
      }}
    >
      <Router>
        <AuthHandler>
          <AuthProvider>
            <WebSocketProvider>
              <ToastContainer />
              <Routes>
                <Route index element={<LandingPage />} />

                <Route element={<PrivateRoute />}>
                  <Route element={<RootLayout />}>
                    <Route path="/me" element={<Profile />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/resources" element={<Resources />} />
                  </Route>

                  <Route
                    path="/profile-completion"
                    element={<ProfileCompletionContainer />}
                  />
                </Route>
              </Routes>
            </WebSocketProvider>
          </AuthProvider>
        </AuthHandler>
      </Router>
    </ReactKeycloakProvider>
  );
};

export default App;
