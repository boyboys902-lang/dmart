import { useState, useEffect } from "react";
import AdminSidebar from "../../components/global/admin/AdminSidebar";
import { Save, User } from "lucide-react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../firebase";

const errorMessage = (err) => {
  const messages = {
    "auth/invalid-credential": "Current password is incorrect",
    "auth/wrong-password": "Current password is incorrect",
    "auth/invalid-email": "Please enter a valid email address",
    "auth/email-already-in-use": "This email is already in use",
    "auth/weak-password": "New password must be at least 6 characters",
    "auth/requires-recent-login": "Please log in again and retry",
    "auth/too-many-requests": "Too many attempts. Please try again later",
  };
  return messages[err.code] || err.message || "Failed to update credentials";
};

const UserSettings = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(auth.currentUser?.email || "");
    setLoading(false);
  }, []);

  const handleSave = async () => {
    if (!email.trim()) {
      setError("Email cannot be empty");
      return;
    }

    if (!currentPassword) {
      setError("Current password is required to confirm changes");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("You are not logged in");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setError("");

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      if (email.trim() !== user.email) {
        await updateEmail(user, email.trim());
      }

      if (password) {
        await updatePassword(user, password);
      }

      setSuccessMsg("Admin credentials updated successfully!");
      setPassword("");
      setCurrentPassword("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex pt-10">
      <AdminSidebar />
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ml-0 sm:ml-64">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-w-max">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
            <User size={24} className="text-teal-600" />
            <span>User Settings</span>
          </h1>

          {loading && <p className="text-gray-500">Loading...</p>}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-lg">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-400 rounded-lg">
              {successMsg}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password to confirm changes"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
