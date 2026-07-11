"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    // Decode JWT to get email (base64 decode the payload)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setUserEmail(payload.sub || "")
    } catch {
      // Invalid token
      localStorage.removeItem("token")
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/patients", label: "Patients" },
    { href: "/ai", label: "AI Extraction" },
    { href: "/audit", label: "Audit Logs" },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border p-8 flex flex-col justify-between">
        <div>
          <div className="mb-16">
            <span className="font-mono-label text-muted-foreground block mb-2">
              Lumen — 001
            </span>
            <h2 className="font-serif text-2xl text-foreground">
              EMR
            </h2>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-3 font-mono-label transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <div className="pt-8 border-t border-border">
            <span className="font-mono-label text-muted-foreground block mb-2">
              Signed in as
            </span>
            <p className="font-serif text-sm text-foreground mb-4 truncate">
              {userEmail}
            </p>
            <button
              onClick={handleLogout}
              className="font-mono-label text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout →
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}