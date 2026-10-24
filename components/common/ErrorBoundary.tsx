import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Zmiana wartości (np. pathname) zdejmuje fallback — nawigacja wychodzi z błędu. */
  resetKey?: string;
  /**
   * Własny fallback. 'minimal' = pełnoekranowy komunikat „odśwież stronę” dla granicy
   * zewnętrznej (całe App: Navbar/Footer/CookieBanner/modal) — bez białego ekranu.
   */
  fallback?: ReactNode | 'minimal';
}

interface State {
  error: Error | null;
}

// lazy() zapamiętuje odrzucony import — ponowny render nic nie da, pomaga tylko reload.
const CHUNK_ERROR_RE =
  /dynamically imported module|Importing a module script failed|Failed to fetch|ChunkLoadError|Loading chunk/i;

export const isChunkLoadError = (error: unknown) =>
  CHUNK_ERROR_RE.test(error instanceof Error ? `${error.name} ${error.message}` : String(error));

class ErrorBoundary extends Component<Props, State> {
  public state: State = { error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private retry = () => {
    if (isChunkLoadError(this.state.error)) window.location.reload();
    else this.setState({ error: null });
  };

  public render() {
    if (!this.state.error) return this.props.children;

    const { fallback } = this.props;
    if (fallback === 'minimal') {
      return (
        <div
          data-error-boundary=""
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
            background: '#f9fafb',
            color: '#111827',
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Coś poszło nie tak — odśwież stronę</h1>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: '10px 24px', fontWeight: 700, borderRadius: 9999, cursor: 'pointer' }}
          >
            Odśwież stronę
          </button>
          <a href="/" style={{ textDecoration: 'underline' }}>
            Strona główna
          </a>
        </div>
      );
    }
    if (fallback !== undefined) return fallback;

    return (
      <div
        data-error-boundary=""
        className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700 p-8"
      >
        <h1 className="text-4xl font-bold mb-4">Coś poszło nie tak.</h1>
        <p className="text-lg mb-8">Przepraszamy, wystąpił nieoczekiwany błąd.</p>
        <button
          onClick={this.retry}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
