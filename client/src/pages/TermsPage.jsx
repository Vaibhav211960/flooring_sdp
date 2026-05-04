import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home as HomeIcon, FileText } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const TERMS_SECTIONS = [
  {
    title: "Catalog Accuracy",
    body: "Product visuals, finishes, and descriptions are presented as accurately as possible, but slight variation can occur due to screen settings, batch differences, and photography.",
  },
  {
    title: "Order Confirmation",
    body: "Orders are confirmed after availability, pricing, and shipping details are reviewed. If anything requires adjustment, our team contacts the customer before dispatch.",
  },
  {
    title: "Delivery Responsibility",
    body: "Customers should verify delivery access and inspect shipments on arrival. Reporting visible issues quickly helps us resolve support cases faster.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="border-b border-amber-900/20 bg-stone-900 text-stone-50">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
          <nav className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
            <Link to="/" className="flex items-center gap-1 transition-colors hover:text-white">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Terms</span>
          </nav>

          <div className="max-w-3xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500">
              Purchase Terms
            </p>
            <h1 className="mb-5 font-serif text-4xl font-bold leading-tight md:text-6xl">
              Clear expectations for browsing, ordering, and delivery.
            </h1>
            <p className="text-sm leading-relaxed text-stone-400 md:text-base">
              These simple terms set expectations around product presentation, order review, and delivery responsibility so customers can shop with fewer surprises.
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 py-14 md:py-20">
        <div className="container max-w-5xl mx-auto px-6 space-y-6">
          {TERMS_SECTIONS.map((section) => (
            <article key={section.title} className="rounded-[1.75rem] border border-stone-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">{section.body}</p>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
