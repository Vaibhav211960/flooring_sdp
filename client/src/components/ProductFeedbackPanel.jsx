import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "../utils/toast";
import {
  Star,
  Send,
  Lock,
  Loader2,
  MessageSquare,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import api from "../utils/api";
import { getLoggedInUserId } from "../utils/auth";

const ProductFeedbackPanel = ({ productId, productName, orderDelivered = false }) => {
  const loggedInUserId = useMemo(() => getLoggedInUserId(), []);
  const isLoggedIn = !!loggedInUserId;

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(false);

  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  const [showAll, setShowAll] = useState(false);

  const mergeVisibleReviews = useCallback((publicReviews = [], myFeedbackHistory = []) => {
    const normalizedPublic = Array.isArray(publicReviews) ? publicReviews : [];
    const mineForProduct = (Array.isArray(myFeedbackHistory) ? myFeedbackHistory : []).filter((item) => {
      const reviewedProductId =
        typeof item.productId === "object" ? item.productId?._id : item.productId;
      return reviewedProductId === productId;
    });

    const seenIds = new Set(normalizedPublic.map((item) => item._id));
    const merged = [...normalizedPublic];

    mineForProduct.forEach((item) => {
      if (!seenIds.has(item._id)) {
        merged.unshift(item);
        seenIds.add(item._id);
      }
    });

    return merged;
  }, [productId]);

  useEffect(() => {
    if (!productId) return;

    const load = async () => {
      try {
        setIsLoading(true);

        const requests = [api.get(`/feedback/product/${productId}`)];
        if (isLoggedIn) {
          requests.push(api.get("/feedback/my-history"));
        }

        const [reviewRes, myHistoryRes] = await Promise.all(requests);

        setReviews(
          mergeVisibleReviews(
            reviewRes?.data?.feedbacks || [],
            myHistoryRes?.data?.feedbacks || []
          )
        );

        if (isLoggedIn && orderDelivered) {
          const eligRes = await api.get(`/feedback/verify/verify-eligibility/${productId}`);
          setIsEligible(eligRes.data.eligible);
        } else {
          setIsEligible(false);
        }
      } catch {
        // Non-critical section: keep page usable even if review requests fail.
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [productId, isLoggedIn, orderDelivered, mergeVisibleReviews]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.post("/feedback/submit", {
        productId,
        comment: reviewText,
        rating,
      });

      setReviews((prev) => [res.data.feedback, ...prev.filter((item) => item._id !== res.data.feedback._id)]);
      setReviewText("");
      setRating(5);
      setIsEligible(false);
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review.");
    } finally {
      setIsSubmitting(false);
    }
  }, [productId, rating, reviewText]);

  const handleEditStart = useCallback((rev) => {
    setEditingId(rev._id);
    setEditText(rev.comment);
    setEditRating(rev.rating);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditText("");
    setEditRating(5);
  }, []);

  const handleEditSave = useCallback(async (reviewId) => {
    if (!editText.trim()) return;

    try {
      setIsSaving(true);
      const res = await api.put(`/feedback/${reviewId}`, {
        comment: editText,
        rating: editRating,
      });

      setReviews((prev) =>
        prev.map((item) => (item._id === reviewId ? res.data.feedback : item))
      );

      setEditingId(null);
      toast.success("Review updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update review.");
    } finally {
      setIsSaving(false);
    }
  }, [editRating, editText]);

  const handleDelete = useCallback((reviewId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">Delete your review?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/feedback/${reviewId}`);
                  setReviews((prev) => prev.filter((item) => item._id !== reviewId));
                  setIsEligible(true);
                  toast.success("Review deleted.");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Could not delete review.");
                }
              }}
              className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-stone-700 transition-all hover:bg-stone-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  }, []);

  const avgRating = useMemo(() => (
    reviews.length > 0
      ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
      : null
  ), [reviews]);

  const visibleReviews = useMemo(() => (
    showAll ? reviews : reviews.slice(0, 2)
  ), [reviews, showAll]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-amber-700" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
            {productName ? `Reviews for ${productName}` : "Reviews"}
          </p>
        </div>
        {avgRating && (
          <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5">
            <Star size={11} fill="#f59e0b" className="text-amber-500" />
            <span className="text-xs font-bold text-stone-800">{avgRating}</span>
            <span className="text-[9px] font-medium text-stone-400">
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {isLoggedIn && orderDelivered && isEligible && (
        <div className="space-y-4 rounded-xl border border-amber-100 bg-amber-50/60 p-5">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 size={13} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              You can review this product
            </span>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={20}
                  fill={star <= rating ? "#b45309" : "none"}
                  className={star <= rating ? "text-amber-700" : "text-stone-300"}
                />
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts on quality and finish..."
              className="h-24 w-full resize-none rounded-xl border border-stone-200 bg-white p-4 pr-14 text-sm outline-none transition-all focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="absolute bottom-3 right-3 rounded-lg bg-stone-900 p-2.5 text-amber-500 transition-all hover:bg-stone-800 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </form>
        </div>
      )}

      {isLoggedIn && orderDelivered && !isEligible && reviews.length === 0 && !isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <Lock size={13} className="shrink-0 text-stone-400" />
          <p className="text-xs italic text-stone-500">
            No reviews yet. You have already reviewed this product.
          </p>
        </div>
      )}

      {!orderDelivered && isLoggedIn && (
        <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <Lock size={13} className="shrink-0 text-stone-400" />
          <p className="text-xs italic text-stone-500">
            You can leave a review once this order is delivered.
          </p>
        </div>
      )}

      {!isLoggedIn && (
        <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <Lock size={13} className="shrink-0 text-stone-400" />
          <p className="text-xs italic text-stone-500">
            Sign in to read and leave reviews.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 py-4 text-stone-400">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs">Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-2 text-xs italic text-stone-400">No reviews yet for this product.</p>
      ) : (
        <div className="space-y-3">
          {visibleReviews.map((rev) => {
            const isOwner = loggedInUserId && rev.userId?._id === loggedInUserId;
            const isEditing = editingId === rev._id;
            const moderationLabel = rev.isApproved
              ? "Published"
              : rev.isRejected
                ? "Hidden"
                : "Pending";

            return (
              <div
                key={rev._id}
                className={`rounded-xl border bg-white p-5 shadow-sm transition-all ${
                  isEditing ? "border-amber-300" : "border-stone-100 hover:border-stone-200"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Pencil size={11} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Editing your review
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button type="button" key={star} onClick={() => setEditRating(star)}>
                          <Star
                            size={17}
                            fill={star <= editRating ? "#b45309" : "none"}
                            className={star <= editRating ? "text-amber-700" : "text-stone-300"}
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="h-20 w-full resize-none rounded-xl border border-amber-200 bg-stone-50 p-3 text-sm outline-none transition-all focus:border-amber-500"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleEditCancel}
                        className="flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-500 transition-all hover:bg-stone-200"
                      >
                        <X size={11} /> Cancel
                      </button>
                      <button
                        onClick={() => handleEditSave(rev._id)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-stone-800 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-amber-500">
                          {rev.userId?.userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                            {rev.userId?.userName || "Anonymous"}
                            <CheckCircle2 size={10} className="text-emerald-500" />
                          </p>
                          <div className="mt-0.5 flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={9}
                                fill={i < rev.rating ? "#f59e0b" : "none"}
                                className={i < rev.rating ? "text-amber-500" : "text-stone-200"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isOwner && (
                          <span
                            className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${
                              rev.isApproved
                                ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                                : rev.isRejected
                                  ? "border border-red-100 bg-red-50 text-red-600"
                                  : "border border-amber-100 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {moderationLabel}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400">
                          {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {isOwner && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditStart(rev)}
                              className="rounded-lg p-1.5 text-stone-400 transition-all hover:bg-amber-50 hover:text-amber-700"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              onClick={() => handleDelete(rev._id)}
                              className="rounded-lg p-1.5 text-stone-400 transition-all hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="pl-1 text-sm italic leading-relaxed text-stone-600">
                      "{rev.comment || rev.feedback}"
                    </p>
                  </>
                )}
              </div>
            );
          })}

          {reviews.length > 2 && (
            <button
              onClick={() => setShowAll((value) => !value)}
              className="py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700 transition-colors hover:text-amber-800"
            >
              {showAll
                ? "Show Less"
                : `Show ${reviews.length - 2} More Review${reviews.length - 2 > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFeedbackPanel;
