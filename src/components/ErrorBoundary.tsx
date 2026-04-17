import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error("[ErrorBoundary] Caught rendering error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8 bg-slate-50">
          <div className="max-w-md w-full rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-rose-700 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-600 mb-1">A rendering error occurred in this section.</p>
            {this.state.message && (
              <pre className="mt-2 text-[11px] text-slate-500 bg-slate-50 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all border border-slate-200">
                {this.state.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
