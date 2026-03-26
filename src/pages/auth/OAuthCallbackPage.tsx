import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../hooks/useToast';

/**
 * Handles the post-TikTok-OAuth redirect from the backend.
 *
 * New flow: backend exchanges the code server-side and redirects here with
 * ?tiktok_connected=true on success, or ?error=<msg> on failure.
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const params = new URLSearchParams(window.location.search);

    if (params.get('tiktok_connected') === 'true') {
      toast({
        title: 'TikTok Shop connected',
        description: 'Your shop is now linked to this org.',
        variant: 'success',
      });
      navigate('/dashboard', { replace: true });
      return;
    }

    const error = params.get('error');
    toast({
      title: 'TikTok connection failed',
      description: error ?? 'Unexpected callback. Please try again.',
      variant: 'error',
    });
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
      Finalizing TikTok authorization…
    </div>
  );
}
