import { Event } from "./event";
import { Organization } from "./org";
import { Team } from "./team";
export type DashboardData = {
  user: {
    id: string;
    email?: string;
    name?: string | null;
  };
  organizations: Organization[];
  events: Event[];
  teams?: Team[];
};