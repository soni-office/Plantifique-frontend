import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  tierConfigApi,
  THRESHOLD_KEYS,
  type TierCreator,
  type TierProduct,
  type ShopProduct,
  type Thresholds,
  type ThresholdKey,
} from "../../api/tierConfig";
import { toast } from "../../hooks/useToast";

const THRESHOLD_LABELS: Record<ThresholdKey, string> = {
  min_last_30_days_gmv: "Min GMV last 30d (USD)",
  min_follower_count: "Min Followers",
  min_post_rate: "Min Post Rate (%)",
  min_content_count: "Min Content Count",
  min_ec_video_views: "Min EC Video Views",
};

const TIER_COLORS: Record<string, string> = {
  TIER_1: "bg-violet-100 text-violet-700 border-violet-200",
  TIER_2: "bg-amber-100 text-amber-700 border-amber-200",
  TIER_3: "bg-blue-100 text-blue-700 border-blue-200",
  TIER_4: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// ── Threshold editor ──────────────────────────────────────────────────────
function ThresholdEditor({
  value,
  onChange,
  saving,
}: {
  value: Thresholds;
  onChange: (t: Thresholds) => void;
  saving: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {THRESHOLD_KEYS.map((key) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {THRESHOLD_LABELS[key]}
          </span>
          <input
            type="number"
            min={0}
            disabled={saving}
            placeholder="blank = skip"
            value={value[key] ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                [key]: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
          />
        </label>
      ))}
    </div>
  );
}

// ── Creator row ───────────────────────────────────────────────────────────
function CreatorRow({
  creator,
  onRemove,
  removing,
}: {
  creator: TierCreator;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <li className="flex items-center justify-between px-3 py-2.5 text-sm">
      <div className="flex items-center gap-3">
        {creator.avatar_url ? (
          <img
            src={creator.avatar_url}
            alt={creator.username}
            className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute("hidden");
            }}
          />
        ) : 
          <div
            hidden={!!creator.avatar_url}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 uppercase shrink-0"
          >
            {creator.username[0]}
          </div>
        }

        <div>
          <span className="font-medium text-slate-800">@{creator.username}</span>
          {creator.creator_open_id && (
            <p className="font-mono text-[10px] text-slate-400 mt-0.5">
              {creator.creator_open_id.slice(0, 28)}…
            </p>
          )}
        </div>
        <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${TIER_COLORS[creator.tier] ?? ""}`}>
          {creator.tier === "TIER_1" ? "T1 · Retainer" : "T2 · Exception"}
        </span>
      </div>
      <button
        disabled={removing}
        onClick={onRemove}
        className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
      >
        {removing ? "Removing…" : "Remove"}
      </button>
    </li>
  );
}

// ── Configured product card ───────────────────────────────────────────────
function ProductCard({
  product,
  onRemove,
  onSaveThresholds,
  removing,
  saving,
}: {
  product: TierProduct;
  onRemove: () => void;
  onSaveThresholds: (t: Thresholds) => void;
  removing: boolean;
  saving: boolean;
}) {
  const [thresholds, setThresholds] = useState<Thresholds>(product.thresholds ?? {});
  const [expanded, setExpanded] = useState(false);

  const activeCount = THRESHOLD_KEYS.filter((k) => thresholds[k] != null).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header row */}
      <div className="flex items-start gap-4 p-4 overflow-hidden">
        {product.sku_image_url && (
          <img
            src={product.sku_image_url}
            alt={product.title}
            className="h-14 w-14 rounded-lg object-cover border border-slate-100 shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 break-words leading-snug">{product.title}</p>
          <p className="font-mono text-[10px] text-slate-400 mt-0.5 break-all">{product.id}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${TIER_COLORS[product.tier] ?? ""}`}>
              {product.tier}
            </span>
            {product.price && (
              <span className="text-[11px] font-semibold text-slate-600">
                {product.currency ?? "USD"} {product.price}
              </span>
            )}
            {product.category && (
              <span className="text-[11px] text-slate-400">{product.category}</span>
            )}
            <span className="text-[11px] text-slate-400">
              {activeCount} threshold{activeCount !== 1 ? "s" : ""} active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {expanded ? "Hide" : "Edit thresholds"}
          </button>
          <button
            disabled={removing}
            onClick={onRemove}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
          >
            {removing ? "…" : "Remove"}
          </button>
        </div>
      </div>

      {/* Threshold panel */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-4">
          <p className="text-xs text-slate-400">Leave blank to skip a threshold for this product.</p>
          <ThresholdEditor value={thresholds} onChange={setThresholds} saving={saving} />
          <button
            disabled={saving}
            onClick={() => onSaveThresholds(thresholds)}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save thresholds"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Product picker modal ──────────────────────────────────────────────────
function ProductPickerModal({
  shopProducts,
  alreadyAdded,
  onAdd,
  onClose,
}: {
  shopProducts: ShopProduct[];
  alreadyAdded: Set<string>;
  onAdd: (p: ShopProduct, tier: "TIER_3" | "TIER_4", thresholds: Thresholds) => Promise<void>;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ShopProduct | null>(null);
  const [tier, setTier] = useState<"TIER_3" | "TIER_4">("TIER_3");
  const [thresholds, setThresholds] = useState<Thresholds>({});
  const [adding, setAdding] = useState(false);

  const available = shopProducts.filter(
    (p) =>
      !alreadyAdded.has(p.id) &&
      p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    await onAdd(selected, tier, thresholds);
    setAdding(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add product to tier config</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {available.length} of {shopProducts.length} shop products available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left — product list */}
          <div className="w-1/2 border-r border-slate-100 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100">
              <input
                autoFocus
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {available.length === 0 ? (
                <p className="px-4 py-8 text-sm text-center text-slate-400">
                  {shopProducts.length === 0
                    ? "No products in cache. Search products first."
                    : "All products already added."}
                </p>
              ) : (
                available.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${selected?.id === p.id ? "bg-slate-50 ring-1 ring-inset ring-slate-300" : ""
                      }`}
                  >
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="h-12 w-12 rounded-lg object-cover border border-slate-100 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                        {p.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {p.price && (
                          <span className="text-[11px] font-semibold text-slate-600">
                            {p.currency ?? "USD"} {p.price}
                          </span>
                        )}
                        {p.category && (
                          <span className="text-[11px] text-slate-400">{p.category}</span>
                        )}
                        {p.status && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 uppercase">
                            {p.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right — config panel */}
          <div className="w-1/2 flex flex-col overflow-y-auto">
            {!selected ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-400 text-sm">
                Select a product on the left to configure it
              </div>
            ) : (
              <div className="p-5 space-y-5">
                {/* Selected product summary */}
                <div className="flex gap-3 items-start">
                  {selected.image_url && (
                    <img
                      src={selected.image_url}
                      alt={selected.title}
                      className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-slate-800 leading-snug">{selected.title}</p>
                    {selected.price && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        {selected.currency ?? "USD"} {selected.price}
                      </p>
                    )}
                    {selected.category && (
                      <p className="text-xs text-slate-400 mt-0.5">{selected.category}</p>
                    )}
                  </div>
                </div>

                {/* Tier picker */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Tier</p>
                  <div className="flex gap-3">
                    {(["TIER_3", "TIER_4"] as const).map((t) => (
                      <label
                        key={t}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 cursor-pointer text-sm font-medium transition-colors ${tier === t
                            ? TIER_COLORS[t] + " font-semibold"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        <input
                          type="radio"
                          name="tier-pick"
                          className="sr-only"
                          value={t}
                          checked={tier === t}
                          onChange={() => setTier(t)}
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Thresholds */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Thresholds <span className="normal-case font-normal text-slate-400">(blank = skip)</span>
                  </p>
                  <ThresholdEditor value={thresholds} onChange={setThresholds} saving={adding} />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selected || adding}
                onClick={handleAdd}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {adding ? "Adding…" : "Add to tier config"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export function TierConfigPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ORG_ADMIN" || user?.role === "SUPER_ADMIN";

  const [creators, setCreators] = useState<TierCreator[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newCreatorTier, setNewCreatorTier] = useState<"TIER_1" | "TIER_2">("TIER_1");
  const [addingCreator, setAddingCreator] = useState(false);
  const [removingCreator, setRemovingCreator] = useState<string | null>(null);

  const [products, setProducts] = useState<TierProduct[]>([]);
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [removingProduct, setRemovingProduct] = useState<string | null>(null);
  const [savingThresholds, setSavingThresholds] = useState<string | null>(null);

  const [tier5, setTier5] = useState<Thresholds>({});
  const [tier5Saving, setTier5Saving] = useState(false);

  useEffect(() => {
    tierConfigApi.listCreators().then(setCreators).finally(() => setCreatorsLoading(false));
    Promise.all([
      tierConfigApi.listTierProducts(),
      tierConfigApi.listShopProducts(),
    ]).then(([tp, sp]) => {
      setProducts(tp);
      setShopProducts(sp);
    }).finally(() => setProductsLoading(false));
    tierConfigApi.getTier5().then(setTier5);
  }, []);

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setAddingCreator(true);
    try {
      const entry = await tierConfigApi.addCreator(newUsername.trim(), newCreatorTier);
      setCreators((prev) => [entry, ...prev]);
      toast({ title: "Creator added", description: `@${entry.username} → ${entry.tier}`, variant: "success" });
      setNewUsername("");
    } catch {
      toast({ title: "Add failed", description: "Check username and try again.", variant: "error" });
    } finally {
      setAddingCreator(false);
    }
  };

  const handleRemoveCreator = async (username: string) => {
    setRemovingCreator(username);
    try {
      await tierConfigApi.removeCreator(username);
      setCreators((prev) => prev.filter((c) => c.id !== username));
      toast({ title: "Creator removed", variant: "success" });
    } catch {
      toast({ title: "Remove failed", variant: "error" });
    } finally {
      setRemovingCreator(null);
    }
  };

  const handleAddProduct = async (
    p: ShopProduct,
    tier: "TIER_3" | "TIER_4",
    thresholds: Thresholds,
  ) => {
    try {
      const entry = await tierConfigApi.addProduct(p.id, tier, thresholds);
      setProducts((prev) => [entry, ...prev]);
      toast({ title: "Product added", description: `${p.title} → ${tier}`, variant: "success" });
    } catch {
      toast({ title: "Add failed", variant: "error" });
    }
  };

  const handleRemoveProduct = async (product_id: string) => {
    setRemovingProduct(product_id);
    try {
      await tierConfigApi.removeProduct(product_id);
      setProducts((prev) => prev.filter((p) => p.id !== product_id));
      toast({ title: "Product removed", variant: "success" });
    } catch {
      toast({ title: "Remove failed", variant: "error" });
    } finally {
      setRemovingProduct(null);
    }
  };

  const handleSaveThresholds = async (product_id: string, thresholds: Thresholds) => {
    setSavingThresholds(product_id);
    try {
      const updated = await tierConfigApi.updateThresholds(product_id, thresholds);
      setProducts((prev) => prev.map((p) => (p.id === product_id ? updated : p)));
      toast({ title: "Thresholds updated", variant: "success" });
    } catch {
      toast({ title: "Save failed", variant: "error" });
    } finally {
      setSavingThresholds(null);
    }
  };

  const handleSaveTier5 = async () => {
    setTier5Saving(true);
    try {
      const updated = await tierConfigApi.setTier5(tier5);
      setTier5(updated);
      toast({ title: "Tier 5 thresholds saved", variant: "success" });
    } catch {
      toast({ title: "Save failed", variant: "error" });
    } finally {
      setTier5Saving(false);
    }
  };

  if (!isAdmin) {
    return (
      <section className="flex items-center justify-center h-64">
        <p className="text-sm text-slate-500">Admin access required.</p>
      </section>
    );
  }

  const addedProductIds = new Set(products.map((p) => p.id));

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900">Tier Configuration</h2>

      {/* ── Tier 1 / 2 ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800">Tier 1 &amp; 2 — Creator Lists</h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          <span className="font-semibold text-violet-600">Tier 1</span> = Retainers (internal team).
          &nbsp;<span className="font-semibold text-amber-600">Tier 2</span> = Exception list (manual review via Discord/DMs).
          These creators skip all agentic processing.
        </p>

        <form onSubmit={handleAddCreator} className="flex items-end gap-3 mb-5">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-slate-500">TikTok Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. rosesoma"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Tier</label>
            <select
              value={newCreatorTier}
              onChange={(e) => setNewCreatorTier(e.target.value as "TIER_1" | "TIER_2")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="TIER_1">Tier 1 — Retainer</option>
              <option value="TIER_2">Tier 2 — Exception</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={addingCreator || !newUsername.trim()}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {addingCreator ? "Adding…" : "Add Creator"}
          </button>
        </form>

        {creatorsLoading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : creators.length === 0 ? (
          <p className="text-sm text-slate-400">No creators on exception lists yet.</p>
        ) : (
          <ul className="max-h-96 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-100">
            {creators.map((c) => (
              <CreatorRow
                key={c.id}
                creator={c}
                onRemove={() => handleRemoveCreator(c.id)}
                removing={removingCreator === c.id}
              />
            ))}
          </ul>
        )}
      </div>

      {/* ── Tier 3 / 4 ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Tier 3 &amp; 4 — Product Config</h3>
            <p className="text-xs text-slate-400 mt-1">
              Requests for these products go through metric filtering + LLM scoring.
              Set per-product thresholds — blank = skip that check.
            </p>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            disabled={productsLoading}
            className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            + Add product
          </button>
        </div>

        <div className="mt-5">
          {productsLoading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-slate-400">
              No products configured yet. Click "Add product" to pick from your shop.
            </p>
          ) : (
            <div className="max-h-[480px] overflow-y-auto space-y-3 pr-1">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onRemove={() => handleRemoveProduct(p.id)}
                  onSaveThresholds={(t) => handleSaveThresholds(p.id, t)}
                  removing={removingProduct === p.id}
                  saving={savingThresholds === p.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tier 5 ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800">Tier 5 — Global Thresholds</h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          Applied to all requests that don't match Tier 1–4.
          Always routed to internal review (FLAG_INTERNAL) — no LLM. Leave blank to skip a check.
        </p>
        <ThresholdEditor value={tier5} onChange={setTier5} saving={tier5Saving} />
        <button
          disabled={tier5Saving}
          onClick={handleSaveTier5}
          className="mt-5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {tier5Saving ? "Saving…" : "Save Tier 5 Thresholds"}
        </button>
      </div>

      {/* ── Product picker modal ─────────────────────────────────────────── */}
      {showPicker && (
        <ProductPickerModal
          shopProducts={shopProducts}
          alreadyAdded={addedProductIds}
          onAdd={handleAddProduct}
          onClose={() => setShowPicker(false)}
        />
      )}
    </section>
  );
}
