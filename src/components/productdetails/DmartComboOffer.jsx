import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProduct, useProducts } from "../../context/useProducts";
import {
  Clock,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Lock,
  BadgeCheck,
  Users,
  AlertCircle,
  ShoppingCart,
  ChevronRight,
  MapPin,
} from "lucide-react";
import RoundLogo from "../../assets/round_logo.png";

const DmartComboOffer = () => {
  const { id } = useParams();

  const INITIAL_TIME = 15 * 60 + 25;
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [activeThumb, setActiveThumb] = useState(0);

  const product = useProduct(id);
  const { loading } = useProducts();

 

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const urgency = timeLeft < 300;

  if (!product) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <p className="text-gray-500 font-medium">Loading product…</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <AlertCircle size={48} className="text-red-400 mx-auto" />
          <p className="text-xl font-bold text-gray-800">Product Not Found</p>
          <Link
            to="/"
            className="text-sm text-[#0c831f] font-semibold hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const thumbnails = [product.img, product.img, product.img, product.img];

  return (
    <div className="min-h-screen bg-white pt-14 sm:pt-16 pb-24 md:pb-0">
      {/* ── FLASH STRIP ── */}
      <div className="bg-gradient-to-r from-[#0c831f] to-[#1db954] text-white text-center py-2 px-3 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide leading-snug">
        ⚡ FLASH COMBO DEAL &nbsp;•&nbsp; EXTRA SAVINGS ACTIVE &nbsp;•&nbsp;
        LIMITED TIME ONLY
      </div>

      {/* ── BREADCRUMB ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 pt-3 sm:pt-4 pb-0 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-gray-400 flex-wrap">
        <Link
          to="/"
          className="hover:text-[#0c831f] transition-colors whitespace-nowrap"
        >
          Home
        </Link>
        <ChevronRight size={11} />
        <span className="hover:text-[#0c831f] cursor-pointer transition-colors whitespace-nowrap">
          Combo Offers
        </span>
        <ChevronRight size={11} />
        <span className="text-[#0c831f] font-semibold line-clamp-1 max-w-[140px] xs:max-w-[180px] sm:max-w-[240px] md:max-w-none">
          {product.title}
        </span>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 lg:gap-14 items-start">
        {/* ── LEFT: IMAGE ── */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Main image */}
          <div className="relative bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center p-5 sm:p-8 md:p-10 overflow-hidden group aspect-square max-h-[340px] sm:max-h-[420px] md:max-h-none">
            <div className="bg-black relative">
              <img
                src={thumbnails[activeThumb]}
                alt={product.title}
                className="w-full h-full object-contain"
              />
              <img
                src={RoundLogo}
                alt="RoundLogo"
                className="absolute md:bottom-2 md:right-2 bottom-1 right-1 rounded-full w-7 md:w-10"
              />
            </div>
            {/* Discount badge */}
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow">
              {product.discount}
            </div>
            {/* Genuine badge */}
            <div className="absolute w-fit bottom-2.5 left-2.5 sm:bottom-3 sm:right-3 bg-white border border-green-200 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-semibold text-[#0c831f] shadow-sm">
              <BadgeCheck size={11} /> 100% Genuine
            </div>
          </div>

          {/* Thumbnails — visible on all sizes */}

          {/* Trust bar */}
          <div className="bg-green-50 border border-green-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#0c831f] font-semibold text-center">
            <BadgeCheck size={16} className="shrink-0" />
            <span>
              Trusted by 1M+ customers &nbsp;•&nbsp; Safe &amp; Secure Payments
            </span>
          </div>
        </div>

        {/* ── RIGHT: DETAILS ── */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Title */}
          <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold leading-snug text-gray-900 tracking-tight">
            {product.title}
          </h1>

          {/* Rating + social proof */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-green-50 border border-green-200 px-2 sm:px-2.5 py-1 rounded-lg">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-gray-800">{product.rating}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">
                {product.ratings_count.toLocaleString()}+ ratings
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 text-green-700 font-semibold">
              <Users size={13} />
              <span>128 bought today</span>
            </div>
          </div>

          {/* Price */}
          <div className="border-t border-b border-gray-200 py-3 sm:py-4 space-y-1 sm:space-y-1.5">
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                {product.offer_price}
              </span>
              <span className="text-base sm:text-lg text-gray-400 line-through">
                {product.original_price}
              </span>
              <span className="bg-red-50 text-red-600 text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                {product.discount}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-400">
              (Inclusive of all taxes)
            </p>
          </div>

          {/* Urgency timer */}
          <div
            className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              urgency
                ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                : "bg-orange-50 text-orange-700 border border-orange-200"
            }`}
          >
            <Clock size={16} className="shrink-0" />
            <span>
              {urgency ? "⚠️ Hurry! " : ""}Offer ends in&nbsp;
              <span className="font-extrabold text-sm sm:text-base tracking-widest">
                {formatTime(timeLeft)}
              </span>
            </span>
          </div>

          {/* Stock warning */}
          <div className="flex items-center gap-2 sm:gap-2.5 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium">
            <AlertCircle size={16} className="shrink-0 text-yellow-600" />
            Hurry! Only <b className="mx-1">7 units</b> left in stock
          </div>

          {/* Trust grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
            {
  icon: <Truck size={14} />,
  text: "Delivery in 4 hours",
},
              { icon: <RotateCcw size={14} />, text: "7-Day Easy Returns" },
              { icon: <ShieldCheck size={14} />, text: "100% Genuine Product" },
              { icon: <Lock size={14} />, text: "Secure Checkout" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-[11px] sm:text-xs font-medium text-gray-700"
              >
                <span className="text-[#0c831f] shrink-0">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link to={`/shopping-cart/${id}`}>
            <button className="w-full bg-[#0c831f] hover:bg-[#1a9e2e] active:scale-[0.98] text-white text-sm sm:text-base font-extrabold py-3.5 sm:py-4 rounded-2xl shadow-lg shadow-green-200 transition-all duration-150 flex items-center justify-center gap-2 sm:gap-2.5">
              <ShoppingCart size={18} />
              BUY NOW &nbsp;•&nbsp; SAVE MORE
            </button>
          </Link>

          {/* Payment info */}
          <div className="space-y-1 text-center">
            <p className="text-[10px] sm:text-xs text-gray-400">
              💳 Pay via UPI, Cards, Net Banking, Wallets &nbsp;|&nbsp; 🔒 SSL
              Encrypted
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400">
              🔒 We do not store card details • 100% secure payment
            </p>
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2.5 z-50 flex items-center gap-3 safe-area-pb">
        <div className="shrink-0">
          <p className="text-[10px] text-gray-400 line-through leading-none">
            {product.original_price}
          </p>
          <p className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
            {product.offer_price}
          </p>
        </div>
        <Link to={`/shopping-cart/${id}`} className="flex-1">
          <button className="w-full bg-[#0c831f] hover:bg-[#1a9e2e] active:scale-[0.98] text-white text-sm font-extrabold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <ShoppingCart size={16} />
            BUY NOW • SAVE MORE
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DmartComboOffer;
