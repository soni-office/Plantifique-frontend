import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/useToast';

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithEmail, isLoading, isAuthenticated, initializeAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { initializeAuth(); }, [initializeAuth]);

  // Redirect once auth state resolves
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    try {
      await loginWithEmail(email.trim(), password);
      // Navigation happens via the isAuthenticated effect above
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      let msg = 'Login failed. Please try again.';
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(code)) {
        msg = 'Invalid email or password.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please try again later.';
      }
      toast({ title: 'Sign in failed', description: msg, variant: 'error' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Plantifique</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to manage sample requests and AI analysis.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account? Ask your admin to invite you.
        </p>
      </div>
    </div>
  );
}
