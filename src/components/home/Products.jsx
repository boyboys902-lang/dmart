import { useState } from "react";
import { useProducts } from "../../context/useProducts";
import ProductCards from "./ProductCards";
import { SlidersHorizontal, Flame, Tag, Star, TrendingUp } from "lucide-react";

const filters = [
  { label: "All", icon: <Flame size={13} /> },
  { label: "Best Sellers", icon: <TrendingUp size={13} /> },
  { label: "Top Rated", icon: <Star size={13} /> },
  { label: "Biggest Deals", icon: <Tag size={13} /> },
];

const Products = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const { products, loading } = useProducts();

  // Simple filter logic — extend as needed
  const filtered = products.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Top Rated") return Number(item.rating?.toString().split(" ")[0]) >= 4;
    if (activeFilter === "Biggest Deals") return parseInt(item.discount) >= 40;
    return true; // Best Sellers — show all for now
  });

  return (
    <section className="bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">

        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame size={20} className="text-red-500 fill-red-500" />
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                Today's Best Deals
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              {filtered.length} products &nbsp;·&nbsp; Fresh combos, daily essentials & more
              {loading && <span className="text-gray-400"> · syncing catalogue…</span>}
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <SlidersHorizontal size={15} className="text-gray-400 shrink-0" />
            {filters.map((f) => (
              <button
                key={f.label}
                onClick={() => setActiveFilter(f.label)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all duration-150 ${
                  activeFilter === f.label
                    ? "bg-[#0c831f] text-white border-[#0c831f] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#0c831f] hover:text-[#0c831f]"
                }`}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── PRODUCT GRID ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🛒</p>
            <p className="font-semibold text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((value) => (
              <ProductCards key={value.id} value={value} />
            ))}
          </div>
        )}

        {/* ── LOAD MORE ── */}
        {/* {filtered.length > 0 && (
          <div className="flex justify-center mt-10">
            <button className="flex items-center gap-2 border-2 border-[#0c831f] text-[#0c831f] font-bold text-sm px-8 py-3 rounded-xl hover:bg-[#0c831f] hover:text-white transition-all duration-200 active:scale-95">
              Load More Products
            </button>
          </div>
        )} */}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default Products;