"use client"

import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background p-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-16">
          <div>
            <span className="font-mono-label text-muted-foreground block mb-4">
              Dashboard
            </span>
            <h1 className="font-serif text-6xl text-foreground">
              Welcome back.
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 border border-border text-sm tracking-[0.15em] uppercase font-mono hover:bg-foreground hover:text-background transition-colors"
          >
            Logout →
          </button>
        </div>

        <p
          className="font-serif text-2xl leading-relaxed max-w-2xl"
          style={{ color: "var(--ink-soft)" }}
        >
          Your authenticated dashboard. We will build the patient list,
          observations timeline, and AI extraction interface here next.
        </p>
      </div>
    </div>
  )
}