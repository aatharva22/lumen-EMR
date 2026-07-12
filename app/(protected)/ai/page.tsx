"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { Patient } from "@/types"

interface ObservationDraft {
  code: string
  value: string
  unit?: string
  status: string
  include: boolean
}

interface MedicationDraft {
  medication_name: string
  dosage: string
  frequency: string
  status: string
  notes?: string | null
  include: boolean
}

interface ConditionDraft {
  code: string
  description: string
  clinical_status: string
  notes?: string | null
  include: boolean
}

interface ExtractedResponse {
  patient_id: string
  extracted: {
    observations: Omit<ObservationDraft, "include">[]
    medications: Omit<MedicationDraft, "include">[]
    conditions: Omit<ConditionDraft, "include">[]
  }
}

export default function AIExtractionPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [note, setNote] = useState("")

  const [observations, setObservations] = useState<ObservationDraft[]>([])
  const [medications, setMedications] = useState<MedicationDraft[]>([])
  const [conditions, setConditions] = useState<ConditionDraft[]>([])

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [hasExtracted, setHasExtracted] = useState(false)

  useEffect(() => {
    apiClient<Patient[]>("/fhir/Patient")
      .then((data) => setPatients(data))
      .catch(() => {})
  }, [])

  const handleExtract = async () => {
    if (!selectedPatientId || !note.trim()) {
      setError("Select a patient and enter a note.")
      return
    }
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const data = await apiClient<ExtractedResponse>("/ai/extract", {
        method: "POST",
        body: { patient_id: selectedPatientId, note },
      })

      // Mark everything as included by default
      setObservations(
        data.extracted.observations.map((o) => ({ ...o, include: true }))
      )
      setMedications(
        data.extracted.medications.map((m) => ({ ...m, include: true }))
      )
      setConditions(
        data.extracted.conditions.map((c) => ({ ...c, include: true }))
      )
      setHasExtracted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSelected = async () => {
    setError("")
    setSuccess("")
    setSaving(true)

    const selectedObs = observations.filter((o) => o.include)
    const selectedMeds = medications.filter((m) => m.include)
    const selectedConds = conditions.filter((c) => c.include)

    if (
      selectedObs.length === 0 &&
      selectedMeds.length === 0 &&
      selectedConds.length === 0
    ) {
      setError("Select at least one item to save.")
      setSaving(false)
      return
    }

    try {
      // Save observations
      for (const obs of selectedObs) {
        await apiClient("/fhir/Observation", {
          method: "POST",
          body: {
            patient_id: selectedPatientId,
            code: obs.code,
            value: obs.value,
            unit: obs.unit || null,
            status: obs.status,
          },
        })
      }

      // Save medications
      for (const med of selectedMeds) {
        await apiClient("/fhir/MedicationRequest", {
          method: "POST",
          body: {
            patient_id: selectedPatientId,
            medication_name: med.medication_name,
            dosage: med.dosage,
            frequency: med.frequency,
            status: med.status,
            prescribed_date: new Date().toISOString(),
            notes: med.notes || "",
          },
        })
      }

      // Save conditions
      for (const cond of selectedConds) {
        await apiClient("/fhir/Condition", {
          method: "POST",
          body: {
            patient_id: selectedPatientId,
            code: cond.code,
            description: cond.description,
            clinical_status: cond.clinical_status,
            onset_date: new Date().toISOString(),
            notes: cond.notes || "",
          },
        })
      }

      const total =
        selectedObs.length + selectedMeds.length + selectedConds.length
      setSuccess(`${total} resource${total === 1 ? "" : "s"} saved to patient record.`)
      setNote("")
      setObservations([])
      setMedications([])
      setConditions([])
      setHasExtracted(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const sampleNote =
    "Patient presents with BP 140/90, complaining of headache for 3 days. History of hypertension. Started on lisinopril 10mg daily. Follow up in 2 weeks."

  const includedCount =
    observations.filter((o) => o.include).length +
    medications.filter((m) => m.include).length +
    conditions.filter((c) => c.include).length

  return (
    <div className="p-16 max-w-6xl">
      <div className="mb-16">
        <span className="font-mono-label text-muted-foreground block mb-4">
          AI Extraction
        </span>
        <h1 className="font-serif text-5xl text-foreground mb-4">
          Turn notes into structured records.
        </h1>
        <p
          className="font-serif text-xl max-w-2xl"
          style={{ color: "var(--ink-soft)" }}
        >
          Paste a clinical note. Llama 3.3 70B extracts vitals, medications, and
          diagnoses. Review, edit, and save what you want.
        </p>
      </div>

      {/* Patient selector */}
      <div className="mb-8">
        <label className="font-mono-label text-muted-foreground block mb-3">
          Patient
        </label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full px-0 py-3 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-xl"
        >
          <option value="">Select a patient...</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.given_name} {p.family_name}
            </option>
          ))}
        </select>
      </div>

      {/* Note textarea */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-3">
          <label className="font-mono-label text-muted-foreground">
            Clinical note
          </label>
          <button
            onClick={() => setNote(sampleNote)}
            className="font-mono-label text-muted-foreground hover:text-foreground transition-colors"
          >
            Insert sample →
          </button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={8}
          placeholder="e.g., Pt BP 140/90, c/o headache x3d, hx HTN, started lisinopril 10mg daily..."
          className="w-full p-4 bg-transparent border border-border focus:border-foreground focus:outline-none text-foreground font-serif text-lg resize-none transition-colors"
        />
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={handleExtract}
          disabled={loading || !selectedPatientId || !note.trim()}
          className="px-8 py-4 border border-foreground text-foreground text-sm tracking-[0.15em] uppercase font-mono hover:bg-foreground hover:text-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Extracting..." : hasExtracted ? "Re-extract" : "Extract"}
        </button>
      </div>

      {error && (
        <div
          className="mb-8 p-4 text-sm border border-accent font-serif"
          style={{ color: "var(--accent)" }}
        >
          {error}
        </div>
      )}

      {success && (
        <div className="mb-8 p-4 text-sm border border-foreground font-serif text-foreground">
          {success}
        </div>
      )}

      {/* Editable extraction */}
      {hasExtracted && (
        <div className="mt-12 border-t border-border pt-12">
          <div className="flex justify-between items-baseline mb-8">
            <span className="font-mono-label text-muted-foreground">
              Review & edit — {includedCount} selected
            </span>
          </div>

          {observations.length > 0 && (
            <section className="mb-12">
              <h2 className="font-serif text-2xl text-foreground mb-4">
                Observations
              </h2>
              <div className="space-y-4">
                {observations.map((obs, i) => (
                  <EditableRow
                    key={i}
                    included={obs.include}
                    onToggle={(v) =>
                      setObservations((prev) =>
                        prev.map((o, idx) =>
                          idx === i ? { ...o, include: v } : o
                        )
                      )
                    }
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <EditableField
                        label="Code"
                        value={obs.code}
                        onChange={(v) =>
                          setObservations((prev) =>
                            prev.map((o, idx) =>
                              idx === i ? { ...o, code: v } : o
                            )
                          )
                        }
                      />
                      <EditableField
                        label="Value"
                        value={obs.value}
                        onChange={(v) =>
                          setObservations((prev) =>
                            prev.map((o, idx) =>
                              idx === i ? { ...o, value: v } : o
                            )
                          )
                        }
                      />
                      <EditableField
                        label="Unit"
                        value={obs.unit || ""}
                        onChange={(v) =>
                          setObservations((prev) =>
                            prev.map((o, idx) =>
                              idx === i ? { ...o, unit: v } : o
                            )
                          )
                        }
                      />
                      <EditableField
                        label="Status"
                        value={obs.status}
                        onChange={(v) =>
                          setObservations((prev) =>
                            prev.map((o, idx) =>
                              idx === i ? { ...o, status: v } : o
                            )
                          )
                        }
                      />
                    </div>
                  </EditableRow>
                ))}
              </div>
            </section>
          )}

          {medications.length > 0 && (
            <section className="mb-12">
              <h2 className="font-serif text-2xl text-foreground mb-4">
                Medications
              </h2>
              <div className="space-y-4">
                {medications.map((med, i) => (
                  <EditableRow
                    key={i}
                    included={med.include}
                    onToggle={(v) =>
                      setMedications((prev) =>
                        prev.map((m, idx) =>
                          idx === i ? { ...m, include: v } : m
                        )
                      )
                    }
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <EditableField
                        label="Medication"
                        value={med.medication_name}
                        onChange={(v) =>
                          setMedications((prev) =>
                            prev.map((m, idx) =>
                              idx === i ? { ...m, medication_name: v } : m
                            )
                          )
                        }
                      />
                      <EditableField
                        label="Dosage"
                        value={med.dosage}
                        onChange={(v) =>
                          setMedications((prev) =>
                            prev.map((m, idx) =>
                              idx === i ? { ...m, dosage: v } : m
                            )
                          )
                        }
                      />
                      <EditableField
                        label="Frequency"
                        value={med.frequency}
                        onChange={(v) =>
                          setMedications((prev) =>
                            prev.map((m, idx) =>
                              idx === i ? { ...m, frequency: v } : m
                            )
                          )
                        }
                      />
                      <EditableField
                        label="Status"
                        value={med.status}
                        onChange={(v) =>
                          setMedications((prev) =>
                            prev.map((m, idx) =>
                              idx === i ? { ...m, status: v } : m
                            )
                          )
                        }
                      />
                    </div>
                  </EditableRow>
                ))}
              </div>
            </section>
          )}

          {conditions.length > 0 && (
            <section className="mb-12">
              <h2 className="font-serif text-2xl text-foreground mb-4">
                Conditions
              </h2>
              <div className="space-y-4">
                {conditions.map((cond, i) => (
                  <EditableRow
                    key={i}
                    included={cond.include}
                    onToggle={(v) =>
                      setConditions((prev) =>
                        prev.map((c, idx) =>
                          idx === i ? { ...c, include: v } : c
                        )
                      )
                    }
                  >
                    <div className="grid grid-cols-3 gap-4">
                      <EditableField
                        label="ICD-10"
                        value={cond.code}
                        onChange={(v) =>
                          setConditions((prev) =>
                            prev.map((c, idx) =>
                              idx === i ? { ...c, code: v } : c
                            )
                          )
                        }
                      />
                      <EditableField
                        label="Description"
                        value={cond.description}
                        onChange={(v) =>
                          setConditions((prev) =>
                            prev.map((c, idx) =>
                              idx === i ? { ...c, description: v } : c
                            )
                          )
                        }
                      />
                      <EditableField
                        label="Status"
                        value={cond.clinical_status}
                        onChange={(v) =>
                          setConditions((prev) =>
                            prev.map((c, idx) =>
                              idx === i ? { ...c, clinical_status: v } : c
                            )
                          )
                        }
                      />
                    </div>
                  </EditableRow>
                ))}
              </div>
            </section>
          )}

          <div className="pt-8 border-t border-border">
            <button
              onClick={handleSaveSelected}
              disabled={saving || includedCount === 0}
              className="px-8 py-4 bg-foreground text-background text-sm tracking-[0.15em] uppercase font-mono hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {saving
                ? "Saving..."
                : `Save ${includedCount} selected →`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EditableRow({
  included,
  onToggle,
  children,
}: {
  included: boolean
  onToggle: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div
      className={`border p-4 transition-opacity ${
        included ? "border-border" : "border-border opacity-40"
      }`}
    >
      <div className="flex items-start gap-4">
        <label className="flex items-center cursor-pointer pt-6">
          <input
            type="checkbox"
            checked={included}
            onChange={(e) => onToggle(e.target.checked)}
            className="w-4 h-4 accent-foreground cursor-pointer"
          />
        </label>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

function EditableField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="font-mono-label text-muted-foreground block mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-0 py-1 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-foreground font-serif text-base"
      />
    </div>
  )
}