import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { creatorsApi } from "../../api/creatorsApi";


interface Creator {
  avatar: { url: string };
  nickname: string;
  username: string;
  follower_count: number;
  avg_ec_video_view_count: number;
  gmv?: { amount: string; currency: string };
  video_gmv?: { amount: string; currency: string };
  selection_region: string;
  top_follower_demographics?: {
    age_ranges: string[];
    major_gender: {
      gender: string;
      percentage: number;
    };
  };
}

export function CreatorDetailsPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [creator, setCreator] = useState<Creator | null>(
    location.state?.creator ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If creator was passed via state, no need to fetch again
    if (creator) return;

    const fetchCreator = async () => {
      if (!username) return;

      setLoading(true);
      setError(null);

      try {
        const data = await creatorsApi.getCreatorByUsername(username);
        if (!data) {
          setError("Creator not found.");
        } else {
          setCreator(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load creator.");
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [username]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Loading creator...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm black hover:underline"
        >
          ← Back
        </button>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!creator) return null;

  return (
    <section className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm black hover:underline"
      >
        ← Back
      </button>

      <div className="bg-white shadow rounded-xl p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-6">
          <img
            src={creator.avatar.url}
            alt={creator.nickname}
            className="w-24 h-24 rounded-full object-cover"
          />

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {creator.nickname}
            </h2>
            <p className="text-slate-500">@{creator.username}</p>
            <p className="mt-2 text-sm text-slate-600">
              Followers:{" "}
              <span className="font-semibold">
                {creator.follower_count.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <MetricCard
            label="Avg Video Views"
            value={creator.avg_ec_video_view_count.toLocaleString()}
          />

          {creator.gmv && (
            <MetricCard
              label="Total GMV"
              value={`${creator.gmv.currency} ${Number(
                creator.gmv.amount
              ).toLocaleString()}`}
            />
          )}

          {creator.video_gmv && (
            <MetricCard
              label="Video GMV"
              value={`${creator.video_gmv.currency} ${Number(
                creator.video_gmv.amount
              ).toLocaleString()}`}
            />
          )}

          <MetricCard
            label="Region"
            value={creator.selection_region}
          />
        </div>

        {/* Demographics */}
        {creator.top_follower_demographics && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Audience Demographics
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <p>
                Major Gender:{" "}
                <span className="font-medium">
                  {creator.top_follower_demographics.major_gender.gender}
                </span>
              </p>

              <p>
                Gender %:{" "}
                <span className="font-medium">
                  {(
                    creator.top_follower_demographics.major_gender.percentage /
                    100
                  ).toFixed(2)}
                  %
                </span>
              </p>

              <p>
                Age Ranges:{" "}
                <span className="font-medium">
                  {creator.top_follower_demographics.age_ranges.join(", ")}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* Reusable metric card */
function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <p className="text-slate-600 text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}