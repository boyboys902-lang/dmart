import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import {
  Package, ChevronRight, Clock, CheckCircle2, Truck,
  RotateCcw, ShoppingBag, Zap, MapPin, Star, AlertCircle,
  Phone, Smartphone, Trash2, RefreshCw,
} from "lucide-react";

// ── localStorage helpers ──────────────────────────────────────────────────

const ORDERS_KEY = "basket_orders";

const getOrdersFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const updateOrderStatus = (orderId, newStatus) => {
  try {
    const orders = getOrdersFromLocalStorage();
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

const deleteOrder = (orderId) => {
  try {
    const orders = getOrdersFromLocalStorage();
    const updated = orders.filter((o) => o.id !== orderId);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

// ── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  delivered: {
    label: "Delivered",
    icon: <CheckCircle2 size={13} />,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  pending: {
    label: "Pending Confirmation",
    icon: <AlertCircle size={13} />,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  on_the_way: {
    label: "Out for Delivery",
    icon: <Truck size={13} />,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: <RotateCcw size={13} />,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-400",
  },
};

// ── Order Card ────────────────────────────────────────────────────────────

const OrderCard = ({ order, onDelete, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200">

      {/* ── HEADER ── */}
      <div className="px-4 md:px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <Package size={16} className="text-[#0c831f]" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Order ID</p>
            <p className="text-sm font-extrabold text-gray-800 tracking-tight">#{order.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status pill */}
          <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.color} ${status.bg} ${status.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
            {status.label}
          </span>
          {/* Date */}
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 font-medium">
            <Clock size={11} /> {order.date}
          </span>
        </div>
      </div>

      {/* ── ITEMS ── */}
      <div className="px-4 md:px-5 py-4 space-y-3">
        {order.items?.slice(0, expanded ? undefined : 1).map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
              {item.img
                ? <img src={item.img} alt={item.name} className="w-full h-full object-contain p-1.5" onError={(e) => { e.target.style.display = "none"; }} />
                : <span className="text-2xl">🛒</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs text-gray-400">Qty: <b className="text-gray-600">{item.qty}</b></span>
                <span className="text-xs font-bold text-gray-900">{item.price}</span>
              </div>
            </div>
          </div>
        ))}

        {order.items?.length > 1 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-bold text-[#0c831f] hover:underline flex items-center gap-1"
          >
            {expanded ? "Show less" : `+${order.items.length - 1} more item${order.items.length - 1 > 1 ? "s" : ""}`}
            <ChevronRight size={12} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>

      {/* ── DETAILS STRIP ── */}
      <div className="px-4 md:px-5 pb-3 flex flex-wrap gap-3 text-[11px] text-gray-500">
        {/* Address */}
        {order.address && (
          <div className="flex items-start gap-1 max-w-xs">
            <MapPin size={11} className="text-[#0c831f] mt-0.5 shrink-0" />
            <span className="line-clamp-1">{order.address}</span>
          </div>
        )}
        {/* Phone */}
        {order.mobile && (
          <div className="flex items-center gap-1">
            <Phone size={11} className="text-[#0c831f]" />
            <span>{order.mobile}</span>
          </div>
        )}
        {/* Payment */}
        {order.paymentMethod && (
          <div className="flex items-center gap-1">
            <Smartphone size={11} className="text-[#0c831f]" />
            <span>{order.paymentMethod}</span>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="px-4 md:px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        {/* Total + savings */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Total:</span>
            <span className="text-sm font-extrabold text-gray-900">{order.total}</span>
          </div>
          {order.saved && order.saved !== "₹0" && (
            <span className="text-[11px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              Saved {order.saved}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Rate — only for delivered */}
          {order.status === "delivered" && (
            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-300 hover:border-[#0c831f] hover:text-[#0c831f] px-3 py-1.5 rounded-xl transition-all">
              <Star size={12} /> Rate
            </button>
          )}

          {/* Cancel — only for pending */}
          {order.status === "pending" && !showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all"
            >
              Cancel
            </button>
          )}

          {/* Confirm cancel */}
          {showConfirm && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Sure?</span>
              <button
                onClick={() => { onStatusChange(order.id, "cancelled"); setShowConfirm(false); }}
                className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-xl transition-all"
              >
                Yes, cancel
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-xs font-bold text-gray-600 border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-xl transition-all"
              >
                No
              </button>
            </div>
          )}

          {/* Reorder */}
          {order.productId && (
            <Link to={`/product-details/${order.productId}`}>
              <button className="flex items-center gap-1.5 text-xs font-bold text-[#0c831f] border-2 border-[#0c831f] hover:bg-[#0c831f] hover:text-white px-3 py-1.5 rounded-xl transition-all">
                <RotateCcw size={12} /> Reorder
              </button>
            </Link>
          )}

          {/* Delete */}
          <button
            onClick={() => onDelete(order.id)}
            className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
            title="Remove order"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  // Load from localStorage on mount
  useEffect(() => {
    setOrders(getOrdersFromLocalStorage());
  }, []);

  const handleDelete = (orderId) => {
    setOrders(deleteOrder(orderId));
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(updateOrderStatus(orderId, newStatus));
  };

  const handleClearAll = () => {
    localStorage.removeItem(ORDERS_KEY);
    setOrders([]);
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "on_the_way", label: "On the Way" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filtered =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  const getCount = (tabId) =>
    tabId === "all" ? orders.length : orders.filter((o) => o.status === tabId).length;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-[104px] md:pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">

          {/* ── HEADER ── */}
          <div className="flex items-start md:items-center justify-between py-6 gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                <Zap size={12} className="text-[#0c831f] fill-[#0c831f]" />
                {orders.length > 0
                  ? `${orders.length} order${orders.length > 1 ? "s" : ""} placed`
                  : "Your order history appears here"}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {orders.length > 0 && (
                <button
                  onClick={() => setOrders(getOrdersFromLocalStorage())}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-[#0c831f] hover:border-[#0c831f] transition-all"
                  title="Refresh"
                >
                  <RefreshCw size={15} />
                </button>
              )}
              <Link to="/">
                <button className="flex items-center gap-2 bg-[#0c831f] hover:bg-[#1a9e2e] text-white text-xs md:text-sm font-bold px-4 md:px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm shadow-green-100">
                  <ShoppingBag size={15} /> Shop Now
                </button>
              </Link>
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
            {tabs.map((t) => {
              const count = getCount(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-150 ${
                    activeTab === t.id
                      ? "bg-[#0c831f] text-white border-[#0c831f] shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#0c831f] hover:text-[#0c831f]"
                  }`}
                >
                  {t.label}
                  {count > 0 && (
                    <span className={`text-[10px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full ${
                      activeTab === t.id ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Clear all */}
            {orders.length > 0 && (
              <button
                onClick={handleClearAll}
                className="shrink-0 ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-400 hover:bg-red-50 hover:border-red-400 transition-all"
              >
                <Trash2 size={12} /> Clear all
              </button>
            )}
          </div>

          {/* ── ORDERS ── */}
          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (

            
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-5 text-5xl">
                {activeTab === "cancelled" ? "❌" : activeTab === "delivered" ? "✅" : "🛒"}
              </div>
              <h2 className="text-xl font-extrabold text-gray-800 mb-2">
                {activeTab === "all" ? "No orders yet" : `No ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} orders`}
              </h2>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
                {activeTab === "all"
                  ? "Start shopping and your orders will appear here."
                  : `You don't have any ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} orders.`}
              </p>
              <Link to="/">
                <button className="flex items-center gap-2 bg-[#0c831f] hover:bg-[#1a9e2e] text-white font-bold px-8 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-100">
                  <ShoppingBag size={17} /> Start Shopping
                </button>
              </Link>
              <p className="mt-5 text-xs text-gray-400 flex items-center gap-1.5">
                <Zap size={11} className="text-[#f8c42a] fill-[#f8c42a]" />
                Groceries delivered in 4 hours
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default MyOrders;