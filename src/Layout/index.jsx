import { Routes, BrowserRouter, Route } from "react-router-dom";
import Home from "../pages/Home";
import ProductDetails from "../pages/ProductDetails";
import ShoppingCart from "../pages/ShoppingCart";
import CheckoutPage from "../pages/CheckoutPage";
import ConfirmationModal from "../pages/ConfirmationModal";
import AdminLogin from "../pages/admin/AdminLogin";
import OrderManagement from "../pages/admin/OrderManagement";
import ViewOrder from "../pages/admin/ViewOrder";
import MyOrders from "../pages/MyOrders";
import MetaPixel from "../pages/admin/MetaPixel";
import UserSettings from "../pages/admin/UserSettings";
import UpiSettings from "../pages/admin/UpiSettings";
import ProtectedRoute from "../components/ProtectedRoute";
import ScrollToTop from "../components/global/ScrollToTop";
import DynamicMetaPixel from "../components/DynamicMetaPixel";
import ProductsProvider from "../context/ProductsProvider";
import ProductManagement from "../pages/admin/ProductManagement";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <p className="text-6xl font-extrabold text-gray-300 mb-4">404</p>
    <h1 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h1>
    <p className="text-sm text-gray-500 mb-6">The page you are looking for does not exist.</p>
    <Link to="/" className="bg-[#0c831f] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1a9e2e] transition-colors">
      Go Home
    </Link>
  </div>
);

const Layout = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <DynamicMetaPixel />
      <ProductsProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/shopping-cart/:id" element={<ShoppingCart />} />
          <Route path="/checkout/:id" element={<CheckoutPage />} />
          <Route path="/my-order" element={<MyOrders />} />
          <Route path="/thanku" element={<ConfirmationModal />} />

          <Route path="/chutya/nikal/dmart" element={<AdminLogin />} />

          <Route path="/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><ViewOrder /></ProtectedRoute>} />
          <Route path="/meta-pixel" element={<ProtectedRoute><MetaPixel /></ProtectedRoute>} />
          <Route path="/upi-settings" element={<ProtectedRoute><UpiSettings /></ProtectedRoute>} />
          <Route path="/user-settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ProductsProvider>
    </BrowserRouter>
  );
};

export default Layout;
