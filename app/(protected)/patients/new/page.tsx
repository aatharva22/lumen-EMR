"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { Patient } from "@/types"

export default function NewPatientPage() {
  const router = useRouter()
  const [familyName, setFamilyName] = useState("")
  const [givenName, setGivenName] = useState("")
  const [gender, setGender] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const patient = await apiClient<Patient>("/fhir/Patient", {
        method: "POST",
        body: {
          family_name: familyName,
          given_name: givenName,
          gender: gender || null,
          birth_date: birthDate || null,
          active: true,
        },
      })
      router.push(`/patients/${patient.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create patient")
      setLoading(false)
    }
  }

  return (
    <div className="p-16 max-w-3xl">
      <Link
        href="/patients"
        className="font-mono-label text-muted-foreground hover:text-foreground inline-block mb-12"
      >
        ← Back to patients
      </Link>

      <div className="mb-16">
        <span className="font-mono-label text-muted-foreground block mb-4">
          New patient
        </span>
        <h1 className="font-serif text-5xl text-foreground mb-4">
          Add a patient.
        </h1>
        <p
          className="font-serif text-lg"
          style={{ color: "var(--ink-soft)" }}
        >
          Create a new patient record. Only name is required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="font-mono-label text-muted-foreground block mb-3">
              First name *
            </label>
            <input
              type="text"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              required
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-xl"
              placeholder="Alice"
            />
          </div>
          <div>
            <label className="font-mono-label text-muted-foreground block mb-3">
              Last name *
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-xl"
              placeholder="Smith"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="font-mono-label text-muted-foreground block mb-3">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-xl"
            >
              <option value="">Not specified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="font-mono-label text-muted-foreground block mb-3">
              Date of birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-xl"
            />
          </div>
        </div>

        {error && (
          <div
            className="p-4 text-sm border border-accent font-serif"
            style={{ color: "var(--accent)" }}
          >
            {error}
          </div>
        )}

        <div className="pt-8 border-t border-border flex gap-4">
          <button
            type="submit"
            disabled={loading || !givenName || !familyName}
            className="px-8 py-4 bg-foreground text-background text-sm tracking-[0.15em] uppercase font-mono hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Creating..." : "Create patient →"}
          </button>
          <Link
            href="/patients"
            className="px-8 py-4 border border-border text-foreground text-sm tracking-[0.15em] uppercase font-mono hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}