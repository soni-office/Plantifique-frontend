import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/useToast';

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithTikTok, isLoading, isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithTikTok();
    } catch {
      toast({
        title: 'Login failed',
        description: 'Unable to start TikTok Shop login. Please try again.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">TikTok Shop Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to manage sample requests and agents from your dashboard.
        </p>

        <Button onClick={handleLogin} isLoading={isLoading} className="mt-6 w-full">
          Login with TikTok Shop
        </Button>
      </div>
    </div>
  );
}
