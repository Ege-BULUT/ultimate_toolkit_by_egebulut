import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Plugin error boundary - catches render errors in plugin components
 * so a single broken plugin doesn't take down the whole app.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(`[ErrorBoundary] Caught:`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: "var(--color-surface-alt)",
            border: "1px solid var(--color-error)",
          }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-error)" }}>
            ⚠️ Plugin crashed
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
            {this.state.error?.message || "An unexpected error occurred in this plugin."}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
