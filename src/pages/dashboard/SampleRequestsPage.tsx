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
            to={`../creators/${req.creator.username}`}
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

        <td className="py-2 pr-4">
  {!analysis ? (
    <button
      onClick={() => handleAnalyze(req.id)}
      disabled={analyzingId === req.id}
      className="rounded bg-black px-3 py-1 text-white text-xs hover:bg-gray-800 disabled:opacity-50"
    >
      {analyzingId === req.id ? "Analyzing..." : "Analyze"}
    </button>
  ) : (
    <details className="text-xs w-72">
      <summary className="cursor-pointer font-semibold text-black">
        {analysis.decision}
      </summary>

      <div className="mt-2 rounded border border-gray-300 bg-gray-50 p-3 shadow-sm space-y-2">
        
        {/* Tier */}
        <div className="flex justify-between text-sm font-medium text-gray-800">
          <span>Tier</span>
          <span>{analysis.tier}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-2 text-gray-600 whitespace-pre-wrap">
          {analysis.details}
        </div>
      </div>
    </details>
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
    </section>
  );
}
