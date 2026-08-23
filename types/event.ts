type EventStatus = 
    | "Upcoming"
    | "Ongoing"
    | "Ended"
    | "Draft";

export type Event = {
  id: string;
  org_id: string;
  organizationSlug:string;
  name: string;
  slug: string;
  description:string;
location: string;
starts_at:string;
  status: EventStatus;
};

export interface EventRole {
  id: string;
  eventId: string;
  name: string;
  rank: number; // 1 = Admin, 2 = Team Lead, 3 = Volunteer
}
export interface EventMember {
  id: string;
  eventId: string;
  userId: string; // Foreign key -> auth.users.id
  roleId: string; // Foreign key -> event_roles.id
  teamId: string | null; // Nullable for global admins or unassigned members
  status: MemberStatus;
  joinedAt: string;
}
export interface EventMemberWithDetails extends EventMember {
  user: User; // Standard Supabase auth user object
  role: EventRole;
  team: Team | null;
}