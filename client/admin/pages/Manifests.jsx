import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Loader2, Mail, Phone, Search } from "lucide-react";
import api from "../../src/utils/adminApi";
import { toast } from "../../src/utils/toast";

const ITEMS_PER_PAGE = 10;

export default function Manifests() {
  const [manifests, setManifests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchManifests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/manifests/admin");
      setManifests(res.data.manifests || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load manifests.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManifests();
  }, [fetchManifests]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (!s) return manifests;
    return manifests.filter((item) =>
      item.fullName?.toLowerCase().includes(s) ||
      item.email?.toLowerCase().includes(s) ||
      item.projectType?.toLowerCase().includes(s)
    );
  }, [manifests, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const markReviewed = useCallback(async (id) => {
    try {
      const res = await api.put(`/manifests/admin/${id}/review`);
      setManifests((prev) =>
        prev.map((item) => (item._id === id ? res.data.manifest : item))
      );
      toast.success("Manifest marked as reviewed.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update manifest.");
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Project Manifests</h1>
          <p className="text-sm text-stone-500 mt-1 italic">
            Customer inquiries submitted from the contact page.
          </p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or project type..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Loading manifests...</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Client</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Project</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Submitted</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</th>
                <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-stone-400 italic text-sm">
                    No manifests found.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item._id} className="align-top">
                    <td className="p-5">
                      <p className="text-sm font-bold text-stone-900">{item.fullName}</p>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-1">
                        <Mail size={12} className="text-amber-600" /> {item.email}
                      </p>
                      {item.phone && (
                        <p className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-1">
                          <Phone size={12} className="text-amber-600" /> {item.phone}
                        </p>
                      )}
                    </td>
                    <td className="p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-700">{item.projectType}</p>
                      <p className="text-sm text-stone-600 leading-relaxed mt-2">{item.projectDetails}</p>
                    </td>
                    <td className="p-5 text-sm text-stone-600">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
                        item.status === "reviewed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        <ClipboardList size={12} />
                        {item.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => markReviewed(item._id)}
                        disabled={item.status === "reviewed"}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 size={12} />
                        Mark Reviewed
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && filtered.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest">
            Showing <span className="text-stone-700 font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="text-stone-700 font-bold">{filtered.length}</span> manifests
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
