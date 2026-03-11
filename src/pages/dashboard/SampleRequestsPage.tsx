import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { sampleRequestsApi } from "../../api/sampleRequests";
import type { SampleApplication } from "../../types/sampleRequest";
import { toast } from "../../hooks/useToast";
import { Link } from "react-router-dom";

export function SampleRequestsPage() {
  const [requests, setRequests] = useState<SampleApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
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

    setAnalysisResults((prev) => ({
      ...prev,
      [id]: result,
    }));
  } catch (err) {
    toast({
      title: "Analysis failed",
      description: "Could not analyze sample",
      variant: "error",
    });
  } finally {
    setAnalyzingId(null);
  }
};

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900">Sample Requests</h2>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">
          Sample Applications
        </h3>

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
                  <th className="py-2 pr-4">Status</th>
                   <th className="py-2 pr-4">Creator</th>
                  <th className="py-2 pr-4">Avtar</th>
                 
                  <th className="py-2 pr-4">Product</th>
    
                  <th className="py-2 pr-4">Analysis</th>
                </tr>
              </thead>
               <tbody>
  {requests.map((req) => {
    const analysis = analysisResults[req.id];

    return (
      <tr key={req.id} className="border-b border-slate-100">
        <td className="py-2 pr-4 font-mono text-xs">{req.id}</td>
        <td className="py-2 pr-4">{req.status}</td>
        <td className="py-2 pr-4">
          <Link
            to={`../creators/${req.creator.creator_open_id}`}
            className="black hover:underline font-medium"
          >
            {req.creator.username}
          </Link>
        </td>

        <td className="py-2 pr-4">
          <img
            src={req.creator.avatar_url}
            alt={req.creator.nickname}
            className="h-10 w-10 rounded-full object-cover"
          />
        </td>

        <td className="py-2 pr-4">
          <Link
            to={`../products/${req.product.id}`}
            className="black hover:underline font-medium"
          >
            {req.product.title}
          </Link>
      
</td>

        <td className="py-2 pr-4 min-w-[180px]">
          {!analysis ? (
            <button
              onClick={() => handleAnalyze(req.id)}
              disabled={analyzingId === req.id}
              className="rounded bg-black px-4 py-1.5 text-white text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {analyzingId === req.id ? "Analyzing..." : "Analyze"}
            </button>
          ) : (
            <div className="flex flex-col gap-1.5 py-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  analysis.final_decision === 'ACCEPT' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : analysis.final_decision === 'POTENTIAL_ACCEPT'
                    ? 'bg-amber-100 text-amber-700'
                    : analysis.final_decision === 'REJECT'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {analysis.final_decision}
                </span>
                {analysis.llm_score !== null && (
                  <span className="text-xs font-semibold text-slate-700">
                    {analysis.llm_score}/100
                  </span>
                )}
              </div>

              <div className="flex flex-col text-[11px] text-slate-500 font-medium">
                <div className="flex justify-between border-b border-slate-50 pb-0.5">
                  <span>Filters:</span>
                  <span className={
                    analysis.filters_passed === true ? 'text-emerald-600' : 
                    analysis.filters_passed === false ? 'text-rose-600' : 
                    'text-amber-600'
                  }>
                    {analysis.filters_passed === true ? 'PASSED' : 
                     analysis.filters_passed === false ? 'FAILED' : 
                     'SKIPPED'}
                  </span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span>Compatibility:</span>
                  <span className={analysis.compatibility_status === 'PROCESSED' ? 'text-blue-600' : 'text-amber-600'}>
                    {analysis.compatibility_status || 'SKIPPED'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedAnalysis(analysis)}
                className="text-[11px] text-blue-600 font-bold hover:underline text-left mt-0.5"
              >
                See detailed reasoning →
              </button>
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
              analysis.final_decision === 'ACCEPT' 
                ? 'bg-emerald-50 border-emerald-100' 
                : analysis.final_decision === 'POTENTIAL_ACCEPT'
                ? 'bg-amber-50 border-amber-100'
                : 'bg-rose-50 border-rose-100'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  analysis.final_decision === 'ACCEPT' ? 'text-emerald-700' : 
                  analysis.final_decision === 'POTENTIAL_ACCEPT' ? 'text-amber-700' :
                  analysis.final_decision === 'REJECT' ? 'text-rose-700' : 
                  'text-indigo-700'
                }`}>
                  Decision: {analysis.final_decision}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  Score: {analysis.llm_score}/100
                </span>
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
                            {/* Gender Distribution */}
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
                            {/* Top Age Group */}
                            <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                                <span>Primary Age</span>
                                <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">
                                    {analysis.rich_creator_detail.follower_age?.[0]?.key} ({(parseFloat(analysis.rich_creator_detail.follower_age?.[0]?.value || '0') * 100).toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">Accounts Metrics</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium text-slate-600">
                                <span>Units Sold</span>
                                <span className="text-blue-700 font-bold">{analysis.rich_creator_detail.units_sold || analysis.rich_creator_detail.units_sold_range?.formatted_range || '0'}</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-slate-600">
                                <span>GMV Range</span>
                                <span className="text-blue-700 font-bold">{analysis.rich_creator_detail.gmv_range?.formatted_range || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Categories Card */}
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
                                        className={`h-full rounded-full bg-indigo-500`}
                                        style={{ width: `${(parseFloat(cat.value) * 100)}%` }}
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
