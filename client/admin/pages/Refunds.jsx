import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeIndianRupee, Loader2, RefreshCcw, Search } from "lucide-react";
import api from "../../src/utils/adminApi";
import { toast } from "../../src/utils/toast";

const ITEMS_PER_PAGE = 10;

export default function Refunds() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [workingId, setWorkingId] = useState("");

  const fetchRefunds = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/orders/admin/refunds");
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load refund queue.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (!s) return orders;
    return orders.filter((order) =>
      order._id?.toLowerCase().includes(s) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(s) ||
      order.userId?.email?.toLowerCase().includes(s)
    );
  }, [orders, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const initiateRefund = useCallback((order) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-stone-800">
          Initiate refund for <strong>{order.shippingAddress?.fullName || "customer"}</strong>?
        </p>
        <p className="text-xs text-stone-500">
          Order #{order._id.slice(-8).toUpperCase()} will be marked as refund initiated.
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                setWorkingId(order._id);
                const res = await api.put(`/orders/admin/refunds/${order._id}/initiate`, {
                  note: "Refund initiated by admin.",
                });
                setOrders((prev) =>
                  prev.map((item) => (item._id === order._id ? res.data.order : item))
                );
                toast.success("Refund initiated successfully.");
              } catch (err) {
                toast.error(err.response?.data?.message || "Failed to initiate refund.");
              } finally {
                setWorkingId("");
              }
            }}
            className="flex-1 px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all uppercase tracking-widest"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-200 transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Refund Queue</h1>
          <p className="text-sm text-stone-500 mt-1 italic">
            Review cancelled orders and initiate customer refunds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order, customer, or email..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all shadow-sm"
            />
          </div>
          <button
            onClick={fetchRefunds}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-50"
          >
            <RefreshCcw size={12} /> Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Loading refund queue...</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Order</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Customer</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Payment</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Refund</th>
                <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-stone-400 italic text-sm">
                    No cancelled orders found.
                  </td>
                </tr>
              ) : (
                paginated.map((order) => {
                  const refundDone = order.refundStatus === "initiated" || order.refundStatus === "completed";
                  const noRefund = order.refundStatus === "not_required";
                  return (
                    <tr key={order._id}>
                      <td className="p-5">
                        <p className="text-sm font-bold text-stone-900">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-[11px] text-stone-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>
                      <td className="p-5">
                        <p className="text-sm font-bold text-stone-900">{order.shippingAddress?.fullName || "Guest"}</p>
                        <p className="text-[11px] text-stone-500">{order.userId?.email || "No email available"}</p>
                      </td>
                      <td className="p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-600">{order.paymentMode}</p>
                        <p className="text-sm text-amber-700 font-bold flex items-center gap-1 mt-1">
                          <BadgeIndianRupee size={13} /> {order.netBill?.toLocaleString("en-IN")}
                        </p>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
                          refundDone
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : noRefund
                              ? "bg-stone-100 text-stone-600 border-stone-200"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          <AlertCircle size={12} />
                          {order.refundStatus.replace("_", " ")}
                        </span>
                        {order.refundInitiatedAt && (
                          <p className="text-[10px] text-stone-400 mt-2">
                            Initiated on {new Date(order.refundInitiatedAt).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => initiateRefund(order)}
                          disabled={refundDone || noRefund || workingId === order._id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {workingId === order._id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                          Initiate Refund
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
