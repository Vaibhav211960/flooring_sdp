import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "../utils/toast";
import {
  Home as HomeIcon, ChevronRight, Package, Truck, CreditCard, Download,
  ArrowLeft, CheckCircle2, MapPin, User, Phone, Hash, Loader2, XCircle,
  AlertTriangle, RotateCcw, ShieldAlert,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductFeedbackPanel from "../components/ProductFeedbackPanel";
import api from "../utils/api";
import { useCart } from "../context/CartContext";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });

/* ─────────────────────────────────────────────
   Refund pill copy
───────────────────────────────────────────── */
const getRefundCopy = (order) => {
  const rs = order.refundStatus || (order.paymentMode === "COD" ? "not_required" : "pending");
  const titles = {
    initiated: "Refund Initiated",
    completed: "Refund Completed",
    not_required: "Refund Not Required",
    pending: "Refund Pending",
  };
  const descs = {
    initiated: `Your refund has been initiated${order.refundInitiatedAt ? ` on ${fmtDate(order.refundInitiatedAt)}` : ""}.`,
    completed: "Your refund has been completed successfully.",
    not_required: "No charge was made for this order, so no refund is required.",
    pending: "Your refund request is waiting for admin initiation.",
  };
  return { title: titles[rs] ?? titles.pending, desc: descs[rs] ?? descs.pending, status: rs };
};

/* ─────────────────────────────────────────────
   USER-CANCELLED BANNER
   Warm amber-toned — "you chose this"
───────────────────────────────────────────── */
const UserCancelledBanner = ({ order }) => {
  const { title: refundTitle, desc: refundDesc } = getRefundCopy(order);

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-100 overflow-hidden shadow-sm">
      {/* Top accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-300 via-amber-500 to-orange-400" />

      <div className="p-8 md:p-10">
        {/* Header row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
            <RotateCcw size={30} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-100">
                Cancelled by You
              </span>
              <span className="px-2.5 py-1 bg-stone-50 text-stone-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-stone-100">
                #{order._id.slice(-6).toUpperCase()}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              You cancelled this order.
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xl">
              This order was cancelled at your request on{" "}
              <span className="font-semibold text-stone-700">
                {fmtDate(order.cancelledAt || order.updatedAt)}
              </span>
              . We hope to serve you again soon.
            </p>
          </div>
        </div>

        <div className="border-t border-stone-100 my-6" />

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "💳", title: refundTitle, desc: refundDesc },
            {
              icon: "🔁",
              title: "Changed Your Mind?",
              desc: "Place a fresh order anytime — your cart is always ready.",
            },
            {
              icon: "💬",
              title: "Questions?",
              desc: "Our support team is happy to help if you need any clarification.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-700 mb-1">{item.title}</p>
              <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/products"
            className="px-6 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all active:scale-95"
          >
            Browse Products
          </Link>
          <Link
            to="/order-history"
            className="px-6 py-3 bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-stone-200 transition-all active:scale-95"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ADMIN-CANCELLED BANNER
   Deep red-tone — "something went wrong on our end"
───────────────────────────────────────────── */
const AdminCancelledBanner = ({ order }) => {
  const { title: refundTitle, desc: refundDesc } = getRefundCopy(order);

  return (
    <div className="bg-white rounded-2xl border-2 border-red-100 overflow-hidden shadow-sm">
      {/* Top accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-400" />

      <div className="p-8 md:p-10">
        {/* Header row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center shrink-0 border border-red-100">
            <ShieldAlert size={30} className="text-red-500" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-100">
                Cancelled by Admin
              </span>
              <span className="px-2.5 py-1 bg-stone-50 text-stone-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-stone-100">
                #{order._id.slice(-6).toUpperCase()}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              We sincerely apologise for the inconvenience.
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xl">
              Your order was cancelled by our team. This may have occurred due to a{" "}
              <span className="font-semibold text-stone-700">
                stock issue, logistics constraint, or payment verification failure.
              </span>{" "}
              We are sorry for the disruption.
            </p>

            {/* Admin cancellation reason pill */}
            {order.cancelReason && (
              <div className="mt-4 inline-flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl max-w-xl">
                <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 leading-relaxed">
                  <span className="font-bold uppercase tracking-wider">Reason: </span>
                  {order.cancelReason}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-stone-100 my-6" />

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "💳", title: refundTitle, desc: refundDesc },
            {
              icon: "📞",
              title: "Need Assistance?",
              desc: "Contact our support team if you have any questions about this cancellation.",
            },
            {
              icon: "🛒",
              title: "Shop Again",
              desc: "Browse our catalogue for similar premium flooring products.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-700 mb-1">{item.title}</p>
              <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/products"
            className="px-6 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all active:scale-95"
          >
            Browse Products
          </Link>
          <Link
            to="/order-history"
            className="px-6 py-3 bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-stone-200 transition-all active:scale-95"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Router: picks the right banner
───────────────────────────────────────────── */
const CancellationBanner = ({ order }) => {
  // `cancelledBy` should be "user" | "admin" from your backend.
  // Fall back gracefully: if the field is absent, treat as admin cancel
  // (since historically all cancels were admin-side in the old code).
  const cancelledByUser =
    !order.cancelledBy || order.cancelledBy === "user" || order.cancelledBy === "customer";

  return cancelledByUser ? (
    <UserCancelledBanner order={order} />
  ) : (
    <AdminCancelledBanner order={order} />
  );
};

/* ─────────────────────────────────────────────
   StatusStep (unchanged)
───────────────────────────────────────────── */
const StatusStep = ({ icon, label, sub, active = false }) => (
  <div className="flex flex-col items-center gap-2 relative z-10">
    <div
      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
        active
          ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200"
          : "bg-white border-stone-100 text-stone-300"
      }`}
    >
      {icon}
    </div>
    <div className="text-center">
      <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-stone-900" : "text-stone-400"}`}>
        {label}
      </p>
      <p className="text-[9px] text-stone-400 font-medium">{sub}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function OrderDetails() {
  const { orderId } = useParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const hasCheckoutData =
      localStorage.getItem("checkout_details") ||
      localStorage.getItem("checkout_products");
    localStorage.removeItem("checkout_details");
    localStorage.removeItem("checkout_products");
    localStorage.removeItem("temp_shipping_address");
    localStorage.removeItem("pending_product");
    localStorage.removeItem("pending_qty");
    if (hasCheckoutData) clearCart().catch(() => {});
  }, []); // eslint-disable-line

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data.order);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const generateInvoice = useCallback(async () => {
    if (!order) return;
    try {
      setIsGenerating(true);
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF();

      doc.setFillColor(28, 25, 23);
      doc.rect(0, 0, 210, 45, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("serif", "bold");
      doc.setFontSize(26);
      doc.text("INSCAPE LAYERS", 14, 25);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);
      doc.text("Engineered for life. Premium Flooring Solutions.", 14, 32);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(251, 191, 36);
      doc.text("OFFICIAL MATERIAL MANIFEST", 196, 25, { align: "right" });
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`Ref: ${order._id.toUpperCase()}`, 196, 32, { align: "right" });

      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("FROM:", 14, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        ["Inscape Layers India", "123 Market Square,", "Ahmedabad, GJ 380001", "Contact: +91 98765 43210", "Email: sales@inscapefloors.com"],
        14, 67,
      );
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("SHIP TO / BILL TO:", 120, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const addressLines = doc.splitTextToSize(order.shippingAddress.address, 75);
      doc.text(
        [order.shippingAddress.fullName.toUpperCase(), ...addressLines, `Pincode: ${order.shippingAddress.pincode}`, `Contact: ${order.shippingAddress.contact}`],
        120, 67,
      );

      autoTable(doc, {
        startY: 100,
        head: [["SR.", "DESCRIPTION OF MATERIAL", "QTY", "UNIT RATE", "TOTAL AMOUNT"]],
        body: order.items.map((item, i) => [
          i + 1,
          { content: item.productName.toUpperCase(), styles: { fontStyle: "bold" } },
          item.units,
          `INR ${Number(item.pricePerUnit).toLocaleString("en-IN")}`,
          `INR ${Number(item.totalAmount).toLocaleString("en-IN")}`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [28, 25, 23], textColor: [255, 255, 255], fontSize: 9, halign: "center" },
        columnStyles: { 0: { halign: "center", cellWidth: 10 }, 2: { halign: "center", cellWidth: 20 }, 3: { halign: "right", cellWidth: 40 }, 4: { halign: "right", cellWidth: 40 } },
        styles: { fontSize: 8, cellPadding: 4 },
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFillColor(252, 251, 247);
      doc.setDrawColor(231, 229, 228);
      doc.rect(120, finalY - 5, 76, 25, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text("NET SETTLEMENT:", 125, finalY + 5);
      doc.setTextColor(180, 83, 9);
      doc.text(`INR ${Number(order.netBill).toLocaleString("en-IN")}`, 190, finalY + 5, { align: "right" });
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Payment: ${order.paymentMode} - ${paymentReference ? paymentReference.substring(0, 10) : "SECURED"}`,
        125, finalY + 13,
      );

      doc.setDrawColor(200);
      doc.line(14, 272, 196, 272);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(28, 25, 23);
      doc.text("QUALITY ASSURED", 14, 278);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(120);
      doc.text("All Inscape products are industry certified for durability and meet global safety standards.", 14, 282);
      doc.text("Page 1/1 - System Generated Material Manifest for Inscape Layers Customer Fulfillment.", 105, 290, { align: "center" });

      doc.save(`Inscape_Invoice_${order._id.slice(-6)}.pdf`);
      toast.success("Invoice downloaded.");
    } catch {
      toast.error("Install jsPDF to download invoices: npm install jspdf jspdf-autotable");
    } finally {
      setIsGenerating(false);
    }
  }, [order]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-amber-600" size={40} />
          <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Manifest...</p>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Not found ── */
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-6 py-24 border-2 border-dashed border-stone-200 rounded-2xl px-12">
            <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
              <Package className="h-6 w-6 text-stone-400" />
            </div>
            <p className="font-serif text-2xl text-stone-400 italic">Order not found</p>
            <Link to="/order-history" className="inline-block text-amber-700 font-bold uppercase tracking-[0.2em] text-[10px] hover:underline">
              Return to Logs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Derived state ── */
  const isCancelled = order.orderStatus === "cancelled" || order.orderStatus === "cancel";
  const isDelivered = order.orderStatus === "delivered";
  const cancelledByUser = order.cancelledBy === "user" || order.cancelledBy === "customer";
  const paymentReference =
    typeof order.paymentId === "string" ? order.paymentId : order.paymentId?._id || "";
  const refundStatus = order.refundStatus || (order.paymentMode === "COD" ? "not_required" : "pending");
  const refundSummary =
    refundStatus === "initiated"
      ? `Refund initiated${order.refundInitiatedAt ? ` on ${fmtDate(order.refundInitiatedAt)}` : ""}.`
      : refundStatus === "completed"
      ? "Refund completed successfully."
      : refundStatus === "not_required"
      ? "No charge was made for this order."
      : "Refund is pending admin initiation.";

  /* ── Hero accent colour ── */
  const heroClass = isCancelled
    ? cancelledByUser
      ? "bg-stone-900"       // amber-tinged neutral for user cancel
      : "bg-red-950"          // deep red for admin cancel
    : "bg-stone-900";

  const orderIdAccent = isCancelled
    ? cancelledByUser ? "text-amber-400" : "text-red-400"
    : "text-amber-400";

  /* ── Cancelled status badge ── */
  const cancelBadge = isCancelled && (
    <span
      className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${
        cancelledByUser
          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
          : "bg-red-500/20 text-red-300 border-red-500/30"
      }`}
    >
      {cancelledByUser ? <RotateCcw size={10} /> : <XCircle size={10} />}
      {cancelledByUser ? "Cancelled by You" : "Cancelled by Admin"}
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className={`${heroClass} text-stone-50 border-b border-amber-900/20 transition-colors`}>
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <Link to="/order-history" className="hover:text-white transition-colors">History</Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Detail Log</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500">Order Details</p>
                {cancelBadge}
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-2">
                Order <span className={`italic ${orderIdAccent}`}>#{order._id.slice(-6)}</span>
              </h1>
              <p className="text-stone-400 text-sm uppercase tracking-wider font-medium">
                {order.paymentMode} Transaction · {fmtDate(order.orderDate || order.createdAt)}
              </p>
            </div>

            {!isCancelled && (
              <button
                onClick={generateInvoice}
                disabled={isGenerating}
                className="flex items-center gap-2 h-12 px-6 border border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin h-3 w-3" /> : <Download size={14} />}
                {isGenerating ? "Generating..." : "Download Invoice"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Main ── */}
      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left column */}
          <div className="lg:col-span-8 space-y-8">
            {isCancelled ? (
              <CancellationBanner order={order} />
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                <div className="px-0 pb-6 border-b border-stone-100 mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 flex items-center gap-2">
                    <Truck size={14} /> Delivery Progress
                  </p>
                </div>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-0 w-full h-[2px] bg-stone-100 -z-0" />
                  <StatusStep icon={<CheckCircle2 size={18} />} label="Confirmed" sub="Placed" active />
                  <StatusStep icon={<Package size={18} />} label="Processing" sub="Warehouse" active={order.orderStatus !== "pending"} />
                  <StatusStep icon={<Truck size={18} />} label="In Transit" sub="Shipping" active={order.orderStatus === "arriving" || isDelivered} />
                  <StatusStep icon={<HomeIcon size={18} />} label="Delivered" sub="Project Site" active={isDelivered} />
                </div>
              </div>
            )}

            {/* Product Manifest */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">Product Manifest</p>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  Tx ID: {paymentReference ? paymentReference.slice(-8) : "-"}
                </span>
              </div>
              <div className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center group">
                      <div
                        className={`h-20 w-20 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                          isCancelled
                            ? cancelledByUser
                              ? "bg-amber-50 text-amber-300"
                              : "bg-red-50 text-red-300"
                            : "bg-stone-100 text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-600"
                        }`}
                      >
                        <Package size={32} strokeWidth={1} />
                      </div>
                      <div className="flex-grow text-center md:text-left">
                        <h4
                          className={`font-bold text-lg leading-tight mb-1 ${
                            isCancelled ? "text-stone-400 line-through decoration-stone-300" : "text-stone-800"
                          }`}
                        >
                          {item.productName}
                        </h4>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                          Product Ref: {item.productId?.slice(-6) || "-"}
                        </p>
                      </div>
                      <div className="text-center md:text-right shrink-0">
                        <p className="text-xs text-stone-500 mb-1 font-medium italic">
                          ₹{item.pricePerUnit} per unit × {item.units}
                        </p>
                        <p className={`font-serif font-bold text-xl ${isCancelled ? "text-stone-400" : "text-stone-900"}`}>
                          ₹{item.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {!isCancelled && (
                      <div className="mt-6">
                        <ProductFeedbackPanel
                          productId={item.productId}
                          productName={item.productName}
                          orderDelivered={isDelivered}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Destination */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 flex items-center gap-2">
                  <MapPin size={14} /> Destination Details
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <User size={16} className="text-amber-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400 tracking-widest mb-1">Recipient</p>
                    <p className="text-sm font-bold text-stone-800 uppercase italic">{order.shippingAddress.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-amber-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400 tracking-widest mb-1">Site Address</p>
                    <p className="text-sm font-medium text-stone-600 leading-relaxed uppercase italic">
                      {order.shippingAddress.address}
                      {order.shippingAddress.landmark && <><br />Landmark: {order.shippingAddress.landmark}</>}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-stone-300 shrink-0" />
                    <span className="text-xs font-bold text-stone-700">{order.shippingAddress.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-stone-300 shrink-0" />
                    <span className="text-xs font-bold text-stone-700">{order.shippingAddress.pincode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div
              className={`${
                isCancelled
                  ? cancelledByUser
                    ? "bg-stone-900"
                    : "bg-red-950"
                  : "bg-stone-900"
              } text-stone-50 rounded-2xl shadow-xl overflow-hidden transition-colors`}
            >
              <div className="px-6 py-5 border-b border-stone-800">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                  <CreditCard size={14} /> Financial Summary
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400 font-medium">Gross Bill</span>
                  <span className={`font-bold ${isCancelled ? "line-through text-stone-500" : ""}`}>
                    ₹{order.netBill.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400 font-medium">Status</span>
                  <span
                    className={`font-bold uppercase tracking-widest text-[10px] ${
                      isCancelled
                        ? cancelledByUser ? "text-amber-400" : "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {isCancelled
                      ? cancelledByUser ? "Cancelled by You" : "Cancelled by Admin"
                      : "Confirmed"}
                  </span>
                </div>

                {isCancelled ? (
                  <div className="pt-4 border-t border-stone-800">
                    <p className="text-[10px] text-stone-400 leading-relaxed">{refundSummary}</p>
                    {order.refundNote && (
                      <p className="mt-3 text-[10px] text-stone-500 leading-relaxed">
                        Note: {order.refundNote}
                      </p>
                    )}
                    {/* Cancellation attribution note */}
                    <div
                      className={`mt-4 px-3 py-2 rounded-lg border text-[9px] font-bold uppercase tracking-widest ${
                        cancelledByUser
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      {cancelledByUser
                        ? "⟵ Cancelled at customer's request"
                        : "⚠ Cancelled by Inscape team"}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-stone-800 flex justify-between items-end">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Total Amount</span>
                    <span className="text-3xl font-serif font-bold text-amber-500">₹{order.netBill.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/order-history"
              className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 hover:text-stone-900 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to History
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}