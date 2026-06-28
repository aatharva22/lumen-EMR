export interface User {
  id: string
  email: string
  full_name?: string
  role: "admin" | "doctor" | "patient"
  is_active: boolean
}

export interface Patient {
  id: string
  family_name: string
  given_name: string
  gender?: string
  birth_date?: string
  active: boolean
  user_id?: string
}

export interface Observation {
  id: string
  patient_id: string
  code: string
  value: string
  unit?: string
  effective_date?: string
  status: string
}

export interface MedicationRequest {
  id: string
  patient_id: string
  medication_name: string
  dosage: string
  frequency: string
  status: string
  prescribed_date?: string
  notes?: string
}

export interface Condition {
  id: string
  patient_id: string
  code: string
  description: string
  clinical_status: string
  onset_date?: string
  notes?: string
}

export interface PatientEverything {
  resourceType: string
  type: string
  patient: Patient
  observations: Observation[]
  medications: MedicationRequest[]
  conditions: Condition[]
}

export interface AuditLog {
  id: string
  user_email?: string
  user_role?: string
  action: string
  method: string
  path: string
  status_code: number
  ip_address?: string
  timestamp: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface ApiError {
  detail: string
}