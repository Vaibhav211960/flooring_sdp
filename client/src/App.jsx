// App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { TooltipProvider } from "./ui/tooltip.jsx";
import { Toaster } from "./ui/Toaster.jsx";

// USER PAGES
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Profile from "./pages/Profile.jsx";
import Orders from "./pages/Order.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import BuyNow from "./pages/buyNow.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ShippingPolicy from "./pages/ShippingPolicy.jsx";
import FAQSupport from "./pages/FAQSupport.jsx";
import PrivacyNotice from "./pages/PrivacyNotice.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BuyAll from "./pages/BuyAll.jsx";
import Payment from "./pages/Pyment.jsx";

// ADMIN LAYOUT + PAGES
import AdminLayout from "../admin/AdminLayout.jsx";
import Dashboard from "../admin/pages/Dashboard.jsx";
import AdminCategories from "../admin/pages/Categories.jsx";
import AdminSubCategories from "../admin/pages/Subcategories.jsx";
import AdminProducts from "../admin/pages/Products.jsx";
import AdminOrders from "../admin/pages/Orders.jsx";
import Customers from "../admin/pages/Customer.jsx";
import AdminPayments from "../admin/pages/Payments.jsx";
import AdminFeedback from "../admin/pages/Feedbacks.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Inventory from "../admin/pages/Inventory.jsx";
import Reports from "../admin/pages/Reports.jsx";
import Refunds from "../admin/pages/Refunds.jsx";
import Manifests from "../admin/pages/Manifests.jsx";

const queryClient = new QueryClient();
const CategoryPage = lazy(() => import("./pages/CategoryPage.jsx"));
const SubCategoryProducts = lazy(() => import("./pages/SubCategoryProducts.jsx"));
const Product = lazy(() => import("./pages/Product.jsx"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess.jsx"));

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center bg-stone-50">
      <div className="flex items-center gap-3 text-stone-500 text-sm font-medium">
        <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
        Loading page...
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* ================= USER ROUTES ================= */}
              <Route path="/" element={<Home />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/categories" element={<CategoryPage />} />
              <Route
                path="/category/subcategory/:catId"
                element={<SubCategoryProducts />}
              />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shipping" element={<ShippingPolicy />} />
              <Route path="/faq" element={<FAQSupport />} />
              <Route path="/privacy" element={<PrivacyNotice />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Product />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route path="/checkout/payment" element={<Payment />} />
              <Route path="/buy-all" element={
                <ProtectedRoute>
                  <BuyAll />
                </ProtectedRoute>
              } />
              <Route
                path="/order-success"
                element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-history"
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buy-now/:id"
                element={
                  <ProtectedRoute>
                    <BuyNow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token/*" element={<ResetPassword />} />

              {/* ================= ADMIN ROUTES ================= */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="subcategories" element={<AdminSubCategories />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="refunds" element={<Refunds />} />
                <Route path="manifests" element={<Manifests />} />
                <Route path="customers" element={<Customers />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* ================= 404 ================= */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </Router>
        </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
