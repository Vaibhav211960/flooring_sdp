import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Home as HomeIcon,
  Truck,
  PackageCheck,
  MapPinned,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const SHIPPING_STEPS = [
  {
    icon: Truck,
    title: "Order Processing",
    description: "Orders are reviewed within 1 business day so we can confirm stock, cutting specs, and delivery readiness before dispatch.",
  },
  {
    icon: PackageCheck,
    title: "Dispatch Window",
    description: "In-stock flooring usually leaves our warehouse within 2 to 4 business days. Bulk and made-to-order requests may take longer.",
  },
  {
    icon: MapPinned,
    title: "Delivery Coverage",
    description: "We currently support deliveries across major Indian cities and coordinate special handling for remote or high-volume commercial sites.",
  },
  {
    icon: ShieldCheck,
    title: "Protected Transit",
    description: "Every shipment is packed with moisture-safe wrapping and edge protection to reduce damage during transport.",
  },
];

const POLICY_POINTS = [
  "Delivery timelines vary by city, stock status, and order volume. We always confirm the estimated schedule before dispatch.",
  "Customers should inspect visible packaging damage at the time of delivery and report issues within 24 hours with photos.",
  "If a building has lift, access, or unloading restrictions, please share them before shipment so we can plan correctly.",
  "Sample orders and full flooring orders may arrive separately depending on warehouse availability.",
  "Shipping fees for custom handling, express requests, or difficult delivery zones may be quoted separately.",
];

export default function ShippingPolicy() {
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
            <span className="text-amber-500">Shipping Policy</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500">
                Delivery Guidance
              </p>
              <h1 className="mb-5 font-serif text-4xl font-bold leading-tight md:text-6xl">
                Clear shipping rules for a smoother
                <span className="italic text-amber-400"> delivery experience.</span>
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-stone-400 md:text-base">
                Flooring orders need a little more coordination than typical ecommerce shipments. This page explains what to expect before dispatch, during delivery, and after arrival.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-stone-700 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
                Quick Summary
              </p>
              <div className="mt-5 space-y-4 text-sm text-stone-300">
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-stone-500">Processing</span>
                  <span className="font-semibold text-white">1 business day</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-stone-500">Dispatch</span>
                  <span className="font-semibold text-white">2 to 4 business days for stocked items</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-stone-500">Support</span>
                  <span className="font-semibold text-white">Contact us before dispatch changes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-14 md:py-20">
        <div className="container max-w-7xl mx-auto px-6 space-y-14">
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {SHIPPING_STEPS.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-[1.5rem] border border-stone-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">{description}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm md:p-10">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-amber-700">
                Policy Notes
              </p>
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                What customers should know before checkout
              </h2>
              <div className="mt-8 space-y-4">
                {POLICY_POINTS.map((point) => (
                  <div
                    key={point}
                    className="flex gap-4 rounded-2xl border border-stone-100 bg-stone-50 px-5 py-4"
                  >
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                    <p className="text-sm leading-relaxed text-stone-600">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[2rem] border border-stone-200 bg-stone-900 p-8 text-white shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
                Need Help?
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold leading-tight">
                Have a project timeline we should plan around?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-300">
                For site access notes, bulk dispatch planning, or commercial shipments, speak with our team before you place the order.
              </p>

              <div className="mt-8 space-y-3">
                <Link
                  to="/contact"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-amber-600 px-6 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-amber-700"
                >
                  Contact Support
                </Link>
                <Link
                  to="/faq"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-stone-900"
                >
                  Open FAQ Assistant
                </Link>
              </div>
            </aside>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-gradient-to-r from-amber-50 via-white to-stone-50 p-8 shadow-sm md:p-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-700">
                  Before You Order
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold text-stone-900">
                  Confirm stock, delivery access, and required quantity with confidence.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  We recommend checking square footage, building access, and desired installation date before checkout so dispatch can stay on schedule.
                </p>
              </div>

              <Link
                to="/products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-stone-800"
              >
                Browse Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
