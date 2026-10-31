import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

const ACCESS_PASSWORD = import.meta.env.VITE_ADMIN_ACCESS_CODE || "";

const AdminLogin = () => {
  const [accessCode, setAccessCode] = useState("");
  const [accessGranted, setAccessGranted] = useState(!ACCESS_PASSWORD);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");
  const navigate = useNavigate();

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (accessCode === ACCESS_PASSWORD) {
      setAccessGranted(true);
      setCodeError("");
    } else {
      setCodeError("Invalid access code");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/orders");
    } catch (err) {
      const messages = {
        "auth/invalid-email": "Please enter a valid email address",
        "auth/invalid-credential": "Invalid email or password",
        "auth/user-not-found": "Invalid email or password",
        "auth/wrong-password": "Invalid email or password",
        "auth/too-many-requests": "Too many attempts. Please try again later",
        "auth/network-request-failed": "Network error. Please check your connection",
      };
      setError(messages[err.code] || "Invalid email or password");
    }
  };

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
            Enter Access Code
          </h1>

          {codeError && (
            <p className="text-red-600 text-sm text-center mb-4">{codeError}</p>
          )}

          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter access code"
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors duration-200 text-base"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300"
            >
              Submit Code
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors duration-200 text-base"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors duration-200 text-base"
              required
              maxLength={20}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
