import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface Session {
  email: string
  token: string // base64 of email:apppassword
}

interface AuthContextValue {
  session: Session | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = 'mont.family.session'

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession)

  const login = useCallback(async (email: string, password: string) => {
    const token = btoa(`${email}:${password}`)
    const resp = await fetch('/api/calendar/verify', {
      headers: { 'X-Cal-Auth': token },
    })
    if (!resp.ok) {
      const d = await resp.json().catch(() => ({}))
      throw new Error((d as any).error ?? 'Invalid credentials')
    }
    const s: Session = { email, token }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
