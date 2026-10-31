import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import Logo from "../../assets/home/logo.png";
import Shopbtn from "../../assets/home/shopping-cart.png";
import { getCartCount } from "../../utils/cart";

const Navbar = () => {
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const mobileInputRef = useRef(null);

  useEffect(() => {
    setCartCount(getCartCount());
  }, [location.pathname]);

  useEffect(() => {
    setMobileSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileSearchOpen) setTimeout(() => mobileInputRef.current?.focus(), 50);
  }, [mobileSearchOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-8 h-14 md:h-16 flex items-center gap-2 md:gap-4">
          <Link to="/" className="flex items-center shrink-0 group">
            <img
              src={Logo} alt="Logo"
              className="h-8 md:h-10 transition-transform duration-200 group-hover:scale-105"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </Link>

          <div className={`hidden md:flex flex-1 items-center gap-2.5 bg-gray-100 rounded-xl px-4 h-10 border-2 transition-all duration-200 ${
            searchFocused ? "border-[#0c831f] bg-white shadow-sm" : "border-transparent hover:border-gray-300"
          }`}>
            <Search size={16} className={`shrink-0 transition-colors ${searchFocused ? "text-[#0c831f]" : "text-gray-400"}`} />
            <input
              type="text" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search "atta, milk, eggs..."'
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 w-full font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          <button
            className="md:hidden ml-auto p-2 rounded-xl text-gray-600 hover:text-[#0c831f] hover:bg-gray-100 transition-all"
            onClick={() => setMobileSearchOpen((v) => !v)} aria-label="Search"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          <Link
            to="/my-order"
            className={`relative flex items-center gap-1.5 shrink-0 font-bold px-3 md:px-4 h-9 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
              location.pathname === "/my-order" ? "bg-[#0c831f] border-[#0c831f] text-white" : "border-[#0c831f] text-[#0c831f] hover:bg-[#0c831f] hover:text-white"
            }`}
          >
            <img
              src={Shopbtn} alt="Cart"
              className={`h-4 w-4 md:h-5 md:w-5 object-contain transition-all ${location.pathname === "/my-order" ? "brightness-0 invert" : ""}`}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <span className="hidden md:inline text-sm">My Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#0c831f] text-white text-[9px] font-extrabold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${mobileSearchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-3 pb-3 pt-1">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-10 border-2 border-transparent focus-within:border-[#0c831f] focus-within:bg-white transition-all shadow-sm">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                ref={mobileInputRef} type="text"
                placeholder='Search "atta, milk, eggs..."'
                className="bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 w-full font-medium"
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
