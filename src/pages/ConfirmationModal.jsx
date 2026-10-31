import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Package, Phone, Clock, ChevronRight, Zap, MapPin } from "lucide-react";
import Footer from "../components/global/Footer";
import Navbar from "../components/global/Navbar";

const steps = [
  { icon: "✅", label: "Order Placed", done: true },
  { icon: "📞", label: "Confirming", done: true, active: true },
  { icon: "📦", label: "Packed", done: false },
  { icon: "🚴", label: "On the Way", done: false },
  { icon: "🏠", label: "Delivered", done: false },
];

const ConfirmationPage = () => {
  const [show, setShow] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('basket_orders') || '[]');
    const latestOrder = orders[0];

    if (latestOrder) {
      setOrder(latestOrder);
    }

    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  const [deliveryTime] = useState(() => {
    const type = Math.random();
    if (type < 0.5) {
      const mins = Math.random() > 0.5 ? 20 : 25;
      return `${mins}-${mins + 10} mins`;
    }
    const hours = Math.random() > 0.5 ? 2 : 4;
    return `${hours}-${hours + 2} hours`;
  });

  const deliveryAddress = order 
    ? order.address || "Your delivery address"
    : "Kolkata, West Bengal";

  const pincode = order?.pincode || "700001";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20 pb-16 px-4 flex flex-col items-center">
        {/* Main Card */}
        <div className={`w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

          {/* Green Header */}
          <div className="bg-gradient-to-br from-[#0c831f] to-[#065f12] px-6 pt-8 pb-10 text-center relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                <CheckCircle size={44} className="text-[#0c831f]" strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Zap size={14} className="fill-[#f8c42a] text-[#f8c42a]" />
              <span className="text-[#f8c42a] text-xs font-extrabold uppercase tracking-widest">Order Received</span>
              <Zap size={14} className="fill-[#f8c42a] text-[#f8c42a]" />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              Thank You! 🎉
            </h1>
            <p className="text-white/70 text-sm mt-1.5">
              Your order has been placed successfully
            </p>
          </div>

          {/* Content */}
          <div className="px-5 sm:px-6 py-6 space-y-6">
            {/* Status banner */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
              <Phone size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">Order Confirmation Pending</p>
                <p className="text-xs text-amber-700/80 mt-0.5 leading-relaxed">
                  Our team will call you shortly to confirm your order.
                </p>
              </div>
            </div>

            {/* Progress tracker */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Status</p>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0" />
                <div className="absolute top-4 left-4 h-0.5 bg-[#0c831f] z-0 transition-all duration-700" style={{ width: "20%" }} />

                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 z-10 w-1/5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${step.done 
                      ? step.active 
                        ? "bg-amber-400 border-amber-400 shadow-md shadow-amber-200" 
                        : "bg-[#0c831f] border-[#0c831f]" 
                      : "bg-white border-gray-200"}`}>
                      {step.icon}
                    </div>
                    <span className={`text-[9px] font-bold text-center leading-tight ${step.done ? "text-gray-700" : "text-gray-300"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Cards - Now Fully Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Delivery Time Card */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Clock size={22} className="text-[#0c831f]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Delivery in</p>
                  <p className="text-lg font-extrabold text-[#0c831f] tracking-tight leading-none mt-1">
                    {deliveryTime}
                  </p>
             <p className="text-sm font-semibold text-green-600 mt-1">
  {deliveryTime.includes("mins") ? "Super fast delivery 🚀" : "Scheduled delivery 🛒"}
</p>
                </div>
              </div>

              {/* Deliver To Card */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                  <MapPin size={22} className="text-[#0c831f]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 font-medium">Deliver To</p>
                  <p className="text-sm font-semibold text-gray-800 leading-tight mt-1 break-words">
                    {deliveryAddress}
                  </p>
                  {order?.pincode && (
                    <p className="text-xs text-gray-500 mt-1">Pincode: {order.pincode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Message</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Message */}
            <div className="space-y-3 text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                Thank you for shopping with us! We look forward to serving you again.
              </p>
              <p className="text-sm text-gray-700 font-semibold leading-relaxed bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
                आपका ऑर्डर अभी पेंडिंग है। हमारी टीम जल्द ही आपसे संपर्क करेगी।
              </p>
              <p className="text-xs text-gray-400">It's our way of saying thanks for joining our family. 💚</p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/my-order" className="block">
                <button className="w-full bg-[#0c831f] hover:bg-[#1a9e2e] active:scale-[0.98] text-white font-extrabold py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                  <Package size={18} />
                  Track My Order
                  <ChevronRight size={16} />
                </button>
              </Link>

              <Link to="/" className="block">
                <button className="w-full border-2 border-gray-200 hover:border-[#0c831f] hover:text-[#0c831f] text-gray-700 font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Strip */}
        <div className="mt-8 flex items-center gap-4 text-xs text-gray-400 font-medium">
          <span>🔒 Secure</span>
          <span>•</span>
          <span>🚚 Free Delivery</span>
          <span>•</span>
          <span>↩️ Easy Returns</span>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ConfirmationPage;