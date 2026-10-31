import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, LogOut, Settings, Code, IndianRupee, Package } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const navItems = [
    { to: "/products", icon: Package, label: "Products" },
    { to: "/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/upi-settings", icon: IndianRupee, label: "UPI Settings" },
    { to: "/meta-pixel", icon: Code, label: "Meta Pixel" },
    { to: "/user-settings", icon: Settings, label: "User Settings" },
  ];

  return (
    <>
      <button
        className="sm:hidden fixed top-4 left-4 z-30 p-3 bg-teal-600 text-white rounded-full"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-30 w-64 transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        <div className="p-6 h-full flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-teal-600 mb-8 uppercase">
              Admin Portal
            </h2>

            <nav className="space-y-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 py-3 px-4 rounded-lg ${
                      isActive
                        ? "bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-lg"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-20 sm:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default AdminSidebar;
