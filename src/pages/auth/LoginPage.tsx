import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/useToast';

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithTikTok, loginWithEmail, isLoading, isAuthenticated, initializeAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [emailMode, setEmailMode] = useState(false);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleTikTokLogin = async () => {
    try {
      await loginWithTikTok();
    } catch {
      toast({ title: 'Login failed', description: 'Unable to start TikTok Shop login.', variant: 'error' });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await loginWithEmail(email.trim());
      navigate('/dashboard', { replace: true });
    } catch {
      toast({
        title: 'Login failed',
        description: 'Email not found. Ask your Admin to invite you.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Plantifique</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to manage sample requests and AI analysis from your dashboard.
        </p>

        <div className="mt-8 space-y-4">
          {/* ── Standard Email Login (for team members) ── */}
          {emailMode ? (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Work Email
              </label>
              <input
                id="email-input"
                type="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <Button type="submit" isLoading={isLoading} className="w-full">
                Sign In
              </Button>
              <button
                type="button"
                onClick={() => setEmailMode(false)}
                className="w-full text-sm text-slate-400 hover:text-slate-600"
              >
                ← Back
              </button>
            </form>
          ) : (
            <>
              <Button
                id="email-login-btn"
                onClick={() => setEmailMode(true)}
                className="w-full"
                variant="outline"
              >
                Sign in with Email
              </Button>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex-1 border-t border-slate-200" />
                <span>Admin only</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* ── TikTok Admin Login ── */}
              <Button
                id="tiktok-login-btn"
                onClick={handleTikTokLogin}
                isLoading={isLoading}
                className="w-full bg-black text-white hover:bg-slate-800"
              >
                Connect TikTok Shop
              </Button>
              <p className="text-center text-xs text-slate-400">
                Only the Shop Owner needs this. Team members use email above.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
