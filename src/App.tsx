import { AppRouter } from './routes';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
      <Toaster />
    </ErrorBoundary>
  );
}
