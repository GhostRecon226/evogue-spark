import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/unsubscribe')({
  component: UnsubscribePage,
})

type State =
  | { kind: 'loading' }
  | { kind: 'invalid' }
  | { kind: 'already' }
  | { kind: 'ready' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

function UnsubscribePage() {
  const [token, setToken] = useState<string | null>(null)
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token')
    if (!t) {
      setState({ kind: 'invalid' })
      return
    }
    setToken(t)
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) {
          setState({ kind: 'invalid' })
          return
        }
        if (data.valid === false && data.reason === 'already_unsubscribed') {
          setState({ kind: 'already' })
          return
        }
        if (data.valid) {
          setState({ kind: 'ready' })
          return
        }
        setState({ kind: 'invalid' })
      })
      .catch(() => setState({ kind: 'invalid' }))
  }, [])

  async function confirm() {
    if (!token) return
    setState({ kind: 'submitting' })
    try {
      const r = await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        setState({
          kind: 'error',
          message: data?.error ?? 'Something went wrong.',
        })
        return
      }
      if (data.success === false && data.reason === 'already_unsubscribed') {
        setState({ kind: 'already' })
        return
      }
      setState({ kind: 'success' })
    } catch (e: any) {
      setState({ kind: 'error', message: e?.message ?? 'Network error.' })
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Email preferences
        </h1>

        {state.kind === 'loading' && (
          <p className="mt-3 text-sm text-muted-foreground">Checking link…</p>
        )}

        {state.kind === 'invalid' && (
          <p className="mt-3 text-sm text-muted-foreground">
            This unsubscribe link is invalid or has expired.
          </p>
        )}

        {state.kind === 'already' && (
          <p className="mt-3 text-sm text-muted-foreground">
            You're already unsubscribed. No further action needed.
          </p>
        )}

        {state.kind === 'ready' && (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Click confirm to stop receiving emails from Evogue Academy.
            </p>
            <div className="mt-6">
              <Button onClick={confirm}>Confirm unsubscribe</Button>
            </div>
          </>
        )}

        {state.kind === 'submitting' && (
          <p className="mt-3 text-sm text-muted-foreground">Processing…</p>
        )}

        {state.kind === 'success' && (
          <p className="mt-3 text-sm text-foreground">
            You've been unsubscribed. We're sorry to see you go.
          </p>
        )}

        {state.kind === 'error' && (
          <p className="mt-3 text-sm text-destructive">{state.message}</p>
        )}
      </div>
    </main>
  )
}
