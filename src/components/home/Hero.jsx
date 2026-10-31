import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

const slides = [
  {
    id: 1,
    tag: "⚡ Fastest Delivery",
    headline: "Groceries at\nyour door in",
    highlight: "4 hours",
    sub: "Fresh vegetables, dairy, snacks & more — delivered faster than ever.",
    cta: "Order Now",
    bg: "from-[#0c831f] to-[#065f12]",
    accent: "#f8c42a",
    emoji: "🛒",
    pattern: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.07) 0%, transparent 60%)",
  },
  {
    id: 2,
    tag: "🔥 Today's Deals",
    headline: "Combo offers\nstarting at just",
    highlight: "₹499",
    sub: "Atta, sugar, oil & besan — massive savings on everyday essentials.",
    cta: "Shop Combos",
    bg: "from-[#b91c1c] to-[#7f1d1d]",
    accent: "#fbbf24",
    emoji: "🎁",
    pattern: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.07) 0%, transparent 60%)",
  },
  {
    id: 3,
    tag: "🥦 Farm Fresh",
    headline: "Fresh fruits &\nvegetables",
    highlight: "daily stocked",
    sub: "Sourced directly from farms. No preservatives, no compromise.",
    cta: "Explore Fresh",
    bg: "from-[#065f46] to-[#022c22]",
    accent: "#6ee7b7",
    emoji: "🥬",
    pattern: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 55%)",
  },
];

const categories = [
  { emoji: "🥛", label: "Dairy" },
  { emoji: "🍎", label: "Fruits" },
  { emoji: "🥦", label: "Veggies" },
  { emoji: "🍪", label: "Snacks" },
  { emoji: "🧴", label: "Personal Care" },
  { emoji: "🧹", label: "Household" },
  { emoji: "🍳", label: "Breakfast" },
  { emoji: "🥤", label: "Beverages" },
  { emoji: "🍫", label: "Chocolates" },
  { emoji: "🧊", label: "Frozen" },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = (dir) => {
    if (animating) return;
    setAnimating(true);
    setCurrent((c) => (c + dir + slides.length) % slides.length);
    setTimeout(() => setAnimating(false), 400);
  };

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[current];

  return (
    <section className="pt-16">

      {/* ── HERO BANNER ── */}
      <div className={`relative bg-gradient-to-r ${slide.bg} overflow-hidden transition-all duration-500`}
        style={{ background: undefined }}
      >
        {/* Gradient bg with smooth transition */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-all duration-700`}
          style={{ backgroundImage: slide.pattern }}
        />

        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-5 bottom-0 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 w-96 h-96 rounded-full bg-black/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 flex items-center justify-between gap-8">
          {/* Text */}
          <div
            key={current}
            className="flex flex-col gap-4 max-w-xl"
            style={{ animation: "fadeSlideIn 0.45s ease both" }}
          >
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full w-fit"
              style={{ background: "rgba(255,255,255,0.15)", color: slide.accent }}
            >
              {slide.tag}
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight whitespace-pre-line">
              {slide.headline}{"\n"}
              <span style={{ color: slide.accent }}>{slide.highlight}</span>
            </h1>

            <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md">
              {slide.sub}
            </p>

            <div className="flex items-center gap-3 mt-2">
              <button
                className="px-7 py-3.5 rounded-xl font-extrabold text-sm transition-all active:scale-95 shadow-lg"
                style={{ background: slide.accent, color: "#1c1c1c" }}
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
              >
                {slide.cta}
              </button>
              <button
                className="px-6 py-3.5 rounded-xl font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-all"
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
              >
                Browse All
              </button>
            </div>
          </div>

          {/* Emoji illustration */}
          <div
            key={`emoji-${current}`}
            className="hidden md:flex items-center justify-center text-[160px] select-none"
            style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            {slide.emoji}
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── DELIVERY STRIP ── */}
      <div className="bg-[#f8c42a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-center gap-3">
          <Zap size={16} className="fill-[#1c1c1c] text-[#1c1c1c]" />
          <p className="text-xs md:text-sm font-bold text-[#1c1c1c] tracking-wide">
            FREE DELIVERY &nbsp;·&nbsp; 4 HOURS EXPRESS &nbsp;·&nbsp; BEST PRICES GUARANTEED &nbsp;·&nbsp; 7-DAY EASY RETURNS
          </p>
          <Zap size={16} className="fill-[#1c1c1c] text-[#1c1c1c]" />
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.label}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-50 border border-gray-200 group-hover:border-[#0c831f] group-hover:bg-green-50 flex items-center justify-center text-2xl md:text-3xl transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                  {cat.emoji}
                </div>
                <span className="text-[10px] md:text-xs font-semibold text-gray-600 group-hover:text-[#0c831f] transition-colors whitespace-nowrap">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── OFFER BANNERS ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-5 md:p-7 flex items-center justify-between overflow-hidden relative">
          <div className="absolute right-0 top-0 w-48 h-full bg-white/5 rounded-l-full" />
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Flash Deal</p>
            <p className="text-white text-xl md:text-2xl font-extrabold leading-tight">Combo Offer<br/>Up to <span className="text-yellow-300">55% OFF</span></p>
            <p className="text-white/60 text-xs mt-1.5">Atta + Besan + Sugar + Oil</p>
            <button className="mt-3 bg-white text-green-800 text-xs font-extrabold px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors">
              Shop Now →
            </button>
          </div>
          <span className="text-6xl md:text-7xl select-none">🎁</span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
            <span className="text-4xl">🥛</span>
            <div>
              <p className="font-bold text-gray-800 text-sm">Fresh Dairy</p>
              <p className="text-xs text-gray-500">From ₹29 onwards</p>
              <a href="#" className="text-xs text-[#0c831f] font-bold mt-1 inline-block">Shop →</a>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
            <span className="text-4xl">🧴</span>
            <div>
              <p className="font-bold text-gray-800 text-sm">Personal Care</p>
              <p className="text-xs text-gray-500">Min. 30% off on top brands</p>
              <a href="#" className="text-xs text-[#0c831f] font-bold mt-1 inline-block">Shop →</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default Hero;