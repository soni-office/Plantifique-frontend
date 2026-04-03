import { useState } from 'react';
import { testingApi, type AestheticTestResult } from '../../api/testingApi';

export function TestingPage() {
  const [productId, setProductId] = useState('');
  const [creatorUsername, setCreatorUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AestheticTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!productId.trim() || !creatorUsername.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await testingApi.evaluateAesthetic(productId.trim(), creatorUsername.trim());
      if (res.status === 'error') {
        setError(res.message || 'Unknown error occurred.');
      } else {
        setResult(res);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || 'Request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const scoreColor = (score?: number) => {
    if (score === undefined) return '#6b7280';
    if (score >= 70) return '#16a34a';
    if (score >= 40) return '#d97706';
    return '#dc2626';
  };

  const ScoreChip = ({ score, label }: { score?: number; label: string }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 72, height: 72, borderRadius: '50%',
        background: scoreColor(score), color: '#fff',
        fontWeight: 800, fontSize: '1.4rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        {score ?? '—'}
      </div>
      <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Testing</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
        Run Phase 3 (Aesthetic) + Phase 4 (Video Analysis) for any Product + Creator pair.
      </p>

      {/* Input Form */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem',
      }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Product ID</label>
          <input
            id="testing-product-id" type="text" value={productId}
            onChange={e => setProductId(e.target.value)}
            placeholder="e.g. 1732277516319232208"
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem', outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Creator Username</label>
          <input
            id="testing-creator-username" type="text" value={creatorUsername}
            onChange={e => setCreatorUsername(e.target.value)}
            placeholder="e.g. una_flor_cubana"
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem', outline: 'none' }}
          />
        </div>
        <button
          id="testing-run-aesthetic" onClick={handleRun}
          disabled={isLoading || !productId.trim() || !creatorUsername.trim()}
          style={{
            background: isLoading ? '#9ca3af' : '#000', color: '#fff', border: 'none', borderRadius: 8,
            padding: '0.65rem 1.5rem', fontWeight: 600, fontSize: '0.9rem',
            cursor: isLoading ? 'not-allowed' : 'pointer', alignSelf: 'flex-start',
          }}
        >
          {isLoading ? 'Running Analysis (Phase 3 + 4)…' : 'Run Aesthetic Check'}
        </button>
        {isLoading && (
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
            Phase 4 downloads and analyzes videos — this may take 20–40 seconds.
          </p>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '1rem', color: '#b91c1c', fontSize: '0.875rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Header */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{result.product_title}</div>
            <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: 4 }}>
              Tier: <strong>{result.tier}</strong> &nbsp;·&nbsp; @{result.creator_username} &nbsp;·&nbsp; {result.videos_analyzed} videos fetched &nbsp;·&nbsp; {result.videos_downloaded_for_analysis} videos analyzed
            </div>
            {/* Scores Row */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem' }}>
              <ScoreChip score={result.aesthetic_score} label="Phase 3 Score" />
              <ScoreChip score={result.visual_score} label="Phase 4 Score" />
            </div>
          </div>

          {/* Phase 3 Reasoning */}
          {result.aesthetic_reasoning && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>Phase 3 — Aesthetic Reasoning</div>
              <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{result.aesthetic_reasoning}</p>
            </div>
          )}

          {/* Phase 4 Video Reasoning */}
          {result.visual_reasoning && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>Phase 4 — Video Analysis Reasoning</div>
              <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{result.visual_reasoning}</p>
            </div>
          )}

          {/* Matched / Missing Patterns */}
          {((result.matched_patterns?.length ?? 0) > 0 || (result.missing_patterns?.length ?? 0) > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#15803d', marginBottom: 8 }}>✅ Matched Patterns</div>
                {(result.matched_patterns ?? []).map((p, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: '#166534', marginBottom: 4 }}>• {p}</div>
                ))}
                {(result.matched_patterns?.length ?? 0) === 0 && <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>None observed</div>}
              </div>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#c2410c', marginBottom: 8 }}>⚠️ Missing Patterns</div>
                {(result.missing_patterns ?? []).map((p, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: '#9a3412', marginBottom: 4 }}>• {p}</div>
                ))}
                {(result.missing_patterns?.length ?? 0) === 0 && <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>None missing</div>}
              </div>
            </div>
          )}

          {/* Evidence Videos */}
          {(result.top_3_video_urls?.length ?? 0) > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>Top Evidence Videos (Phase 3 Selection)</div>
              {(result.top_3_video_urls ?? []).map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', color: '#2563eb', fontSize: '0.8rem', marginBottom: 4, wordBreak: 'break-all' }}>
                  {i + 1}. {url}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
