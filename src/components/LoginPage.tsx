import { useState, type FormEvent } from 'react'
import { Home, Loader2 } from 'lucide-react'
import { useAuth } from '../auth'

const USERS = ['johno@mont.family', 'olivia@mont.family']

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState(USERS[0])
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center">
            <Home size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">mont.family</h1>
          <p className="text-sm text-slate-400">Sign in with your Fastmail app password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Account</label>
            <div className="grid grid-cols-2 gap-2">
              {USERS.map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setEmail(u)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-colors border ${
                    email === u
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {u.split('@')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-slate-400 mb-1.5">
              App password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="text-xs text-slate-600 text-center mt-6">
          Generate an app password at{' '}
          <a href="https://app.fastmail.com/settings/security/devicekeys" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300">
            Fastmail Settings → Security
          </a>
        </p>
      </div>
    </div>
  )
}
