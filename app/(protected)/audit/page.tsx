"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { AuditLog } from "@/types"

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [filterEmail, setFilterEmail] = useState("")

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAction, filterEmail])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "100" })
      if (filterAction) params.append("action", filterAction)
      if (filterEmail) params.append("user_email", filterEmail)
      const data = await apiClient<AuditLog[]>(`/audit/logs?${params}`)
      setLogs(data)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }

  const actionColors: Record<string, string> = {
    READ: "var(--ink-muted)",
    CREATE: "var(--accent)",
    UPDATE: "var(--ink-soft)",
    DELETE: "var(--accent)",
  }

  return (
    <div className="p-16 max-w-6xl">
      <div className="mb-16">
        <span className="font-mono-label text-muted-foreground block mb-4">
          Audit
        </span>
        <h1 className="font-serif text-5xl text-foreground mb-4">
          Every action, logged.
        </h1>
        <p
          className="font-serif text-xl max-w-2xl"
          style={{ color: "var(--ink-soft)" }}
        >
          HIPAA-aligned audit trail. Every PHI interaction is recorded via
          middleware with user, action, resource, and timestamp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pb-8 border-b border-border">
        <div>
          <label className="font-mono-label text-muted-foreground block mb-3">
            Filter by action
          </label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full px-0 py-3 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-lg"
          >
            <option value="">All actions</option>
            <option value="READ">READ</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div>
          <label className="font-mono-label text-muted-foreground block mb-3">
            Filter by user email
          </label>
          <input
            type="text"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            placeholder="e.g., dr.jones@hospital.com"
            className="w-full px-0 py-3 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-lg"
          />
        </div>
      </div>

      {error && (
        <div
          className="mb-8 p-4 text-sm border border-accent font-serif"
          style={{ color: "var(--accent)" }}
        >
          {error}
          {error.includes("403") && (
            <p className="mt-2" style={{ color: "var(--ink-muted)" }}>
              Only admins can view audit logs. Sign in as admin@hospital.com.
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-xl" style={{ color: "var(--ink-soft)" }}>
            No audit logs match your filters.
          </p>
        </div>
      ) : (
        <div>
          <p className="font-mono-label text-muted-foreground mb-6">
            {logs.length} entries
          </p>
          <div className="border-t border-border">
            {logs.map((log) => (
              <div
                key={log.id}
                className="py-4 border-b border-border grid grid-cols-12 gap-4 items-center"
              >
                <div className="col-span-2">
                  <span
                    className="font-mono-label"
                    style={{
                      color: actionColors[log.action] || "var(--ink-soft)",
                    }}
                  >
                    {log.action}
                  </span>
                </div>
                <div className="col-span-4">
                  <p
                    className="font-serif text-sm text-foreground truncate"
                    title={log.path}
                  >
                    {log.method} {log.path}
                  </p>
                </div>
                <div className="col-span-3">
                  {log.user_email ? (
                    <>
                      <p
                        className="font-serif text-sm text-foreground truncate"
                        title={log.user_email}
                      >
                        {log.user_email}
                      </p>
                      <span className="font-mono-label text-muted-foreground">
                        {log.user_role}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono-label text-muted-foreground">
                      unauthenticated
                    </span>
                  )}
                </div>
                <div className="col-span-1">
                  <span
                    className="font-mono-label"
                    style={{
                      color:
                        log.status_code >= 400
                          ? "var(--accent)"
                          : "var(--ink-soft)",
                    }}
                  >
                    {log.status_code}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="font-mono-label text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}