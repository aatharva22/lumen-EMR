"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { PatientEverything } from "@/types"

type Tab = "overview" | "observations" | "medications" | "conditions"

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  const [data, setData] = useState<PatientEverything | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  useEffect(() => {
    apiClient<PatientEverything>(`/fhir/Patient/${patientId}/$everything`)
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [patientId])

  if (loading) {
    return (
      <div className="p-16">
        <div className="h-8 w-32 bg-muted animate-pulse mb-4" />
        <div className="h-16 w-96 bg-muted animate-pulse" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-16">
        <Link
          href="/patients"
          className="font-mono-label text-muted-foreground hover:text-foreground"
        >
          ← Back to patients
        </Link>
        <p className="mt-8 font-serif text-xl" style={{ color: "var(--accent)" }}>
          {error || "Patient not found"}
        </p>
      </div>
    )
  }

  const { patient, observations, medications, conditions } = data

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "overview", label: "Overview", count: 0 },
    { id: "observations", label: "Observations", count: observations.length },
    { id: "medications", label: "Medications", count: medications.length },
    { id: "conditions", label: "Conditions", count: conditions.length },
  ]

  return (
    <div className="p-16 max-w-6xl">
      <Link
        href="/patients"
        className="font-mono-label text-muted-foreground hover:text-foreground inline-block mb-12"
      >
        ← Back to patients
      </Link>

      {/* Patient header */}
      <div className="mb-16 pb-8 border-b border-border">
        <span className="font-mono-label text-muted-foreground block mb-4">
          Patient
        </span>
        <h1 className="font-serif text-6xl text-foreground mb-6">
          {patient.given_name} {patient.family_name}
        </h1>
        <div className="flex gap-8">
          {patient.gender && (
            <div>
              <span className="font-mono-label text-muted-foreground block">
                Gender
              </span>
              <span className="font-serif text-lg text-foreground">
                {patient.gender}
              </span>
            </div>
          )}
          {patient.birth_date && (
            <div>
              <span className="font-mono-label text-muted-foreground block">
                Date of birth
              </span>
              <span className="font-serif text-lg text-foreground">
                {patient.birth_date}
              </span>
            </div>
          )}
          <div>
            <span className="font-mono-label text-muted-foreground block">
              Status
            </span>
            <span className="font-serif text-lg text-foreground">
              {patient.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-12">
        <nav className="flex gap-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 font-mono-label transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 opacity-60">({tab.count})</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <OverviewTab
          observationCount={observations.length}
          medicationCount={medications.length}
          conditionCount={conditions.length}
        />
      )}

      {activeTab === "observations" && (
        <div className="space-y-6">
          {observations.length === 0 ? (
            <EmptyState label="No observations recorded." />
          ) : (
            observations.map((obs) => (
              <div key={obs.id} className="border-b border-border pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-2xl text-foreground capitalize">
                      {obs.code.replace(/-/g, " ")}
                    </h3>
                    <p
                      className="font-serif text-xl mt-1"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {obs.value} {obs.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-label text-muted-foreground block">
                      {obs.status}
                    </span>
                    {obs.effective_date && (
                      <span className="font-mono-label text-muted-foreground block mt-1">
                        {new Date(obs.effective_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "medications" && (
        <div className="space-y-6">
          {medications.length === 0 ? (
            <EmptyState label="No medications prescribed." />
          ) : (
            medications.map((med) => (
              <div key={med.id} className="border-b border-border pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-2xl text-foreground">
                      {med.medication_name}
                    </h3>
                    <p
                      className="font-serif text-lg mt-1"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {med.dosage} · {med.frequency}
                    </p>
                    {med.notes && (
                      <p
                        className="font-serif text-sm mt-2"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        {med.notes}
                      </p>
                    )}
                  </div>
                  <span className="font-mono-label text-muted-foreground">
                    {med.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "conditions" && (
        <div className="space-y-6">
          {conditions.length === 0 ? (
            <EmptyState label="No conditions recorded." />
          ) : (
            conditions.map((cond) => (
              <div key={cond.id} className="border-b border-border pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-2xl text-foreground">
                      {cond.description}
                    </h3>
                    <p
                      className="font-mono-label mt-2"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      ICD-10 · {cond.code}
                    </p>
                    {cond.notes && (
                      <p
                        className="font-serif text-sm mt-2"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        {cond.notes}
                      </p>
                    )}
                  </div>
                  <span className="font-mono-label text-muted-foreground">
                    {cond.clinical_status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function OverviewTab({
  observationCount,
  medicationCount,
  conditionCount,
}: {
  observationCount: number
  medicationCount: number
  conditionCount: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="border-t border-foreground pt-6">
        <span className="font-mono-label text-muted-foreground block mb-4">
          Observations
        </span>
        <span className="font-serif text-5xl text-foreground">
          {observationCount}
        </span>
      </div>
      <div className="border-t border-foreground pt-6">
        <span className="font-mono-label text-muted-foreground block mb-4">
          Medications
        </span>
        <span className="font-serif text-5xl text-foreground">
          {medicationCount}
        </span>
      </div>
      <div className="border-t border-foreground pt-6">
        <span className="font-mono-label text-muted-foreground block mb-4">
          Conditions
        </span>
        <span className="font-serif text-5xl text-foreground">
          {conditionCount}
        </span>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-24 text-center">
      <p
        className="font-serif text-xl"
        style={{ color: "var(--ink-soft)" }}
      >
        {label}
      </p>
    </div>
  )
}