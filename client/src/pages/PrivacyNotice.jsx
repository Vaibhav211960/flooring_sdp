import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home as HomeIcon, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const PRIVACY_SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect the details customers share during account creation, checkout, and support inquiries, including contact information, shipping details, and order-related preferences.",
  },
  {
    title: "How We Use It",
    body: "Your data is used to process orders, coordinate deliveries, improve support, and communicate important order updates. We do not use it for unrelated purposes.",
  },
  {
    title: "Security",
    body: "We aim to protect customer data through secure systems, role-based access, and payment handling practices that limit unnecessary exposure of sensitive information.",
  },
];

export default function PrivacyNotice() {
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
            <span className="text-amber-500">Privacy Policy</span>
          </nav>

          <div className="max-w-3xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500">
              Data Transparency
            </p>
            <h1 className="mb-5 font-serif text-4xl font-bold leading-tight md:text-6xl">
              How we handle customer information with care.
            </h1>
            <p className="text-sm leading-relaxed text-stone-400 md:text-base">
              This summary explains what information we collect, why we use it, and how it supports safer ordering, delivery, and customer service.
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 py-14 md:py-20">
        <div className="container max-w-5xl mx-auto px-6 space-y-6">
          {PRIVACY_SECTIONS.map((section) => (
            <article key={section.title} className="rounded-[1.75rem] border border-stone-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <ShieldCheck className="h-5 w-5" />
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
