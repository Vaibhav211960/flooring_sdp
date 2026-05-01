import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Loader2,
} from "lucide-react";
import api from "../utils/api";

export default function Footer() {
  const [collections, setCollections] = useState([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoadingCollections(true);
      const res = await api.get("/subcategories");
      setCollections((res.data.subCategories || []).slice(0, 3));
    } catch {
      setCollections([]);
    } finally {
      setIsLoadingCollections(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="container max-w-7xl mx-auto px-6 py-16">


        <div className="grid grid-cols-1 gap-10 pt-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-stone-900">
                <span className="font-serif text-xs font-bold text-white">I</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Inscape Layers
              </h3>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-stone-500">
              Premium flooring, direct from manufacturers to your home with a cleaner buying experience from browse to delivery.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-[10px] font-bold uppercase tracking-widest text-stone-900">
              Collections
            </h4>
            <ul className="space-y-3 text-sm text-stone-500">
              {isLoadingCollections ? (
                <li className="flex items-center gap-2 text-stone-400">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  <span>Loading collections...</span>
                </li>
              ) : collections.length > 0 ? (
                collections.map((collection) => (
                  <li key={collection._id || collection.id}>
                    <Link
                      to={`/category/subcategory/${collection._id || collection.id}`}
                      className="transition-colors hover:text-amber-800"
                    >
                      {collection.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    to="/categories"
                    className="transition-colors hover:text-amber-800"
                  >
                    View all collections
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-[10px] font-bold uppercase tracking-widest text-stone-900">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li>
                <Link
                  to="/shipping"
                  className="transition-colors hover:text-amber-800"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="transition-colors hover:text-amber-800"
                >
                  FAQ Assistant
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="transition-colors hover:text-amber-800"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-[10px] font-bold uppercase tracking-widest text-stone-900">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <span>
                  123 Market Square,
                  <br />
                  Ahmedabad, GJ 380001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-amber-700" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-amber-700" />
                <span>inscapefloors123@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-8 md:flex-row">
          <p className="text-xs text-stone-400">
            &copy; {new Date().getFullYear()} Inscape Layers. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-stone-400">
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-widest">
                Secure Payments
              </span>
            </div>
            <Link
              to="/privacy"
              className="text-[10px] uppercase tracking-widest transition-colors hover:text-stone-700"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-[10px] uppercase tracking-widest transition-colors hover:text-stone-700"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
