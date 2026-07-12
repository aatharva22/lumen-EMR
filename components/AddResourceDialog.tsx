"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api"

type ResourceType = "observation" | "medication" | "condition"

interface Props {
  patientId: string
  type: ResourceType
  onClose: () => void
  onSuccess: () => void
}

export default function AddResourceDialog({
  patientId,
  type,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Observation fields
  const [obsCode, setObsCode] = useState("")
  const [obsValue, setObsValue] = useState("")
  const [obsUnit, setObsUnit] = useState("")

  // Medication fields
  const [medName, setMedName] = useState("")
  const [medDosage, setMedDosage] = useState("")
  const [medFrequency, setMedFrequency] = useState("")
  const [medNotes, setMedNotes] = useState("")

  // Condition fields
  const [condCode, setCondCode] = useState("")
  const [condDescription, setCondDescription] = useState("")
  const [condNotes, setCondNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (type === "observation") {
        await apiClient("/fhir/Observation", {
          method: "POST",
          body: {
            patient_id: patientId,
            code: obsCode,
            value: obsValue,
            unit: obsUnit || null,
            status: "final",
            effective_date: new Date().toISOString(),
          },
        })
      } else if (type === "medication") {
        await apiClient("/fhir/MedicationRequest", {
          method: "POST",
          body: {
            patient_id: patientId,
            medication_name: medName,
            dosage: medDosage,
            frequency: medFrequency,
            status: "active",
            prescribed_date: new Date().toISOString(),
            notes: medNotes || "",
          },
        })
      } else if (type === "condition") {
        await apiClient("/fhir/Condition", {
          method: "POST",
          body: {
            patient_id: patientId,
            code: condCode,
            description: condDescription,
            clinical_status: "active",
            onset_date: new Date().toISOString(),
            notes: condNotes || "",
          },
        })
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setLoading(false)
    }
  }

  const title =
    type === "observation"
      ? "Add observation"
      : type === "medication"
      ? "Add medication"
      : "Add condition"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ backgroundColor: "rgba(26, 26, 26, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-background border border-border max-w-2xl w-full p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8">
          <span className="font-mono-label text-muted-foreground block mb-3">
            New record
          </span>
          <h2 className="font-serif text-3xl text-foreground">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === "observation" && (
            <>
              <FormField
                label="Code (e.g., blood-pressure, heart-rate)"
                value={obsCode}
                onChange={setObsCode}
                required
              />
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  label="Value"
                  value={obsValue}
                  onChange={setObsValue}
                  required
                />
                <FormField
                  label="Unit (e.g., mmHg, bpm)"
                  value={obsUnit}
                  onChange={setObsUnit}
                />
              </div>
            </>
          )}

          {type === "medication" && (
            <>
              <FormField
                label="Medication name"
                value={medName}
                onChange={setMedName}
                required
              />
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  label="Dosage (e.g., 10mg)"
                  value={medDosage}
                  onChange={setMedDosage}
                  required
                />
                <FormField
                  label="Frequency (e.g., once daily)"
                  value={medFrequency}
                  onChange={setMedFrequency}
                  required
                />
              </div>
              <FormField
                label="Notes"
                value={medNotes}
                onChange={setMedNotes}
              />
            </>
          )}

          {type === "condition" && (
            <>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="font-mono-label text-muted-foreground block mb-2">
                    ICD-10 code
                  </label>
                  <input
                    type="text"
                    value={condCode}
                    onChange={(e) => setCondCode(e.target.value)}
                    required
                    placeholder="I10"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-mono-label text-muted-foreground block mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={condDescription}
                    onChange={(e) => setCondDescription(e.target.value)}
                    required
                    placeholder="Essential hypertension"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-lg"
                  />
                </div>
              </div>
              <FormField
                label="Notes"
                value={condNotes}
                onChange={setCondNotes}
              />
            </>
          )}

          {error && (
            <div
              className="p-4 text-sm border border-accent font-serif"
              style={{ color: "var(--accent)" }}
            >
              {error}
            </div>
          )}

          <div className="pt-6 border-t border-border flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-foreground text-background text-sm tracking-[0.15em] uppercase font-mono hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-border text-foreground text-sm tracking-[0.15em] uppercase font-mono hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="font-mono-label text-muted-foreground block mb-2">
        {label} {required && "*"}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-0 py-2 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-lg"
      />
    </div>
  )
}