import { useEffect, useState } from "react";
import { sampleRequestsApi } from "../../api/sampleRequests";
import type { SampleApplication, SampleRequestResponse } from "../../types/sampleRequest";
import { toast } from "../../hooks/useToast";

export function SampleRequestsPage() {
  const [requests, setRequests] = useState<SampleApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
; // you can also keep it in .env

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const res: SampleRequestResponse =
          await sampleRequestsApi.getSampleRequests(20);

        setRequests(res.data.sample_applications);
      } catch (err) {
        toast({
          title: "Failed to load sample requests",
          description: "Please try again.",
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

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
                  <th className="py-2 pr-4">Order ID</th>
                  <th className="py-2 pr-4">Creator</th>
                  <th className="py-2 pr-4">Followers</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Commission</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-mono text-xs">{req.id}</td>
                    <td className="py-2 pr-4">{req.status}</td>
                    <td className="py-2 pr-4">{req.order_id}</td>
                    <td className="py-2 pr-4">{req.creator.nickname}</td>
                    <td className="py-2 pr-4">{req.creator.follower_count}</td>
                    <td className="py-2 pr-4">{req.product.title}</td>
                    <td className="py-2 pr-4">{req.commission_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
