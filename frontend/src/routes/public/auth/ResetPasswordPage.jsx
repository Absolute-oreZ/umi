import { useState } from "react";
import { Link } from "react-router-dom";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { useAuth } from "../../../context/AuthContext";
import Loader from "../../../components/common/Loader";

const ResetPasswordPage = () => {
  const { recoverPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const { error } = await recoverPassword(email);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Check your email for a password reset link.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-90 p-8 bg-white rounded-lg">
        <div className="flex flex-1 gap-2">
          <img src="/icons/logo.png" alt="logo" className="w-16 h-16" />
          <h2 className="text-2xl font-semibold text-purple-800 mb-2">
            Forgotten your password?
          </h2>
        </div>
        <p className="mb-6">No worries, we got you covered!</p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-[#004f66] text-sm mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-[#c0e2e9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00c2cb]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#006994] hover:bg-[#00577e] text-white py-2 rounded-md transition duration-200 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <Loader size={20} text="Sending reset link..." />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <p className="text-sm text-purple-800 mt-4 gap-2">
          <Link to="/login" className="flex items-center gap-2">
            <IoChevronBackCircleOutline /> <span>Back to login</span>
          </Link>
        </p>

        <div className="min-h-[40px] mt-2 text-sm text-center">
          {errorMsg && (
            <div className="p-2 bg-pink-100 rounded-md text-red-600">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-2 bg-green-100 rounded-md text-green-700">
              {successMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
