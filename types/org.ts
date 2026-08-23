export type Organization = {
  id: string;
  name: string;
  slug: string;

  role:
    | "owner"
    | "admin"
    | "staff"
    | "volunteer";

  members: number;
  events: number;
};