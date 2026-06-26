import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Top-level error boundary. Catches render-time errors anywhere in the tree and
 * shows a recoverable fallback instead of a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to the console for debugging; swap for a logging service in prod.
    console.error('Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="eyebrow text-primary">Terjadi kesalahan</p>
        <h1 className="font-serif text-2xl font-semibold text-ink">Halaman gagal dimuat</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Maaf, terjadi galat tak terduga. Coba muat ulang halaman. Jika masih terjadi setelah
          refresh, pesan teknisnya ada di bawah.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-1 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Muat ulang
        </button>
        <pre className="mt-2 max-w-lg overflow-auto rounded-md bg-black/[0.04] p-3 text-left text-xs text-muted-foreground">
          {this.state.error.message}
        </pre>
      </div>
    )
  }
}
