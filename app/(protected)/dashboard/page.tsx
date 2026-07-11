"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { Patient } from "@/types"

export default function DashboardPage() {
  const [patientCount, setPatientCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient<Patient[]>("/fhir/Patient")
      .then((data) => setPatientCount(data.length))
      .catch(() => setPatientCount(0))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-16 max-w-5xl">
      <div className="mb-16">
        <span className="font-mono-label text-muted-foreground block mb-4">
          Overview
        </span>
        <h1 className="font-serif text-6xl text-foreground mb-6">
          Welcome back.
        </h1>
        <p
          className="font-serif text-2xl leading-relaxed max-w-2xl"
          style={{ color: "var(--ink-soft)" }}
        >
          A FHIR R4-compliant patient management system with an AI documentation
          layer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <StatCard
          label="Total patients"
          value={loading ? "—" : String(patientCount)}
        />
        <StatCard label="FHIR resources" value="4" />
        <StatCard label="AI endpoints" value="3" />
      </div>

      <div className="border-t border-border pt-16">
        <span className="font-mono-label text-muted-foreground block mb-6">
          Quick actions
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionLink
            href="/patients"
            title="Browse patients"
            description="View, search, and manage patient records"
          />
          <ActionLink
            href="/ai"
            title="Extract from note"
            description="Paste a clinical note and let AI structure it"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-foreground pt-6">
      <span className="font-mono-label text-muted-foreground block mb-4">
        {label}
      </span>
      <span className="font-serif text-5xl text-foreground">{value}</span>
    </div>
  )
}

function ActionLink({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="block border border-border p-8 hover:border-foreground transition-colors group"
    >
      <h3 className="font-serif text-2xl text-foreground mb-2 group-hover:text-accent transition-colors">
        {title} →
      </h3>
      <p
        className="text-sm font-serif"
        style={{ color: "var(--ink-soft)" }}
      >
        {description}
      </p>
    </Link>
  )
}