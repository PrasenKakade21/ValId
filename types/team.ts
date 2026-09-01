import { EventRole } from "./event";
import { User } from '@supabase/supabase-js';

export type Team = {
  id: string;
  event_id: string;
  org_id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  memberIds: string[] | null;
};

// ==========================================
// Joined UI Models (For Renders & Components)
// ==========================================

/**
 * Represents a member within a Team view context
 * Used when rendering the team roster card or workspace.
 */
export interface TeamMember {
  member_id: string; // event_members.id
  user_id: string;
  team_id: string;
  assigned_at: string;
  joinedAt: string;
  role: EventRole;   // Joined role object
}

export interface TeamMemberWithDetails extends TeamMember {
  user: User; // Standard Supabase auth user object
  role: EventRole;
  team: Team | null;
}