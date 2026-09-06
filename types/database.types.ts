// Types générés manuellement à partir des migrations SQL (supabase/migrations).
// À régénérer avec `supabase gen types typescript` une fois le CLI disponible.

export type UserRole = "ADMIN" | "DOCTOR" | "SECRETARY"
export type Gender = "M" | "F"
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
export type DiseaseStatus = "ACTIVE" | "RESOLVED" | "CHRONIC"
export type AppointmentStatus =
  | "PLANNED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "ABSENT"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
        Relationships: []
      }
      doctors: {
        Row: {
          id: string
          profile_id: string
          speciality: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          speciality?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["doctors"]["Insert"]>
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          gender: Gender | null
          birth_date: string | null
          weight_kg: number | null
          height_cm: number | null
          blood_group: BloodGroup | null
          phone: string | null
          email: string | null
          address: string | null
          allergies: string | null
          medical_history: string | null
          chronic_diseases: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          gender?: Gender | null
          birth_date?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          blood_group?: BloodGroup | null
          phone?: string | null
          email?: string | null
          address?: string | null
          allergies?: string | null
          medical_history?: string | null
          chronic_diseases?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>
        Relationships: []
      }
      diseases: {
        Row: {
          id: string
          name: string
          code: string | null
          description: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["diseases"]["Insert"]>
        Relationships: []
      }
      patient_diseases: {
        Row: {
          id: string
          patient_id: string
          disease_id: string
          diagnosed_at: string | null
          status: DiseaseStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          disease_id: string
          diagnosed_at?: string | null
          status?: DiseaseStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<
          Database["public"]["Tables"]["patient_diseases"]["Insert"]
        >
        Relationships: [
          {
            foreignKeyName: "patient_diseases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_diseases_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "diseases"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          start_at: string
          end_at: string
          reason: string | null
          status: AppointmentStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          start_at: string
          end_at: string
          reason?: string | null
          status?: AppointmentStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          id: string
          appointment_id: string | null
          patient_id: string
          doctor_id: string
          consultation_date: string
          reason: string | null
          symptoms: string | null
          clinical_examination: string | null
          diagnosis: string | null
          treatment: string | null
          medical_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id?: string | null
          patient_id: string
          doctor_id: string
          consultation_date?: string
          reason?: string | null
          symptoms?: string | null
          clinical_examination?: string | null
          diagnosis?: string | null
          treatment?: string | null
          medical_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<
          Database["public"]["Tables"]["consultations"]["Insert"]
        >
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_reports: {
        Row: {
          id: string
          patient_id: string
          consultation_id: string | null
          doctor_id: string | null
          title: string
          report_type: string | null
          description: string | null
          report_date: string
          file_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          consultation_id?: string | null
          doctor_id?: string | null
          title: string
          report_type?: string | null
          description?: string | null
          report_date?: string
          file_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<
          Database["public"]["Tables"]["medical_reports"]["Insert"]
        >
        Relationships: [
          {
            foreignKeyName: "medical_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_reports_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_reports_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_notes: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          consultation_id: string | null
          title: string | null
          content: string
          note_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          consultation_id?: string | null
          title?: string | null
          content: string
          note_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<
          Database["public"]["Tables"]["medical_notes"]["Insert"]
        >
        Relationships: [
          {
            foreignKeyName: "medical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_notes_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_notes_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
