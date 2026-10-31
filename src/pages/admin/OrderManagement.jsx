import { useState, useEffect, useMemo } from "react";
import AdminSidebar from "../../components/global/admin/AdminSidebar";
import { ShoppingCart, Eye, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { deleteOrders, getOrders, updateOrderStatus } from "../../utils/firestoreApi";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
         
        const orders = await getOrders();

        const transformedOrders = orders.map((order) => {
          if (!order._id) {
            console.error("Invalid order data, missing _id:", order);
            return null;
          }
          return {
            id: order._id,
            customer: {
              fullName: order.fullName || "N/A",
              mobile: order.mobile || "N/A",
              city: order.cityState ? order.cityState.split(", ")[0] || "N/A" : "N/A",
              state: order.cityState ? order.cityState.split(", ")[1] || "N/A" : "N/A",
              address: order.fullAddress || "N/A",
              pincode: order.pincode || "N/A",
            },
            product: {
              name: order.productName || "N/A",
              quantity: order.quantity || 0,
              total: order.totalAmount || 0,
            },
            payment: {
              method: order.paymentMethod || "N/A",
              upiApp: order.upiApp || "N/A",
            },
            status: order.status || "Pending",
          };
        }).filter(Boolean); // Remove invalid orders

        setOrders(transformedOrders.reverse());
        setLoading(false);
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setError(null);
    } catch (err) {
      console.error("Status change error:", err);
      setError(`Failed to update status: ${err.message}`);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      setError("Please select at least one order to delete");
      return;
    }

    // Validate IDs
    if (selectedOrders.some((id) => !id)) {
      setError("One or more selected orders are invalid");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} order(s)?`)) {
      return;
    }

    try {
      await deleteOrders(selectedOrders);

      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.filter((order) => !selectedOrders.includes(order.id));
        console.log("Updated orders:", updatedOrders);
        return updatedOrders;
      });
      setSelectedOrders([]);
      setError(null);
    } catch (err) {
      console.error("Bulk delete error:", err);
      setError(`Failed to delete orders: ${err.message}`);
    }
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (orderId) => {
    setSelectedOrders((prev) => {
      const newSelection = prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId];
      console.log("Selected orders updated:", newSelection);
      return newSelection;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders([]);
      console.log("Deselected all orders");
    } else {
      const newSelection = filteredOrders
        .map((order) => order.id);
      setSelectedOrders(newSelection);
      console.log("Selected all orders:", newSelection);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Completed":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const lowerCaseSearch = searchTerm.toLowerCase();

    return orders.filter(
      (order) =>
        String(order.id).toLowerCase().includes(lowerCaseSearch) ||
        order.customer.fullName.toLowerCase().includes(lowerCaseSearch) ||
        order.product.name.toLowerCase().includes(lowerCaseSearch) ||
        order.customer.city.toLowerCase().includes(lowerCaseSearch) ||
        order.status.toLowerCase().includes(lowerCaseSearch)
    );
  }, [orders, searchTerm]);


  const handleExcelDownload = () => {
  const dataToExport = filteredOrders.map((order, index) => ({
    "S.No": index + 1,
    "Order ID": order.id,
    "Customer Name": order.customer.fullName,
    "Mobile": order.customer.mobile,
    "City": order.customer.city,
    "State": order.customer.state,
    "Address": order.customer.address,
    "Pincode": order.customer.pincode,
    "Product": order.product.name,
    "Quantity": order.product.quantity,
    "Total Amount": order.product.total,
    "Payment Method": order.payment.method,
    "UPI App": order.payment.upiApp,
    "Status": order.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  XLSX.writeFile(workbook, "orders.xlsx");
};

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden pt-10">
      <AdminSidebar />
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ml-0 sm:ml-64 overflow-x-auto">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-w-max">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
              <ShoppingCart size={24} className="text-teal-600" />
              <span>Order Management</span>
            </h1>
          <div className="flex gap-3">
  <button
    onClick={handleExcelDownload}
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
  >
    Download Excel
  </button>

  <button
    onClick={handleBulkDelete}
    disabled={selectedOrders.length === 0}
    className={`px-4 py-2 bg-red-600 text-white rounded-lg ${
      selectedOrders.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
    }`}
  >
    Delete Selected ({selectedOrders.length})
  </button>
</div>
            
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 border border-red-400 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-8 text-gray-500">Loading orders...</div>
          )}

          {!loading && (
            <div className="mb-6 relative">
              <Search
                className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search orders by ID, Customer Name, Product, or City..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-shadow shadow-sm"
              />
            </div>
          )}
          <div className="py-2">
            <p>
              Total number of orders: <span className="font-bold">{orders.length}</span>
            </p>
          </div>

          {!loading && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                  <tr className="text-gray-600 font-bold text-xs sm:text-sm">
                    <th className="py-3 px-3 text-center min-w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={handleSelectAll}
                        className="cursor-pointer"
                      />
                    </th> 
                    <th className="py-3 px-3 text-start w-fit">Id</th>
                    <th className="py-3 px-3 text-left min-w-[150px]">Customer</th>
                    <th className="py-3 px-3 text-left min-w-[100px]">Mobile</th>
                    <th className="py-3 px-3 text-right min-w-[80px]">Total</th>
                    <th className="py-3 px-3 text-left min-w-[100px]">Payment</th>
                    <th className="py-3 px-3 text-left min-w-[80px]">City</th>
                    <th className="py-3 px-3 text-center min-w-[110px]">Status</th>
                    <th className="py-3 px-3 text-center min-w-[60px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className={`border-b border-gray-100 hover:bg-teal-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                       
                        <td className="py-3 px-3 text-center border-r border-gray-100">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => handleCheckboxChange(order.id)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 text-gray-600   text-xs sm:text-sm border-r border-gray-100">
                         {index+1}
                        </td>
                        <td
                          className="py-3 px-3  font-medium text-gray-700 truncate text-xs sm:text-sm border-r border-gray-100"
                          title={order.customer.fullName}
                        >
                          {order.customer.fullName}
                        </td>
                        <td className="py-3 px-3 text-gray-600 truncate text-xs sm:text-sm border-r border-gray-100">
                          {order.customer.mobile}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-teal-700 text-xs sm:text-sm border-r border-gray-100">
                          ₹{order.product.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-gray-600 truncate text-xs sm:text-sm border-r border-gray-100">
                          {order.payment.method}
                          {order.payment.upiApp && order.payment.upiApp !== "N/A" && (
                            <span className="block text-[10px] text-gray-400">
                              {order.payment.upiApp}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-600 truncate text-xs sm:text-sm border-r border-gray-100">
                          {order.customer.city}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-gray-100">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`appearance-none py-1 px-3 border rounded-full text-xs font-semibold focus:ring-1 cursor-pointer transition-colors ${getStatusColor(
                              order.status
                            )}`}
                            style={{ paddingRight: "1.5rem" }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Link
                            to={`./${order.id}`}
                            className="text-teal-600 hover:text-teal-800 p-2 rounded-full transition-colors inline-flex items-center justify-center"
                            title="View Order Details"
                          >
                            <Eye size={18} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="py-8 text-center text-gray-500">
                        {searchTerm ? "No orders found matching your search term." : "No orders available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;