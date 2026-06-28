"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { LoginResponse } from "@/types"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await apiClient<LoginResponse>("/auth/login", {
        method: "POST",
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      })

      localStorage.setItem("token", data.access_token)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 border-r border-border">
        <div>
          <span className="font-mono-label text-muted-foreground">
            Lumen — 001
          </span>
        </div>

        <div className="max-w-md">
          <h1 className="font-serif text-6xl text-foreground leading-tight mb-8">
            EMR for the AI era.
          </h1>
          <p
            className="font-serif text-3xl leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            A FHIR R4-compliant patient management system with an AI
            documentation layer that turns physician notes into structured
            clinical records.
          </p>
        </div>

        <div className="font-mono-label text-muted-foreground">
          HIPAA · FHIR R4 · Llama 3.3 70B
        </div>
      </div>

      {/* Right side — login form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm">
          <div className="mb-12">
            <span className="font-mono-label text-muted-foreground block mb-4">
              Sign In
            </span>
            <h2 className="font-serif text-5xl text-foreground">
              Welcome back.
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="font-mono-label text-muted-foreground block mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none focus:ring-0 text-foreground font-serif text-xl transition-colors"
                placeholder="dr.jones@hospital.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="font-mono-label text-muted-foreground block mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none focus:ring-0 text-foreground font-serif text-xl transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-sm" style={{ color: "var(--accent)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-4 text-sm tracking-[0.15em] uppercase font-mono hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-border">
            <span className="font-mono-label text-muted-foreground block mb-4">
              Demo Accounts
            </span>
            <div
              className="space-y-2 text-base"
              style={{ color: "var(--ink-soft)" }}
            >
              <div className="flex justify-between font-serif">
                <span>admin@hospital.com</span>
                <span className="font-mono text-xs">admin123</span>
              </div>
              <div className="flex justify-between font-serif">
                <span>dr.jones@hospital.com</span>
                <span className="font-mono text-xs">doctor123</span>
              </div>
              <div className="flex justify-between font-serif">
                <span>alice@email.com</span>
                <span className="font-mono text-xs">patient123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}