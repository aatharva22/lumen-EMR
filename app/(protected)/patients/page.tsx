"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { Patient } from "@/types"

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    apiClient<Patient[]>("/fhir/Patient")
      .then((data) => setPatients(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.given_name} ${p.family_name}`.toLowerCase()
    return fullName.includes(search.toLowerCase())
  })

  return (
    <div className="p-16 max-w-6xl">
      <div className="mb-16 flex justify-between items-start">
  <div>
    <span className="font-mono-label text-muted-foreground block mb-4">
      Patients
    </span>
    <h1 className="font-serif text-5xl text-foreground mb-2">
      All patients
    </h1>
    <p className="font-serif text-lg" style={{ color: "var(--ink-soft)" }}>
      {loading ? "Loading..." : `${filteredPatients.length} records`}
    </p>
  </div>
  <Link
    href="/patients/new"
    className="px-6 py-3 bg-foreground text-background text-sm tracking-[0.15em] uppercase font-mono hover:opacity-90 transition-opacity"
  >
    + New patient
  </Link>
</div>

      <div className="mb-8 border-b border-border pb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-0 focus:outline-none text-foreground font-serif text-xl placeholder:text-muted-foreground"
        />
      </div>

      {error && (
        <div
          className="mb-8 p-4 text-sm border border-accent"
          style={{ color: "var(--accent)" }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="py-24 text-center">
          <p
            className="font-serif text-xl"
            style={{ color: "var(--ink-soft)" }}
          >
            No patients found.
          </p>
        </div>
      ) : (
        <div className="border-t border-border">
          {filteredPatients.map((patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className="flex items-center justify-between py-6 border-b border-border hover:bg-muted transition-colors group px-4 -mx-4"
            >
              <div className="flex-1">
                <h3 className="font-serif text-2xl text-foreground group-hover:text-accent transition-colors">
                  {patient.given_name} {patient.family_name}
                </h3>
                <div className="flex items-center gap-6 mt-2">
                  {patient.gender && (
                    <span className="font-mono-label text-muted-foreground">
                      {patient.gender}
                    </span>
                  )}
                  {patient.birth_date && (
                    <span className="font-mono-label text-muted-foreground">
                      DOB {patient.birth_date}
                    </span>
                  )}
                  <span
                    className="font-mono-label"
                    style={{
                      color: patient.active
                        ? "var(--ink-soft)"
                        : "var(--ink-muted)",
                    }}
                  >
                    {patient.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <span className="font-mono-label text-muted-foreground group-hover:text-foreground transition-colors">
                View →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}