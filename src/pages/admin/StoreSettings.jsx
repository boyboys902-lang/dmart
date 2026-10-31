import { useEffect, useState } from "react";
import AdminSidebar from "../../components/global/admin/AdminSidebar";
import { KeyRound, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { getAdminAccessCode, saveAdminAccessCode } from "../../utils/firestoreApi";

const StoreSettings = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    getAdminAccessCode()
      .then((saved) => {
        if (!active) return;
        setCode(saved || import.meta.env.VITE_ADMIN_ACCESS_CODE || "");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load settings");
        setCode(import.meta.env.VITE_ADMIN_ACCESS_CODE || "");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await saveAdminAccessCode(code);
      setSuccess("Access code saved in Firestore");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to save access code");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex pt-10">
      <AdminSidebar />
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ml-0 sm:ml-64">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <KeyRound size={24} className="text-teal-600" />
            <span>Store Settings</span>
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Admin panel ka access code ab Firestore (
            <span className="font-mono text-xs">dmart_settings/admin</span>) mein save
            hota hai — yahan se kabhi bhi badal sakte hain.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-400 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 py-4">Loading...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin access code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. admin123"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Login page (<span className="font-mono">/chutya/nikal/dmart</span>) par
                  yahi code poocha jata hai. Khali chhodne par code nahi poocha jayega.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save code"}
              </button>
            </form>
          )}

          <div className="mt-8 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <p>
              Firestore rules ab public hain (aapke kehne par) — koi bhi banda
              products/orders/customers badal sakta hai. Jab chaho, rules wapas
              login-only kar sakte hain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
