import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { creatorsApi } from "../../api/creatorsApi";


interface Creator {
  avatar: { url: string };
  nickname: string;
  username: string;
  follower_count: number;
  avg_ec_video_view_count?: number;
  avg_ec_video_play_count?: number;
  gmv?: { amount: string; currency: string };
  gmv_range?: { formatted_range: string };
  video_gmv?: { amount: string; currency: string };
  video_gpm_range?: { formatted_range: string };
  selection_region: string;
  
  // Old format
  top_follower_demographics?: {
    age_ranges: string[];
    major_gender: {
      gender: string;
      percentage: number;
    };
  };
  
  follower_gender?: { key: string; value: string }[];
  follower_age?: { key: string; value: string }[];
  top_categories?: { key: string; value: string }[];
  
  // Performance
  ec_video_engagement_rate?: string;
  ec_video_view_engagement_rate?: string;
  ec_live_engagement_rate?: string;
  units_sold_range?: { formatted_range: string; value: string };
  performance_score?: number;

  internal_guidelines?: {
    product_tiers: Record<string, string>;
    tier_3_thresholds: Record<string, { min_gmv: number; min_followers: number; min_post_rate: number }>;
    tier_4_thresholds: Record<string, { min_gmv: number; min_followers: number; min_post_rate: number }>;
  };
}

export function CreatorDetailsPage() {
  const { creatorOpenId } = useParams();
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
      if (!creatorOpenId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await creatorsApi.getCreatorByOpenId(creatorOpenId);
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
  }, [creatorOpenId]);

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

        {/* Core Metrics Grid */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Followers"
            value={creator.follower_count.toLocaleString()}
            subValue="Total Followers"
            icon="👥"
          />
          <MetricCard
            label="Avg Video Views"
            value={(creator.avg_ec_video_view_count ?? creator.avg_ec_video_play_count ?? 0).toLocaleString()}
            subValue="Per Video"
            icon="🎬"
          />
          <MetricCard
            label="Units Sold"
            value={creator.units_sold_range?.formatted_range || "0"}
            subValue="Overall Performance"
            icon="📦"
          />
          <MetricCard
            label="Est. GMV"
            value={creator.gmv_range?.formatted_range || "N/A"}
            subValue="Sales Volume"
            icon="💰"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Categories */}
          <div className="md:col-span-2 bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 block">📊</span>
              Top Performance Categories
            </h3>
            <div className="space-y-4">
              {creator.top_categories?.map((cat, idx) => (
                <div key={cat.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat.key}</span>
                    <span>{(parseFloat(cat.value) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-indigo-400' : 'bg-indigo-300'}`}
                      style={{ width: `${(parseFloat(cat.value) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {(!creator.top_categories || creator.top_categories.length === 0) && (
                <p className="text-slate-400 text-sm italic">No category data available</p>
              )}
            </div>
          </div>

          {/* Engagement Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">Engagement Rates</h3>
            <div className="space-y-6">
              <div>
                <p className="text-3xl font-bold">{(parseFloat(creator.ec_video_engagement_rate || '0') * 100).toFixed(2)}%</p>
                <p className="text-xs opacity-60 mt-1 uppercase">Video Interaction Rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{(parseFloat(creator.ec_video_view_engagement_rate || '0') * 100).toFixed(2)}%</p>
                <p className="text-xs opacity-60 mt-1 uppercase">View-to-Like Ratio</p>
              </div>
            </div>
          </div>
        </div>
        {/* Audience Insights Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gender Distribution Card */}
          {creator.follower_gender && creator.follower_gender.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600 block">⚤</span>
                Audience Gender
              </h3>
              <div className="space-y-4">
                {creator.follower_gender.map((g) => (
                  <div key={g.key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span className="capitalize">{g.key.toLowerCase()}</span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded text-slate-900 border border-slate-100">
                        {(parseFloat(g.value) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${g.key === 'FEMALE' ? 'bg-rose-400' : 'bg-blue-400'}`}
                        style={{ width: `${(parseFloat(g.value) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Age Distribution Card */}
          {creator.follower_age && creator.follower_age.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 block">📅</span>
                Age Groups
              </h3>
              <div className="space-y-4">
                {creator.follower_age.slice(0, 4).map((a) => (
                  <div key={a.key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>{a.key}</span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded text-slate-900 border border-slate-100">
                        {(parseFloat(a.value) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 bg-emerald-400`}
                        style={{ width: `${(parseFloat(a.value) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* Reusable metric card */
function MetricCard({ label, value, subValue, icon }: { label: string; value: string; subValue?: string; icon?: string }) {
  return (
    <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            {label}
          </p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {value}
          </p>
          {subValue && (
            <p className="text-[10px] text-slate-400 mt-1 font-medium italic">
              {subValue}
            </p>
          )}
        </div>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
    </div>
  );
}