import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { sampleRequestsApi } from "../../api/sampleRequests";
import type { SampleApplication } from "../../types/sampleRequest";
import { toast } from "../../hooks/useToast";
import { Link } from "react-router-dom";

const REVIEW_STATUSES = ["PENDING", "UNDER_REVIEW", "ACCEPTED", "REJECTED"] as const;
type ReviewStatus = (typeof REVIEW_STATUSES)[number];

const REVIEW_STATUS_STYLES: Record<ReviewStatus, string> = {
  PENDING: "bg-slate-100 text-slate-600 border-slate-200",
  UNDER_REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
  ACCEPTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
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
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);

  // Manual review state
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ReviewStatus>>({});
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // AI feedback state
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackEntry>>({});

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const items = await sampleRequestsApi.getSampleRequests(20);
        setRequests(items);
      } catch (err) {
        const serverMessage = isAxiosError(err)
          ? err.response?.data?.detail ??
            err.response?.data?.message ??
            err.message
          : "Please try again.";
        toast({
          title: "Failed to load sample requests",
          description: String(serverMessage),
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    void fetchRequests();
  }, []);

  const handleAnalyze = async (id: string) => {
    try {
      setAnalyzingId(id);
      const result = await sampleRequestsApi.analyzeSample(id);
      setAnalysisResults((prev) => ({ ...prev, [id]: result }));
      // Init feedback entry for this SR
      setFeedbacks((prev) => ({
        ...prev,
        [id]: { rating: null, comment: "", submitted: false, submitting: false },
      }));
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

  const handleFeedbackRating = (id: string, rating: "up" | "down") => {
    setFeedbacks((prev) => ({
      ...prev,
      [id]: { ...prev[id], rating },
    }));
  };

  const handleFeedbackComment = (id: string, comment: string) => {
    setFeedbacks((prev) => ({
      ...prev,
      [id]: { ...prev[id], comment },
    }));
  };

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
      <h2 className="text-2xl font-bold text-slate-900">Sample Requests</h2>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Sample Applications</h3>

        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-500">No sample requests found.</p>
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
                  const reviewStatus = reviewStatuses[req.id] ?? "PENDING";
                  const fb = feedbacks[req.id];

                  return (
                    <tr key={req.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4 font-mono text-xs">{req.id}</td>

                      {/* TikTok status (read-only) */}
                      <td className="py-3 pr-4 text-xs text-slate-500">{req.status}</td>

                      {/* Manual review dropdown */}
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
                      </td>

                      <td className="py-3 pr-4">
                        <img
                          src={req.creator.avatar_url}
                          alt={req.creator.nickname}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>

                      <td className="py-3 pr-4">
                        <Link
                          to={`../products/${req.product.id}`}
                          className="hover:underline font-medium"
                        >
                          {req.product.title}
                        </Link>
                      </td>

                      {/* AI Analysis + feedback */}
                      <td className="py-3 pr-4 min-w-[220px]">
                        {!analysis ? (
                          <button
                            onClick={() => handleAnalyze(req.id)}
                            disabled={analyzingId === req.id}
                            className="rounded bg-black px-4 py-1.5 text-white text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            {analyzingId === req.id ? "Analyzing..." : "Analyze"}
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2 py-1">
                            {/* Decision summary */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <DecisionBadge decision={analysis.final_decision} />
                              {analysis.tier && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                  {analysis.tier}
                                </span>
                              )}
                              {analysis.llm_score != null && (
                                <span className="text-xs font-semibold text-slate-700">
                                  {analysis.llm_score}/100
                                </span>
                              )}
                            </div>

                            {/* Stage indicators */}
                            <div className="flex flex-col text-[11px] text-slate-500 font-medium">
                              <div className="flex justify-between border-b border-slate-50 pb-0.5">
                                <span>Filters:</span>
                                <span className={
                                  analysis.filters_passed === true ? "text-emerald-600" :
                                  analysis.filters_passed === false ? "text-rose-600" :
                                  "text-slate-400"
                                }>
                                  {analysis.filters_passed === true ? "PASSED" :
                                   analysis.filters_passed === false ? "FAILED" : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between pt-0.5">
                                <span>AI Scoring:</span>
                                <span className={analysis.compatibility_status === "PROCESSED" ? "text-blue-600" : "text-slate-400"}>
                                  {analysis.compatibility_status === "PROCESSED" ? "DONE" : "N/A"}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedAnalysis(analysis)}
                              className="text-[11px] text-blue-600 font-bold hover:underline text-left"
                            >
                              See detailed reasoning →
                            </button>

                            {/* AI Feedback */}
                            {fb && (
                              fb.submitted ? (
                                <p className="text-[11px] text-emerald-600 font-semibold">
                                  ✓ Feedback saved ({fb.rating === "up" ? "👍" : "👎"})
                                </p>
                              ) : (
                                <div className="mt-1 border-t border-slate-100 pt-2 flex flex-col gap-1.5">
                                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Rate AI analysis</p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleFeedbackRating(req.id, "up")}
                                      className={`px-2 py-1 rounded text-sm transition-colors border ${fb.rating === "up" ? "bg-emerald-100 border-emerald-300" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                                    >
                                      👍
                                    </button>
                                    <button
                                      onClick={() => handleFeedbackRating(req.id, "down")}
                                      className={`px-2 py-1 rounded text-sm transition-colors border ${fb.rating === "down" ? "bg-rose-100 border-rose-300" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                                    >
                                      👎
                                    </button>
                                  </div>
                                  {fb.rating && (
                                    <>
                                      <textarea
                                        rows={2}
                                        placeholder="Optional comment..."
                                        value={fb.comment}
                                        onChange={(e) => handleFeedbackComment(req.id, e.target.value)}
                                        className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-700 resize-none focus:outline-none focus:ring-1 focus:ring-blue-300"
                                      />
                                      <button
                                        onClick={() => handleFeedbackSubmit(req.id)}
                                        disabled={fb.submitting}
                                        className="self-start rounded bg-slate-800 px-3 py-1 text-[11px] text-white font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
                                      >
                                        {fb.submitting ? "Saving..." : "Submit"}
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
      </div>

      {selectedAnalysis && (
        <ReasoningModal
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />
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
  const cls = styles[decision] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {labels[decision] ?? decision}
    </span>
  );
}

function ReasoningModal({ analysis, onClose }: { analysis: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Analysis Reasoning</h3>
              <p className="text-sm text-slate-500 mt-1">Detailed breakdown of the AI decision</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${
              analysis.final_decision === "ACCEPT"
                ? "bg-emerald-50 border-emerald-100"
                : analysis.final_decision === "POTENTIAL_ACCEPT"
                ? "bg-amber-50 border-amber-100"
                : analysis.final_decision === "FLAG_INTERNAL"
                ? "bg-violet-50 border-violet-100"
                : "bg-rose-50 border-rose-100"
            }`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <DecisionBadge decision={analysis.final_decision} />
                  {analysis.tier && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      {analysis.tier}
                    </span>
                  )}
                </div>
                {analysis.llm_score != null && (
                  <span className="text-sm font-bold text-slate-900">
                    Score: {analysis.llm_score}/100
                  </span>
                )}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {analysis.decision_reason}
              </p>
            </div>

            {/* Enriched Creator Insights */}
            {analysis.rich_creator_detail && Object.keys(analysis.rich_creator_detail).length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">Audience Demographics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                      <span>Gender</span>
                      <div className="flex gap-2 text-[10px]">
                        {analysis.rich_creator_detail.follower_gender?.map((g: any) => (
                          <span key={g.key} className="bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                            {g.key}: {(parseFloat(g.value) * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                      <span>Primary Age</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {analysis.rich_creator_detail.follower_age?.[0]?.key} ({(parseFloat(analysis.rich_creator_detail.follower_age?.[0]?.value || "0") * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">Account Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Units Sold</span>
                      <span className="text-blue-700 font-bold">{analysis.rich_creator_detail.units_sold || analysis.rich_creator_detail.units_sold_range?.formatted_range || "0"}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>GMV Range</span>
                      <span className="text-blue-700 font-bold">{analysis.rich_creator_detail.gmv_range?.formatted_range || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Categories */}
            {analysis.rich_creator_detail?.top_categories && analysis.rich_creator_detail.top_categories.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Top GMV Categories</h4>
                <div className="grid grid-cols-1 gap-3">
                  {analysis.rich_creator_detail.top_categories.slice(0, 3).map((cat: any) => (
                    <div key={cat.key} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700 uppercase">
                        <span>{cat.key}</span>
                        <span>{(parseFloat(cat.value) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${parseFloat(cat.value) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={onClose}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              Got it, close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
