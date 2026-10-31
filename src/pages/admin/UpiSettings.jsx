import { useEffect, useState } from "react";
import AdminSidebar from "../../components/global/admin/AdminSidebar";
import { Save, IndianRupee, AlertCircle } from "lucide-react";
import { getUpiSettings, saveUpiSettings } from "../../utils/firestoreApi";

const UPI_REGEX = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/;

const UpiSettings = () => {
  const [upiId, setUpiId] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const settings = await getUpiSettings();
        if (!active) return;
        setUpiId(settings.upiId);
        setPayeeName(settings.payeeName);
      } catch (err) {
        if (active) setError(err.message || "Failed to load UPI settings");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setSuccessMsg("");
    setError("");

    const cleanUpi = upiId.trim();
    const cleanName = payeeName.trim();

    if (!UPI_REGEX.test(cleanUpi)) {
      setError("Enter a valid UPI ID, for example name@bank or 9876543210@upi");
      return;
    }

    if (!cleanName) {
      setError("Merchant / payee name is required");
      return;
    }

    try {
      setSaving(true);
      await saveUpiSettings({ upiId: cleanUpi, payeeName: cleanName });
      setSuccessMsg("UPI settings saved. Checkout QR will use this UPI ID.");
    } catch (err) {
      setError(err.message || "Failed to save UPI settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex pt-10">
      <AdminSidebar />
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ml-0 sm:ml-64">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center space-x-3">
            <IndianRupee size={24} className="text-teal-600" />
            <span>UPI Settings</span>
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            This UPI ID receives all customer payments. Changing it here updates the
            checkout page immediately.
          </p>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Before you save</p>
              <p>
                Make sure the UPI ID is correct and belongs to the merchant.
                Customers will scan a QR code that pays this UPI ID with the order
                amount already filled in.
              </p>
            </div>
          </div>

          {loading && <p className="text-gray-500 mb-4">Loading...</p>}

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
              Merchant UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="name@bank"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              Example: r86j742993@mairtel
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merchant / Payee Name
            </label>
            <input
              type="text"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              placeholder="Store name shown in the UPI app"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center space-x-2 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            <span>{saving ? "Saving..." : "Save UPI Settings"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpiSettings;
