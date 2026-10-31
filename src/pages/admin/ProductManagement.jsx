import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/global/admin/AdminSidebar";
import {
  Plus, Pencil, Trash2, Save, X, Package, ImageOff,
  Upload, Search, CheckCircle2, Power,
} from "lucide-react";
import {
  getProducts, createProduct, updateProduct, deleteProduct, importProducts,
} from "../../utils/firestoreApi";
import { useProducts } from "../../context/useProducts";
import { shoppingData } from "../../data";

const toNumber = (value) => {
  const parsed = parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatRupees = (value) => `₹${toNumber(value).toLocaleString("en-IN")}`;

const autoDiscount = (offer, original) => {
  const offerValue = toNumber(offer);
  const originalValue = toNumber(original);
  if (!offerValue || !originalValue || originalValue <= offerValue) return "";
  return `${Math.round((1 - offerValue / originalValue) * 100)}% Off`;
};

const emptyForm = (nextId) => ({
  id: nextId,
  title: "",
  img: "",
  offerPrice: "",
  originalPrice: "",
  discount: "",
  rating: "4.5",
  ratingsCount: "",
  order: nextId,
  active: true,
  islogo: false,
});

const productToForm = (product) => ({
  id: Number(product.id),
  title: product.title || "",
  img: product.img || "",
  offerPrice: String(toNumber(product.offer_price) || ""),
  originalPrice: String(toNumber(product.original_price) || ""),
  discount: product.discount || "",
  rating: String(toNumber(product.rating) || ""),
  ratingsCount: String(product.ratings_count ?? ""),
  order: String(product.order ?? product.id ?? ""),
  active: product.active !== false,
  islogo: Boolean(product.islogo),
});

const formToProduct = (form) => ({
  id: Number(form.id),
  title: form.title.trim(),
  img: form.img.trim(),
  offer_price: formatRupees(form.offerPrice),
  original_price: formatRupees(form.originalPrice),
  discount: form.discount.trim() || autoDiscount(form.offerPrice, form.originalPrice),
  rating: form.rating ? `${form.rating} ★` : "",
  ratings_count: toNumber(form.ratingsCount),
  order: toNumber(form.order) || Number(form.id),
  active: form.active,
  islogo: form.islogo,
});

const ProductManagement = () => {
  const { refresh: refreshStorefront } = useProducts();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const flash = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const nextId = useMemo(
    () => products.reduce((max, product) => Math.max(max, Number(product.id) || 0), 0) + 1,
    [products]
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      const list = await getProducts();
      setProducts(list);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAdd = () => {
    setForm(emptyForm(nextId));
    setIsEditing(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (product) => {
    setForm(productToForm(product));
    setIsEditing(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setForm(null);
    setError("");
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form) return;

    if (!form.title.trim()) {
      setError("Product title is required");
      return;
    }
    if (!form.img.trim()) {
      setError("Product image URL is required");
      return;
    }
    if (!toNumber(form.offerPrice) || toNumber(form.offerPrice) <= 0) {
      setError("Selling price must be greater than 0");
      return;
    }

    try {
      setSaving(true);
      const payload = formToProduct(form);

      if (isEditing) {
        await updateProduct(payload);
        flash(`Product #${payload.id} updated`);
      } else {
        await createProduct(payload);
        flash(`Product #${payload.id} added`);
      }

      await loadProducts();
      await refreshStorefront();
      setForm(null);
    } catch (err) {
      console.error("Save product error:", err);
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title.slice(0, 60)}…"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteProduct(product.id);
      await loadProducts();
      await refreshStorefront();
      flash(`Product #${product.id} deleted`);
    } catch (err) {
      setError(err.message || "Failed to delete product");
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await updateProduct({ ...product, active: product.active === false });
      await loadProducts();
      await refreshStorefront();
    } catch (err) {
      setError(err.message || "Failed to update product");
    }
  };

  const handleImport = async () => {
    const message =
      products.length > 0
        ? "The starter catalogue will be added/updated in Firestore. Existing products with the same ID will be overwritten. Continue?"
        : "Import all 14 products from the website catalogue into Firestore?";
    if (!window.confirm(message)) return;

    try {
      setSaving(true);
      const { imported } = await importProducts(shoppingData);
      await loadProducts();
      await refreshStorefront();
      flash(`${imported} products imported`);
    } catch (err) {
      setError(err.message || "Failed to import products");
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter((product) =>
    product.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600";

  return (
    <div className="min-h-screen bg-gray-100 flex pt-10">
      <AdminSidebar />
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ml-0 sm:ml-64">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Package size={24} className="text-teal-600" />
              <span>Products</span>
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleImport}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-teal-600 text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-50"
              >
                <Upload size={16} />
                Import starter catalogue
              </button>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                <Plus size={16} />
                Add product
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Products added here shop par turant dikhte hain. Inactive products storefront se hide ho jaate hain.
          </p>

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

          {/* ── Add / edit form ── */}
          {form && (
            <form
              onSubmit={handleSave}
              className="mb-8 p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">
                  {isEditing ? `Edit product #${form.id}` : `New product #${form.id}`}
                </h2>
                <button type="button" onClick={closeForm} className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                    <textarea
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      rows={3}
                      placeholder="Product name / combo description"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL *</label>
                    <input
                      type="text"
                      value={form.img}
                      onChange={(e) => updateField("img", e.target.value)}
                      placeholder="https://... or /products/filename.jpg"
                      className={inputCls}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Selling price (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        value={form.offerPrice}
                        onChange={(e) => updateField("offerPrice", e.target.value)}
                        placeholder="499"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">MRP (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.originalPrice}
                        onChange={(e) => updateField("originalPrice", e.target.value)}
                        placeholder="1099"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Discount label</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.discount}
                          onChange={(e) => updateField("discount", e.target.value)}
                          placeholder={autoDiscount(form.offerPrice, form.originalPrice) || "55% Off"}
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => updateField("discount", autoDiscount(form.offerPrice, form.originalPrice))}
                          className="px-3 text-xs font-semibold border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 shrink-0"
                          title="Calculate from prices"
                        >
                          Auto
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Display order</label>
                      <input
                        type="number"
                        min="1"
                        value={form.order}
                        onChange={(e) => updateField("order", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Rating (1–5)</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={form.rating}
                        onChange={(e) => updateField("rating", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Ratings count</label>
                      <input
                        type="number"
                        min="0"
                        value={form.ratingsCount}
                        onChange={(e) => updateField("ratingsCount", e.target.value)}
                        placeholder="2165"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => updateField("active", e.target.checked)}
                      className="w-4 h-4 accent-teal-600"
                    />
                    Active (visible on the website)
                  </label>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Preview</label>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="aspect-square bg-gray-50 flex items-center justify-center">
                      {form.img ? (
                        <img src={form.img} alt="preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageOff size={28} className="text-gray-300" />
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-3">{form.title || "Product title"}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-gray-900">
                          {formatRupees(form.offerPrice || 0)}
                        </span>
                        <span className="text-[11px] text-gray-400 line-through">
                          {formatRupees(form.originalPrice || 0)}
                        </span>
                      </div>
                      <p className="text-[10px] text-green-700 font-bold">
                        {form.discount || autoDiscount(form.offerPrice, form.originalPrice) || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : isEditing ? "Update product" : "Add product"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* ── Toolbar ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{products.length}</span> products
              <span className="text-gray-400"> · {products.filter((p) => p.active !== false).length} active</span>
            </p>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 w-full sm:w-64"
              />
            </div>
          </div>

          {/* ── Table ── */}
          {loading ? (
            <p className="text-gray-500 py-6">Loading products...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <Package size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-semibold">
                {products.length === 0 ? "No products in Firestore yet" : "No products match your search"}
              </p>
              {products.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  “Import starter catalogue” dabayein ya “Add product” se naya product banayein.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">
                    <th className="py-2.5 px-3">Image</th>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Rating</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center">
                          {product.img ? (
                            <img src={product.img} alt={product.title} className="w-full h-full object-contain" />
                          ) : (
                            <ImageOff size={16} className="text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 max-w-[380px]">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{product.title}</p>
                        <p className="text-[10px] text-gray-400">ID #{product.id} · order {product.order ?? product.id}</p>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="font-bold text-gray-900">{product.offer_price || "—"}</span>
                        {product.original_price && (
                          <span className="block text-[10px] text-gray-400 line-through">{product.original_price}</span>
                        )}
                        {product.discount && (
                          <span className="block text-[10px] text-green-700 font-bold">{product.discount}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600">
                        {product.rating || "—"}
                        {product.ratings_count ? (
                          <span className="block text-[10px] text-gray-400">
                            {Number(product.ratings_count).toLocaleString("en-IN")} ratings
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            product.active !== false
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                          }`}
                          title="Click to toggle"
                        >
                          <Power size={10} />
                          {product.active !== false ? "Active" : "Hidden"}
                        </button>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
