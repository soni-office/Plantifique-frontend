import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../hooks/useToast';

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { completeOAuthCallback } = useAuthStore();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code || !state) {
        toast({
          title: 'OAuth callback error',
          description: 'Missing code or state.',
          variant: 'error',
        });
        navigate('/login', { replace: true });
        return;
      }

      try {
        await completeOAuthCallback(code, state);
        navigate('/dashboard', { replace: true });
      } catch {
        toast({
          title: 'Authentication failed',
          description: 'Could not complete TikTok OAuth exchange.',
          variant: 'error',
        });
        navigate('/login', { replace: true });
      }
    };

    void run();
  }, [completeOAuthCallback, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
      Finalizing TikTok authorization...
    </div>
  );
}
