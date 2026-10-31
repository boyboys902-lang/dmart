import { useEffect, useState } from "react";
import AdminSidebar from "../../components/global/admin/AdminSidebar";
import { Search, Users, Phone, MapPin, RefreshCw } from "lucide-react";
import { getCustomers } from "../../utils/firestoreApi";

const formatDate = (timestamp) => {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setCustomers(await getCustomers());
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const term = search.trim().toLowerCase();
  const filtered = customers.filter(
    (customer) =>
      !term ||
      (customer.fullName || "").toLowerCase().includes(term) ||
      (customer.mobile || "").toLowerCase().includes(term) ||
      (customer.pincode || "").includes(term)
  );

  return (
    <div className="min-h-screen bg-gray-100 flex pt-10">
      <AdminSidebar />
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ml-0 sm:ml-64">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Users size={24} className="text-teal-600" />
              <span>Customers</span>
            </h1>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-teal-600 text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Har checkout par customer ka naam, mobile aur address Firestore
            (collection <span className="font-mono text-xs">customers</span>) mein
            save hota hai.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{customers.length}</span>{" "}
              customers
            </p>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, mobile, pincode..."
                className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 w-full sm:w-72"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500 py-6">Loading customers...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <Users size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-semibold">
                {customers.length === 0
                  ? "Abhi koi customer save nahi hua"
                  : "Koi customer search se match nahi hua"}
              </p>
              {customers.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Jaise hi koi order place karega, uska address yahan aa jayega.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Mobile</th>
                    <th className="py-2.5 px-3">Address</th>
                    <th className="py-2.5 px-3">Orders</th>
                    <th className="py-2.5 px-3">Last order</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    <tr key={customer._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-gray-800">{customer.fullName || "—"}</p>
                        <p className="text-[10px] text-gray-400">
                          {customer.pincode ? `PIN ${customer.pincode}` : ""}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <Phone size={11} className="text-gray-400" />
                          {customer.mobile || "—"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-[320px]">
                        <p className="text-xs text-gray-600 flex items-start gap-1">
                          <MapPin size={11} className="text-gray-400 mt-0.5 shrink-0" />
                          <span>
                            {customer.fullAddress || "—"}
                            {customer.cityState ? `, ${customer.cityState}` : ""}
                          </span>
                        </p>
                      </td>
                      <td className="py-2.5 px-3 text-xs font-bold text-gray-800">
                        {Number(customer.ordersCount) || 0}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(customer.lastOrderAt || customer.updatedAt)}
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

export default Customers;
