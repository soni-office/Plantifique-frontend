import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { sampleRequestsApi } from "../../api/sampleRequests";
import type { SampleApplication } from "../../types/sampleRequest";
import { toast } from "../../hooks/useToast";
import { Link } from "react-router-dom";

const PAGE_SIZE = 30;

const REVIEW_STATUSES = ["PENDING_REVIEW", "APPROVED", "REJECTED"] as const;
type ReviewStatus = (typeof REVIEW_STATUSES)[number];

const REVIEW_STATUS_STYLES: Record<ReviewStatus, string> = {
  PENDING_REVIEW: "bg-slate-100 text-slate-600 border-slate-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
};

type FeedbackEntry = {
  rating: "up" | "down" | null;
  comment: string;
  submitted: boolean;
  submitting: boolean;
};

export function SampleRequestsPage() {
  const [requests, setRequests] = useState<SampleApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Cursor stack: index 0 = first page (no cursor), each next push = next cursor
  const cursorsRef = useRef<(string | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);

  const [analysisResults, setAnalysisResults] = useState<Record<string, SampleApplication>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SampleApplication | null>(null);
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ReviewStatus>>({});
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackEntry>>({});

  const loadPage = async (cursor: string | null) => {
    setIsLoading(true);
    try {
      const result = await sampleRequestsApi.getSampleRequests(PAGE_SIZE, cursor);
      setRequests(result.items);
      setHasMore(result.has_more);

      // If there is a next cursor and we're at the end of our known stack, push it
      if (result.next_cursor) {
        const newIndex = cursorsRef.current.indexOf(cursor) + 1;
        if (cursorsRef.current.length <= newIndex) {
          cursorsRef.current = [...cursorsRef.current, result.next_cursor];
        }
      }

      // Pre-populate review statuses and completed analyses from DB data
      const statuses: Record<string, ReviewStatus> = {};
      const analyses: Record<string, SampleApplication> = {};
      for (const item of result.items) {
        const rs = item.review_status as ReviewStatus | undefined;
        if (rs && REVIEW_STATUSES.includes(rs)) {
          statuses[item.id] = rs;
        }
        if (item.analysis_status === "COMPLETED" && item.final_decision) {
          analyses[item.id] = item;
        }
      }
      setReviewStatuses((prev) => ({ ...prev, ...statuses }));
      setAnalysisResults((prev) => ({ ...prev, ...analyses }));
      // Init feedback state for pre-populated analyses so the feedback UI renders
      setFeedbacks((prev) => {
        const next = { ...prev };
        for (const id of Object.keys(analyses)) {
          if (!next[id]) {
            next[id] = { rating: null, comment: "", submitted: false, submitting: false };
          }
        }
        return next;
      });
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data?.detail ?? err.message)
        : "Please try again.";
      toast({ title: "Failed to load sample requests", description: String(msg), variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPage(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    const nextCursor = cursorsRef.current[pageIndex + 1];
    if (!nextCursor) return;
    setPageIndex((p) => p + 1);
    void loadPage(nextCursor);
  };

  const handlePrev = () => {
    if (pageIndex === 0) return;
    const prevCursor = cursorsRef.current[pageIndex - 1];
    setPageIndex((p) => p - 1);
    void loadPage(prevCursor ?? null);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await sampleRequestsApi.syncSampleRequests();
      toast({
        title: "Sync complete",
        description: `${result.new} new · ${result.updated} updated (${result.pages_fetched} pages)`,
        variant: "success",
      });
      // Reload first page after sync
      cursorsRef.current = [null];
      setPageIndex(0);
      void loadPage(null);
    } catch {
      toast({ title: "Sync failed", description: "Could not pull from TikTok.", variant: "error" });
    } finally {
      setSyncing(false);
    }
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      const result = await sampleRequestsApi.analyzeSample(id);
      if (result) {
        setAnalysisResults((prev) => ({ ...prev, [id]: result }));
        if (!feedbacks[id]) {
          setFeedbacks((prev) => ({
            ...prev,
            [id]: { rating: null, comment: "", submitted: false, submitting: false },
          }));
        }
      }
    } catch {
      toast({ title: "Analysis failed", description: "Could not analyze sample", variant: "error" });
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ReviewStatus) => {
    setUpdatingStatusId(id);
    try {
      await sampleRequestsApi.updateReviewStatus(id, newStatus);
      setReviewStatuses((prev) => ({ ...prev, [id]: newStatus }));
    } catch {
      toast({ title: "Failed to update status", variant: "error" });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleFeedbackRating = (id: string, rating: "up" | "down") =>
    setFeedbacks((prev) => ({ ...prev, [id]: { ...prev[id], rating } }));

  const handleFeedbackComment = (id: string, comment: string) =>
    setFeedbacks((prev) => ({ ...prev, [id]: { ...prev[id], comment } }));

  const handleFeedbackSubmit = async (id: string) => {
    const fb = feedbacks[id];
    if (!fb?.rating) return;
    setFeedbacks((prev) => ({ ...prev, [id]: { ...prev[id], submitting: true } }));
    try {
      await sampleRequestsApi.submitFeedback(id, fb.rating, fb.comment);
      setFeedbacks((prev) => ({ ...prev, [id]: { ...prev[id], submitting: false, submitted: true } }));
      toast({ title: "Feedback saved", variant: "success" });
    } catch {
      setFeedbacks((prev) => ({ ...prev, [id]: { ...prev[id], submitting: false } }));
      toast({ title: "Failed to save feedback", variant: "error" });
    }
  };

  return (
    <section>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Sample Requests</h2>
        <button
          onClick={handleSync}
          disabled={syncing || isLoading}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {syncing ? "Syncing…" : "Sync from TikTok"}
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">
            Sample Applications
            {requests.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">
                page {pageIndex + 1} · {requests.length} records
              </span>
            )}
          </h3>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Loading…</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500">No sample requests in the database yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Sync from TikTok" to pull them in.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">TikTok Status</th>
                  <th className="py-2 pr-4">Review</th>
                  <th className="py-2 pr-4">Creator</th>
                  <th className="py-2 pr-4">Avatar</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">AI Analysis</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const analysis = analysisResults[req.id];
                  const reviewStatus = reviewStatuses[req.id] ?? "PENDING_REVIEW";
                  const fb = feedbacks[req.id];
                  const tiktokStatus = req.tiktok_status ?? req.status;

                  return (
                    <tr key={req.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4 font-mono text-xs">{req.id}</td>

                      <td className="py-3 pr-4 text-xs text-slate-500">{tiktokStatus}</td>

                      <td className="py-3 pr-4">
                        <select
                          value={reviewStatus}
                          disabled={updatingStatusId === req.id}
                          onChange={(e) => handleStatusChange(req.id, e.target.value as ReviewStatus)}
                          className={`rounded border px-2 py-1 text-[11px] font-bold uppercase tracking-wide cursor-pointer appearance-none pr-6 transition-colors disabled:opacity-50 ${REVIEW_STATUS_STYLES[reviewStatus]}`}
                        >
                          {REVIEW_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 pr-4">
                        <Link
                          to={`../creators/${req.creator.creator_open_id}`}
                          className="hover:underline font-medium"
                        >
                          {req.creator.username}
                        </Link>
                        {req.creator.follower_count > 0 && (
                          <div className="text-[11px] text-slate-400">
                            {req.creator.follower_count.toLocaleString()} followers
                          </div>
                        )}
                      </td>

                      <td className="py-3 pr-4">
                        {req.creator.avatar_url ? (
                          <img
                            src={req.creator.avatar_url}
                            alt={req.creator.nickname}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-slate-100" />
                        )}
                      </td>

                      <td className="py-3 pr-4">
                        <Link
                          to={`../products/${req.product.id}`}
                          className="hover:underline font-medium"
                        >
                          {req.product.title}
                        </Link>
                        {req.product.sku_name && (
                          <div className="text-[11px] text-slate-400">{req.product.sku_name}</div>
                        )}
                      </td>

                      <td className="py-3 pr-4 min-w-[220px]">
                        {!analysis ? (
                          <div className="flex flex-col gap-1">
                            {req.analysis_status === "COMPLETED" && (
                              <span className="text-[11px] text-emerald-600 font-semibold">Already analysed</span>
                            )}
                            <button
                              onClick={() => handleAnalyze(req.id)}
                              disabled={analyzingId === req.id}
                              className="rounded bg-black px-4 py-1.5 text-white text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 w-fit"
                            >
                              {analyzingId === req.id ? "Analyzing…" : "Analyze"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 py-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <DecisionBadge decision={analysis.final_decision ?? ""} />
                              {analysis.tier && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                  {analysis.tier}
                                </span>
                              )}
                              {(analysis.commerce_score != null) && (
                                <div className="flex flex-col gap-1 w-full mt-1">
                                  <span className="text-[10px] font-semibold tracking-tight text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 w-fit">
                                    commerce_score: {analysis.commerce_score}
                                  </span>
                                  <span className="text-[10px] font-semibold tracking-tight text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 w-fit">
                                    aesthetic_score: {analysis.aesthetic_score}
                                  </span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => setSelectedAnalysis(analysis)}
                              className="text-[11px] text-blue-600 font-bold hover:underline text-left"
                            >
                              See reasoning →
                            </button>

                            {fb && (
                              fb.submitted ? (
                                <p className="text-[11px] text-emerald-600 font-semibold">
                                  Feedback saved ({fb.rating === "up" ? "👍" : "👎"})
                                </p>
                              ) : (
                                <div className="mt-1 border-t border-slate-100 pt-2 flex flex-col gap-1.5">
                                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Rate AI</p>
                                  <div className="flex gap-2">
                                    {(["up", "down"] as const).map((r) => (
                                      <button
                                        key={r}
                                        onClick={() => handleFeedbackRating(req.id, r)}
                                        className={`px-2 py-1 rounded text-sm border transition-colors ${
                                          fb.rating === r
                                            ? r === "up" ? "bg-emerald-100 border-emerald-300" : "bg-rose-100 border-rose-300"
                                            : "bg-white border-slate-200 hover:bg-slate-50"
                                        }`}
                                      >
                                        {r === "up" ? "👍" : "👎"}
                                      </button>
                                    ))}
                                  </div>
                                  {fb.rating && (
                                    <>
                                      <textarea
                                        rows={2}
                                        placeholder="Optional comment…"
                                        value={fb.comment}
                                        onChange={(e) => handleFeedbackComment(req.id, e.target.value)}
                                        className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-700 resize-none focus:outline-none focus:ring-1 focus:ring-blue-300"
                                      />
                                      <button
                                        onClick={() => handleFeedbackSubmit(req.id)}
                                        disabled={fb.submitting}
                                        className="self-start rounded bg-slate-800 px-3 py-1 text-[11px] text-white font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
                                      >
                                        {fb.submitting ? "Saving…" : "Submit"}
                                      </button>
                                    </>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && requests.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              onClick={handlePrev}
              disabled={pageIndex === 0}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs text-slate-400">Page {pageIndex + 1}</span>
            <button
              onClick={handleNext}
              disabled={!hasMore}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {selectedAnalysis && (
        <ReasoningModal analysis={selectedAnalysis} onClose={() => setSelectedAnalysis(null)} />
      )}
    </section>
  );
}

function DecisionBadge({ decision }: { decision: string }) {
  const styles: Record<string, string> = {
    ACCEPT: "bg-emerald-100 text-emerald-700",
    POTENTIAL_ACCEPT: "bg-amber-100 text-amber-700",
    REJECT: "bg-rose-100 text-rose-700",
    FLAG_INTERNAL: "bg-violet-100 text-violet-700",
  };
  const labels: Record<string, string> = {
    ACCEPT: "ACCEPT",
    POTENTIAL_ACCEPT: "POTENTIAL ACCEPT",
    REJECT: "REJECT",
    FLAG_INTERNAL: "INTERNAL REVIEW",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles[decision] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[decision] ?? decision}
    </span>
  );
}

function ReasoningModal({ analysis, onClose }: { analysis: SampleApplication; onClose: () => void }) {
  const detail = analysis.rich_creator_detail as any;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Analysis Reasoning</h3>
              <p className="text-sm text-slate-500 mt-1">Detailed breakdown of the AI decision</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${
              analysis.final_decision === "ACCEPT" ? "bg-emerald-50 border-emerald-100" :
              analysis.final_decision === "POTENTIAL_ACCEPT" ? "bg-amber-50 border-amber-100" :
              analysis.final_decision === "FLAG_INTERNAL" ? "bg-violet-50 border-violet-100" :
              "bg-rose-50 border-rose-100"
            }`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <DecisionBadge decision={analysis.final_decision ?? ""} />
                  {analysis.tier && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      {analysis.tier}
                    </span>
                  )}
                </div>
                {analysis.commerce_score != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      commerce_score: {analysis.commerce_score}/100
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      aesthetic_score: {analysis.aesthetic_score}/100
                    </span>
                  </div>
                )}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {analysis.decision_reason ?? analysis.commerce_reasoning ?? "No reasoning available."}
              </p>
            </div>

            {detail && Object.keys(detail).length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">Audience</h4>
                  <div className="space-y-2 text-xs font-medium text-slate-600">
                    <div className="flex justify-between">
                      <span>Gender</span>
                      <div className="flex gap-1 text-[10px]">
                        {detail.follower_gender?.map((g: any) => (
                          <span key={g.key} className="bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                            {g.key}: {(parseFloat(g.value) * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Primary Age</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {detail.follower_age?.[0]?.key} ({(parseFloat(detail.follower_age?.[0]?.value || "0") * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">Metrics</h4>
                  <div className="space-y-2 text-xs font-medium text-slate-600">
                    <div className="flex justify-between">
                      <span>Units Sold</span>
                      <span className="text-blue-700 font-bold">{detail.units_sold || detail.units_sold_range?.formatted_range || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GMV Range</span>
                      <span className="text-blue-700 font-bold">{detail.gmv_range?.formatted_range || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={onClose}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
