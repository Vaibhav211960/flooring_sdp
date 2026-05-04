import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Home as HomeIcon,
  Search,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import api from "../utils/api";
import { toast } from "../utils/toast";

export default function CategoryProducts() {
  const ITEMS_PER_PAGE = 8;
  const { catId } = useParams();
  const [products, setProducts] = useState([]);
  const [subcategory, setSubcategory] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCategoryData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [subRes, prodRes] = await Promise.all([
        api.get(`/subcategories/${catId}`),
        api.get(`/products/subcategory/${catId}`),
      ]);
      if (subRes.data.subCategory) setSubcategory(subRes.data.subCategory);
      setProducts((prodRes.data.products || []).filter((item) => item.isActive !== false));
    } catch (err) {
      const message = err.response?.data?.message || "Could not load products for this collection.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [catId]);

  useEffect(() => {
    if (catId) fetchCategoryData();
  }, [catId, fetchCategoryData]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return products;
    return products.filter((product) =>
      product.name?.toLowerCase().includes(query) ||
      product.materialType?.toLowerCase().includes(query) ||
      product.finish?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, catId]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-4" />
          <p className="text-stone-400 text-sm italic tracking-widest">Loading Collection...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!subcategory?._id) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-serif text-lg text-stone-700">This collection is unavailable.</p>
          <Link
            to="/categories"
            className="text-amber-700 text-xs font-bold uppercase tracking-widest hover:text-amber-600 transition-colors"
          >
            Back to Collections
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <Link to="/categories" className="hover:text-white transition-colors">
              Collections
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">{subcategory?.name || "Series"}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-end">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
                Series Catalog
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight capitalize">
                {subcategory?.name || "Architectural Series"}
              </h1>
              <p className="text-stone-400 text-sm md:text-base leading-relaxed">
                {subcategory?.description || "Explore our high-performance range of architectural solutions tailored for modern design."}
              </p>
            </div>

            <div className="hidden md:flex justify-end">
              <div className="bg-stone-800/50 backdrop-blur-md border border-stone-700 p-6 rounded-2xl flex gap-8 items-center">
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-stone-500 mb-1">Total Variants</span>
                  <span className="text-2xl font-mono text-white font-bold">{filteredProducts.length}</span>
                </div>
                <div className="w-px bg-stone-700 self-stretch" />
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-stone-500 mb-1">Collection Type</span>
                  <span className="text-2xl font-mono text-amber-500 font-bold">CURATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[64px] z-30 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={`Search inside ${subcategory?.name || "this collection"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-stone-100 py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-stone-400 focus:border-amber-500 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500">
            <LayoutGrid className="h-4 w-4" />
            <span><span className="text-stone-900">{filteredProducts.length}</span> Products</span>
          </div>
        </div>
      </div>

      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6">
          {error ? (
            <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-red-600 font-medium text-sm mb-4">{error}</p>
              <button
                onClick={fetchCategoryData}
                className="px-6 h-10 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length > ITEMS_PER_PAGE && (
                <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest">
                    Showing{" "}
                    <span className="text-stone-700 font-bold">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                    </span>
                    {" "}of{" "}
                    <span className="text-stone-700 font-bold">{filteredProducts.length}</span>
                    {" "}products
                  </p>

                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 hover:border-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      )
                      .reduce((acc, page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) acc.push(`gap-${page}`);
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item) =>
                        typeof item === "string" ? (
                          <span key={item} className="px-1.5 text-stone-300 text-xs select-none">...</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setCurrentPage(item)}
                            className={`w-9 h-9 rounded-xl text-[11px] font-bold transition-all border ${
                              currentPage === item
                                ? "bg-stone-900 text-amber-400 border-stone-900 shadow-md"
                                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 hover:border-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl">
              <h3 className="font-serif text-xl text-stone-400 mb-4">
                {searchQuery ? "No products match your search." : "No products in this series."}
              </h3>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-amber-700 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-amber-600 transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  to="/categories"
                  className="text-amber-700 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-amber-600 transition-colors"
                >
                  Return to all collections
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
