import { useState, useEffect } from "react";
import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProduct, useProducts } from "../context/useProducts";
import {
  Truck, ShieldCheck, Lock, BadgeCheck, Plus, Minus,
  ChevronRight, Clock, MapPin, Trash2, ArrowLeft,
} from "lucide-react";
import { getCart, updateCartQty, removeFromCart, getCartTotal } from "../utils/cart";

const ShoppingCart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useProduct(id);
  const { loading } = useProducts();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const cartItem = cartItems.find((item) => item.id === parseInt(id));
  const [qty, setQty] = useState(cartItem?.qty || 1);

  useEffect(() => {
    if (cartItem) setQty(cartItem.qty);
  }, [cartItem]);

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={loading ? "text-gray-500 text-lg font-medium" : "text-red-500 text-lg font-medium"}>
          {loading ? "Loading product…" : "Product not found."}
        </p>
      </div>
    );

  const parsePrice = (str) =>
    parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;

  const unitPrice = parsePrice(product.offer_price);
  const originalUnit = parsePrice(product.original_price);
  const subtotal = unitPrice * qty;
  const originalTotal = originalUnit * qty;
  const savings = originalTotal - subtotal;
  const finalTotal = subtotal;

  const fmt = (n) =>
    "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const handleQtyChange = (newQty) => {
    if (newQty < 1) return;
    setQty(newQty);
    updateCartQty(product.id, newQty);
  };

  const handleDelete = () => {
    removeFromCart(product.id);
    navigate("/");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-16 pb-28 md:pb-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0c831f] mb-4 transition-colors"
          >
            <ArrowLeft size={15} />
            Continue shopping
          </Link>

          <div className="bg-[#0c831f] text-white rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
            <Clock size={20} className="shrink-0" />
            <div>
              <p className="font-extrabold text-sm sm:text-base leading-tight">
                Delivery in 4 hours
              </p>
              <p className="text-xs text-green-100 mt-0.5">
                Fastest delivery in your area
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-green-100 shrink-0">
              <MapPin size={13} />
              <span className="hidden xs:inline">Kolkata</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <div className="lg:col-span-2 flex flex-col gap-4">

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                    My Cart
                    <span className="ml-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {qty} item{qty > 1 ? "s" : ""}
                    </span>
                  </h2>
                  <span className="text-xs text-[#0c831f] font-semibold">
                    {fmt(savings)} saved
                  </span>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center border border-gray-100 p-2">
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.weight || "1 unit"}
                    </p>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base sm:text-lg font-extrabold text-gray-900">
                        {fmt(unitPrice * qty)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {fmt(originalUnit * qty)}
                      </span>
                      <span className="text-xs font-bold text-[#0c831f] bg-green-50 px-1.5 py-0.5 rounded">
                        {product.discount}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center border-2 border-[#0c831f] rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleQtyChange(qty - 1)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#0c831f] hover:bg-green-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm font-bold text-[#0c831f]">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleQtyChange(qty + 1)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#0c831f] hover:bg-green-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={handleDelete}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mx-4 sm:mx-5 mb-4 bg-green-50 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-[#0c831f] font-medium">
                  <Truck size={14} className="shrink-0" />
                  ⚡ Delivery in <span className="font-bold">4 hours</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-5 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: <ShieldCheck size={16} />, label: "100% Genuine" },
                    { icon: <Truck size={16} />, label: "Free Delivery" },
                    { icon: <Lock size={16} />, label: "Secure Checkout" },
                    { icon: <BadgeCheck size={16} />, label: "1M+ Customers" },
                  ].map((b, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 text-center py-2">
                      <span className="text-[#0c831f]">{b.icon}</span>
                      <span className="text-[11px] font-medium text-gray-500">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-5 py-4">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Bill details</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>MRP ({qty} item{qty > 1 ? "s" : ""})</span>
                    <span className="text-gray-900 font-medium">{fmt(originalTotal)}</span>
                  </div>

                  <div className="flex justify-between text-[#0c831f]">
                    <span className="font-medium">Product discount</span>
                    <span className="font-semibold">− {fmt(savings)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery fee</span>
                    <span className="text-[#0c831f] font-semibold">Free</span>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-gray-900">
                    <span className="font-bold text-base">To pay</span>
                    <span className="font-extrabold text-base">{fmt(finalTotal)}</span>
                  </div>
                </div>

                <div className="mt-4 bg-green-50 rounded-xl px-3 py-2.5 text-xs text-[#0c831f] font-semibold text-center">
                  🎉 You are saving {fmt(savings)} on this order!
                </div>
              </div>

              <Link
                to={`/checkout/${id}`}
                className="hidden md:flex items-center justify-between bg-[#0c831f] hover:bg-[#1a9e2e] active:scale-[0.98] text-white font-extrabold px-5 py-4 rounded-2xl transition-all text-sm"
              >
                <span>Proceed to checkout</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-200 text-xs font-medium">{fmt(finalTotal)}</span>
                  <ChevronRight size={18} />
                </div>
              </Link>

              <p className="hidden md:block text-[11px] text-gray-400 text-center -mt-1">
                🔒 Secured by SSL • UPI • Cards • Net Banking
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-3 py-3">
        <Link
          to={`/checkout/${id}`}
          className="flex items-center justify-between bg-[#0c831f] hover:bg-[#1a9e2e] active:scale-[0.98] text-white font-extrabold px-4 py-3.5 rounded-2xl transition-all"
        >
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-green-200 font-medium">
              {qty} item{qty > 1 ? "s" : ""}
            </span>
            <span className="text-sm">{fmt(finalTotal)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            Proceed to checkout
            <ChevronRight size={16} />
          </div>
        </Link>
        <p className="text-[10px] text-gray-400 text-center mt-1.5">
          🔒 Secured by SSL • UPI • Cards • Net Banking
        </p>
      </div>

      <Footer />
    </>
  );
};

export default ShoppingCart;
