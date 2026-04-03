export interface UserProfile {
  id: string;
  name: string | null;
  age: number | null;
  phone: string | null;
  guardian_contact: string | null;
  doctor_contact: string | null;
  avatar_url: string | null;
  theme_preference: string;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: "daily" | "weekly" | "custom";
  times: string[];
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  user_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: "taken" | "missed" | "pending";
  taken_at: string | null;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  medication_id: string | null;
  type: "reminder" | "guardian" | "doctor" | "whatsapp";
  message: string;
  status: "sent" | "delivered" | "failed" | "demo";
  created_at: string;
}

export interface MedicationWithLogs extends Medication {
  medication_logs?: MedicationLog[];
}
