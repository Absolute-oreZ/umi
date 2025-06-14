import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  LandingPage,
  AuthLayout,
  SignupPage,
  SignInPage,
  ResetPasswordPage,
  PrivateRoute,
  RootLayout,
  Profile,
  ProfileCompletionLayout,
  EditProfile,
  Events,
  Groups,
  Resources,
} from "./routes/index";
import AuthProvider from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import WebSocketProvider from "./context/WebSocketContext";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <ToastContainer />
          <Routes>
            <Route index element={<LandingPage />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<SignInPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>

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
                element={<ProfileCompletionLayout />}
              />
            </Route>
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
