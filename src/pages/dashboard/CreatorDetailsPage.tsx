import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { creatorsApi } from "../../api/creatorsApi";


interface Creator {
  avatar: { url: string };
  nickname: string;
  username: string;
  bio_description?: string;
  rating?: string;
  follower_count: number;
  selection_region: string;

  // Video performance
  avg_ec_video_play_count?: number;
  avg_ec_video_like_count?: number;
  avg_ec_video_comment_count?: number;
  avg_ec_video_share_count?: number;
  ec_video_count?: number;
  ec_video_engagement_rate?: string;   // TikTok sends basis points (e.g. "192" = 1.92%)
  ec_live_count?: number;
  ec_live_engagement_rate?: string;

  // Commerce
  gmv?: { amount: string; currency: string };
  gmv_range?: { formatted_range: string };
  video_gmv?: { amount: string; currency: string };
  gpm?: { amount: string; currency: string };
  video_gpm_range?: { formatted_range: string };
  avg_gmv_per_buyer?: { amount: string; currency: string };
  avg_gmv_per_buyer_range?: { formatted_range: string };
  units_sold?: number;
  units_sold_range?: { formatted_range: string };
  promoted_product_num?: number;
  brand_collaboration_count?: number;
  post_rate?: string;

  // Audience
  follower_gender?: { key: string; value: string }[];
  follower_age?: { key: string; value: string }[];
  top_categories?: { key: string; value: string }[];
  content_gmv_distribution?: { content_type: string; value: string }[];

  // Legacy format
  top_follower_demographics?: {
    age_ranges: string[];
    major_gender: { gender: string; percentage: number };
  };

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
    return <div className="p-6"><p className="text-slate-500">Loading creator...</p></div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-4 text-sm black hover:underline">← Back</button>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!creator) return null;

  // --- Derived calculations ---

  // ec_video_engagement_rate comes as basis points (e.g. "192" = 1.92%), NOT a 0-1 decimal
  const videoEngagementPct =
    creator.ec_video_engagement_rate
      ? (parseFloat(creator.ec_video_engagement_rate) / 100).toFixed(2)
      : null;

  // View-to-Like ratio computed from raw avg counts
  const viewToLikeRatio =
    creator.avg_ec_video_play_count && creator.avg_ec_video_play_count > 0 && creator.avg_ec_video_like_count != null
      ? ((creator.avg_ec_video_like_count / creator.avg_ec_video_play_count) * 100).toFixed(2)
      : null;

  const gmvAmount = creator.gmv?.amount
    ? parseFloat(creator.gmv.amount) >= 1000
      ? `$${(parseFloat(creator.gmv.amount) / 1000).toFixed(0)}K`
      : `$${parseFloat(creator.gmv.amount).toFixed(0)}`
    : creator.gmv_range?.formatted_range || "N/A";

  return (
    <section className="p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm black hover:underline">
        ← Back
      </button>

      <div className="bg-white shadow rounded-xl p-6 max-w-4xl space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start gap-6">
          <img
            src={creator.avatar.url}
            alt={creator.nickname}
            className="w-24 h-24 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-900">{creator.nickname}</h2>
              {creator.rating && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full">
                  ★ {creator.rating}
                </span>
              )}
              {creator.selection_region && (
                <span className="inline-flex items-center bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {creator.selection_region}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-slate-500 text-sm">@{creator.username}</p>
              <a
                href={`https://www.tiktok.com/@${creator.username.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center overflow-hidden text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300 ease-in-out bg-slate-50 px-1.5 py-1.5 rounded-full shadow-sm border border-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path>
                </svg>
                <span className="text-[10px] font-bold origin-left max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2.5 group-hover:pr-1.5 transition-all duration-300 ease-in-out whitespace-nowrap tracking-wide">
                  Open TikTok Profile
                </span>
              </a>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-semibold">{creator.follower_count.toLocaleString()}</span> followers
            </p>
            {creator.bio_description && (
              <p className="mt-2 text-sm text-slate-600 whitespace-pre-line leading-relaxed max-w-lg">
                {creator.bio_description}
              </p>
            )}
          </div>
        </div>

        {/* ── Core Metrics ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Followers" value={creator.follower_count.toLocaleString()} subValue="Total" icon="👥" />
          <MetricCard label="Est. GMV" value={gmvAmount} subValue="Sales Volume" icon="💰" />
          <MetricCard
            label="Units Sold"
            value={creator.units_sold != null ? creator.units_sold.toLocaleString() : (creator.units_sold_range?.formatted_range || "0")}
            subValue="Total Sales"
            icon="📦"
          />
          <MetricCard
            label="Products Promoted"
            value={creator.promoted_product_num != null ? creator.promoted_product_num.toLocaleString() : "—"}
            subValue="Lifetime"
            icon="🛍️"
          />
        </div>

        {/* ── Commerce Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Avg GMV / Buyer"
            value={creator.avg_gmv_per_buyer?.amount
              ? `$${parseFloat(creator.avg_gmv_per_buyer.amount).toFixed(2)}`
              : (creator.avg_gmv_per_buyer_range?.formatted_range || "—")}
            subValue="Revenue per Buyer"
            icon="🧾"
          />
          <MetricCard
            label="GPM"
            value={creator.gpm?.amount ? `$${parseFloat(creator.gpm.amount).toFixed(2)}` : "—"}
            subValue="Gross Profit / Mille"
            icon="📈"
          />
          <MetricCard
            label="Brand Collabs"
            value={creator.brand_collaboration_count != null ? creator.brand_collaboration_count.toLocaleString() : "—"}
            subValue="Collaborations"
            icon="🤝"
          />
          <MetricCard
            label="Post Rate"
            value={creator.post_rate != null ? creator.post_rate : "—"}
            subValue="Posts (period)"
            icon="📝"
          />
        </div>

        {/* ── Engagement + Categories ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Categories */}
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
                <p className="text-3xl font-bold">
                  {videoEngagementPct != null ? `${videoEngagementPct}%` : "—"}
                </p>
                <p className="text-xs opacity-60 mt-1 uppercase">Video Interaction Rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {viewToLikeRatio != null ? `${viewToLikeRatio}%` : "—"}
                </p>
                <p className="text-xs opacity-60 mt-1 uppercase">View-to-Like Ratio</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Per-Video Engagement Breakdown ── */}
        {(creator.avg_ec_video_play_count != null || creator.avg_ec_video_like_count != null) && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-sky-50 rounded-lg text-sky-600 block">🎬</span>
              Avg Per-Video Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStat label="Avg Views" value={(creator.avg_ec_video_play_count ?? 0).toLocaleString()} />
              <MiniStat label="Avg Likes" value={(creator.avg_ec_video_like_count ?? 0).toLocaleString()} />
              <MiniStat label="Avg Comments" value={(creator.avg_ec_video_comment_count ?? 0).toLocaleString()} />
              <MiniStat label="Avg Shares" value={(creator.avg_ec_video_share_count ?? 0).toLocaleString()} />
            </div>
            {creator.ec_video_count != null && (
              <p className="mt-3 text-xs text-slate-400">Based on {creator.ec_video_count.toLocaleString()} EC videos</p>
            )}
          </div>
        )}

        {/* ── Content GMV Distribution ── */}
        {creator.content_gmv_distribution && creator.content_gmv_distribution.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-violet-50 rounded-lg text-violet-600 block">💹</span>
              GMV by Content Type
            </h3>
            <div className="space-y-3">
              {creator.content_gmv_distribution.map((item, idx) => {
                const label = item.content_type === "video_gmv" ? "Video" : item.content_type === "showcase_gmv" ? "Showcase" : item.content_type === "live_gmv" ? "Live" : item.content_type;
                const pct = (parseFloat(item.value) * 100).toFixed(1);
                return (
                  <div key={item.content_type} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{label}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${idx === 0 ? 'bg-violet-500' : idx === 1 ? 'bg-violet-300' : 'bg-violet-200'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Audience Insights ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                        className={`h-full rounded-full transition-all duration-500 ${g.key === 'female' || g.key === 'FEMALE' ? 'bg-rose-400' : 'bg-blue-400'}`}
                        style={{ width: `${(parseFloat(g.value) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {creator.follower_age && creator.follower_age.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 block">📅</span>
                Age Groups
              </h3>
              <div className="space-y-4">
                {creator.follower_age.slice(0, 5).map((a) => (
                  <div key={a.key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>{a.key}</span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded text-slate-900 border border-slate-100">
                        {(parseFloat(a.value) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-emerald-400"
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

function MetricCard({ label, value, subValue, icon }: { label: string; value: string; subValue?: string; icon?: string }) {
  return (
    <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{label}</p>
          <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
          {subValue && <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{subValue}</p>}
        </div>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-slate-50 rounded-lg">
      <p className="text-lg font-black text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mt-0.5">{label}</p>
    </div>
  );
}
