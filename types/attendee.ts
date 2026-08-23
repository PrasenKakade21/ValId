export interface AttendeeRecord {
  id: string; // UUID
  ticket_code: string;
  full_name: string;
  role: string;
  company: string | null;
  email: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}
export interface AttendeeInput {
  ticketCode: string;
  fullName: string;
  role: string;
  company: string | null;
  email: string | null;
}
