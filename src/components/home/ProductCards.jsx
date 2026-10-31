import { Link } from "react-router-dom";
import { Star, ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";
import { addToCart } from "../../utils/cart";

const ProductCards = ({ value }) => {
  const {
    id,
    img,
    title,
    islogo,
    discount,
    original_price,
    offer_price,
    rating,
    ratings_count,
  } = value;

  const [added, setAdded] = useState(false);

  const ratingValue = Number(rating?.toString().split(" ")[0]) || 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(value, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link
      to={`/product-details/${id}`}
      className="group bg-white rounded-2xl border border-gray-200 hover:border-[#0c831f] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <div className="object-contain m-3 relative">
          <img src={img} alt={title} className="w-full h-full" />
        </div>

        {discount && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
            {discount}
          </span>
        )}

        <span className="absolute bottom-3.5 right-3.5 bg-[#f8c42a] text-[#1c1c1c] text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
          <Zap size={9} className="fill-[#1c1c1c]" /> 4 hours
        </span>
      </div>

      <div className="p-3 md:p-4 flex flex-col gap-2 flex-1">
        <p className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {title}
        </p>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={11}
                className={
                  star <= Math.round(ratingValue)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            ({ratings_count?.toLocaleString()})
          </span>
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-base md:text-lg font-extrabold text-gray-900">
            {offer_price}
          </span>
          <span className="text-xs text-gray-400 line-through">
            {original_price}
          </span>
          {discount && (
            <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded">
              {discount}
            </span>
          )}
        </div>

        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          🚚 <span>Free delivery</span>
        </p>

        <button
          onClick={handleAdd}
          className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
            added
              ? "bg-green-700 text-white"
              : "border-2 border-[#0c831f] text-[#0c831f] hover:bg-[#0c831f] hover:text-white"
          }`}
        >
          {added ? (
            "✔ Added"
          ) : (
            <>
              <ShoppingCart size={15} />
              Add to cart
            </>
          )}
        </button>
      </div>
    </Link>
  );
};

export default ProductCards;
