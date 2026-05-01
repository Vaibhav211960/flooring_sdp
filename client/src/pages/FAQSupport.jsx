import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Home as HomeIcon,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Bot,
  HelpCircle,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const FAQ_ENTRIES = [
  {
    id: "what-is-inscape",
    label: "What are we?",
    answer:
      "Inscape Layers is a flooring-focused online storefront for curated residential and commercial collections. We help customers compare finishes, understand product specs, and place orders with clear delivery guidance.",
  },
  {
    id: "what-do-you-sell",
    label: "What do you sell?",
    answer:
      "We offer flooring collections across different looks and performance needs, including wood-inspired surfaces, luxury vinyl options, and other premium interior flooring materials listed in our live catalog.",
  },
  {
    id: "delivery-time",
    label: "How long does delivery take?",
    answer:
      "For stocked products, processing usually starts within 1 business day and dispatch often happens within 2 to 4 business days. Exact timing depends on stock, city, and order size.",
  },
  {
    id: "samples-support",
    label: "Can you help me choose?",
    answer:
      "Yes. If you are unsure which collection fits your room, budget, or durability needs, you can use the catalog pages for comparison and contact us for project guidance through the contact page.",
  },
  {
    id: "bulk-orders",
    label: "Do you handle bulk orders?",
    answer:
      "Yes. Commercial and bulk orders can be coordinated with custom dispatch planning, delivery notes, and project-specific support. The best next step is to contact us with square footage and timeline details.",
  },
  {
    id: "returns-damage",
    label: "What if my order arrives damaged?",
    answer:
      "Please inspect the shipment at delivery and report visible damage within 24 hours with photos. That helps us coordinate a faster support response and carrier follow-up.",
  },
];

const QUICK_LINKS = [
  { label: "Shipping policy", to: "/shipping" },
  { label: "Browse products", to: "/products" },
  { label: "Contact support", to: "/contact" },
];

function buildAnswerMap(entries) {
  return entries.reduce((acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  }, {});
}

export default function FAQSupport() {
  const answerMap = useMemo(() => buildAnswerMap(FAQ_ENTRIES), []);
  const introMessage = "Hi, I'm the Inscape FAQ assistant. Pick a question below and I'll answer instantly.";
  const [messages, setMessages] = useState([{ role: "bot", text: introMessage }]);
  const [activeQuestionId, setActiveQuestionId] = useState(FAQ_ENTRIES[0].id);

  const askQuestion = (questionId) => {
    const entry = answerMap[questionId];
    if (!entry) return;

    setActiveQuestionId(questionId);
    setMessages([
      { role: "bot", text: introMessage },
      { role: "user", text: entry.label },
      { role: "bot", text: entry.answer },
    ]);
  };

  const activeEntry = answerMap[activeQuestionId];

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
            <span className="text-amber-500">FAQ Support</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500">
                Instant Answers
              </p>
              <h1 className="mb-5 font-serif text-4xl font-bold leading-tight md:text-6xl">
                A simple support assistant for your
                <span className="italic text-amber-400"> most common questions.</span>
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-stone-400 md:text-base">
                This FAQ page works like a small guided chatbot. It answers the most important questions customers usually ask before browsing, ordering, or requesting support.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-stone-700 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
                    Powered by Presets
                  </p>
                  <p className="mt-1 text-sm text-stone-300">
                    Fast answers without needing a live backend chat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-14 md:py-20">
        <div className="container max-w-7xl mx-auto px-6 space-y-12">
          <section className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-700">
                Questions Menu
              </p>
              <div className="mt-6 space-y-3">
                {FAQ_ENTRIES.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => askQuestion(entry.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                      activeQuestionId === entry.id
                        ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                        : "border-stone-200 bg-stone-50 text-stone-700 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-semibold">{entry.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-100 px-6 py-5 md:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-amber-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
                      FAQ Assistant
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Select a prepared question to view the answer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 bg-gradient-to-b from-stone-50 to-white px-6 py-6 md:px-8 md:py-8">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-2xl rounded-[1.5rem] px-5 py-4 text-sm leading-relaxed shadow-sm ${
                        message.role === "user"
                          ? "bg-stone-900 text-white"
                          : "border border-stone-200 bg-white text-stone-600"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
                        {message.role === "user" ? (
                          <MessageSquare className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5 text-amber-700" />
                        )}
                        <span>{message.role === "user" ? "You" : "Inscape Bot"}</span>
                      </div>
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 px-6 py-5 md:px-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">
                  Suggested Follow-Up
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {FAQ_ENTRIES.map((entry) => (
                    <button
                      key={`chip-${entry.id}`}
                      onClick={() => askQuestion(entry.id)}
                      className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
                    >
                      {entry.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-stone-200 bg-white p-7 shadow-sm md:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-700">
                Current Answer
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-stone-900">
                {activeEntry?.label}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-500">
                {activeEntry?.answer}
              </p>
            </div>

            <aside className="rounded-[1.75rem] border border-stone-200 bg-stone-900 p-7 text-white shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
                Need More?
              </p>
              <h2 className="mt-3 font-serif text-2xl font-bold">
                Move from quick answers to real project support.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-300">
                If the FAQ does not cover your case, use one of the next steps below.
              </p>
              <div className="mt-6 space-y-3">
                {QUICK_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition-all hover:bg-white hover:text-stone-900"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
