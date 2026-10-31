import { useState, useEffect } from "react";
import AdminSidebar from "../../components/global/admin/AdminSidebar";
import {
  Save, Eye, AlertCircle, Plus, Trash2, CheckCircle2, ClipboardPaste,
} from "lucide-react";
import {
  getMetaPixels, saveMetaPixels, extractPixelIds,
} from "../../utils/firestoreApi";

const PIXEL_ID_REGEX = /^\d{10,20}$/;

const emptyPixel = () => ({ id: "", label: "", enabled: true });

const MetaPixel = () => {
  const [pixels, setPixels] = useState([]);
  const [pasteValue, setPasteValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const flash = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  useEffect(() => {
    let active = true;

    const fetchPixels = async () => {
      try {
        const { pixels: saved } = await getMetaPixels();
        if (!active) return;
        setPixels(saved.length ? saved : []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load Meta Pixels");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPixels();
    return () => {
      active = false;
    };
  }, []);

  const updatePixel = (index, patch) => {
    setPixels((prev) =>
      prev.map((pixel, i) => (i === index ? { ...pixel, ...patch } : pixel))
    );
    setError("");
  };

  const addPixel = () => {
    setPixels((prev) => [...prev, emptyPixel()]);
    setError("");
  };

  const removePixel = (index) => {
    setPixels((prev) => prev.filter((_, i) => i !== index));
    setError("");
  };

  // Accepts a pixel ID or a full Meta Pixel code block and adds every ID.
  const handleAddFromText = () => {
    const ids = extractPixelIds(pasteValue);
    if (ids.length === 0) {
      setError("No pixel ID found. Paste a 15–16 digit ID or the full Meta Pixel code.");
      return;
    }

    setPixels((prev) => {
      const existing = new Set(prev.map((pixel) => pixel.id.trim()));
      const newOnes = ids
        .filter((id) => !existing.has(id))
        .map((id, i) => ({
          id,
          label: `Pixel ${prev.length + i + 1}`,
          enabled: true,
        }));
      return [...prev, ...newOnes];
    });

    setPasteValue("");
    setError("");
    flash(`${ids.length} pixel ID${ids.length > 1 ? "s" : ""} added. Click "Save Pixels" to apply.`);
  };

  const handleSave = async () => {
    setError("");
    setSuccessMsg("");

    const cleaned = pixels
      .map((pixel) => ({
        id: pixel.id.trim(),
        label: pixel.label.trim(),
        enabled: pixel.enabled !== false,
      }))
      .filter((pixel) => pixel.id !== "");

    const invalid = cleaned.find((pixel) => !PIXEL_ID_REGEX.test(pixel.id));
    if (invalid) {
      setError(`"${invalid.id}" is not a valid pixel ID. Meta Pixel IDs are 15–16 digits.`);
      return;
    }

    const duplicates = cleaned.length !== new Set(cleaned.map((p) => p.id)).size;
    if (duplicates) {
      setError("The same pixel ID is added twice. Please remove the duplicate.");
      return;
    }

    try {
      setSaving(true);
      await saveMetaPixels(cleaned);
      flash(
        cleaned.length === 0
          ? "All pixels removed. Tracking is now disabled."
          : `${cleaned.length} pixel${cleaned.length > 1 ? "s" : ""} saved. They will run on every page.`
      );
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save Meta Pixels");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex pt-10">
      <AdminSidebar />
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ml-0 sm:ml-64">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center space-x-3">
            <Eye size={24} className="text-teal-600" />
            <span>Meta Pixel</span>
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Add as many Meta Pixels as you need. Every active pixel fires on all pages,
            including <strong>PageView</strong> on each page change and <strong>Purchase</strong> at checkout.
          </p>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How to use</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Paste the pixel ID or the full code from Meta Events Manager in the box below.</li>
                  <li>Click <strong>Extract &amp; Add</strong> — all pixel IDs are detected automatically.</li>
                  <li>Give each pixel a name (optional) and keep only the ones you want active.</li>
                  <li>Click <strong>Save Pixels</strong>. Changes apply on the next page load.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Quick add */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
              <ClipboardPaste size={16} className="text-teal-600" />
              Paste pixel ID or full Meta Pixel code
            </label>
            <textarea
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-mono text-xs"
              placeholder={"1276810891046427\n\nor paste the complete <script> ... </script> block"}
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
            />
            <button
              onClick={handleAddFromText}
              className="mt-2 flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Extract &amp; Add</span>
            </button>
          </div>

          {loading && <p className="text-gray-500 mb-4">Loading...</p>}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-400 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          {/* Pixel list */}
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">
              Active pixel list ({pixels.length})
            </h2>
            <button
              onClick={addPixel}
              className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-semibold"
            >
              <Plus size={15} /> Add manually
            </button>
          </div>

          {pixels.length === 0 && !loading ? (
            <div className="mb-6 p-6 border-2 border-dashed border-gray-200 rounded-xl text-center text-sm text-gray-400">
              No pixel added yet. Paste your pixel ID above to start tracking.
            </div>
          ) : (
            <div className="mb-6 space-y-3">
              {pixels.map((pixel, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 ${
                    pixel.enabled === false ? "bg-gray-50 border-gray-100" : "bg-white border-gray-200"
                  }`}
                >
                  <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={pixel.enabled !== false}
                      onChange={(e) => updatePixel(index, { enabled: e.target.checked })}
                      className="w-4 h-4 accent-teal-600"
                    />
                    <span className={`text-xs font-bold ${pixel.enabled === false ? "text-gray-400" : "text-teal-700"}`}>
                      {pixel.enabled === false ? "OFF" : "ON"}
                    </span>
                  </label>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={pixel.id}
                      onChange={(e) => updatePixel(index, { id: e.target.value.replace(/\D/g, "") })}
                      placeholder="Pixel ID (15–16 digits)"
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-mono text-sm"
                    />
                    <input
                      type="text"
                      value={pixel.label}
                      onChange={(e) => updatePixel(index, { label: e.target.value })}
                      placeholder={`Pixel ${index + 1} (name)`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-sm"
                    />
                  </div>

                  <button
                    onClick={() => removePixel(index)}
                    className="self-end sm:self-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove pixel"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center space-x-2 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            <span>{saving ? "Saving..." : "Save Pixels"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetaPixel;
