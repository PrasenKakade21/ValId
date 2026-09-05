-- drop table event_roles
-- =========================================================
-- event_roles table
-- =========================================================
CREATE TABLE public.event_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., 'Admin', 'Team Lead', 'Volunteer'
  rank INT NOT NULL DEFAULT 3, -- 1 = Admin, 2 = Lead, 3 = Volunteer
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, rank)
);

-- =========================================================
-- Function to populate default roles for new events
-- (SECURITY DEFINER with pinned search_path to avoid
--  schema-shadowing privilege escalation)
-- =========================================================
CREATE OR REPLACE FUNCTION public.create_default_event_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.event_roles (event_id, name, rank)
  VALUES
    (NEW.id, 'Admin', 1),
    (NEW.id, 'Team Lead', 2),
    (NEW.id, 'Volunteer', 3);
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_create_default_event_roles
AFTER INSERT ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.create_default_event_roles();

-- =========================================================
-- Helper function: is the current user an Admin (rank = 1)
-- for a given event?
-- SECURITY DEFINER so it bypasses RLS on event_roles/event_members
-- internally, breaking the self-referential recursion that would
-- otherwise occur if this logic lived directly inside a policy
-- on event_roles.
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_event_admin(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_members em
    JOIN public.event_roles er ON er.id = em.role_id
    WHERE em.event_id = p_event_id
      AND em.user_id = auth.uid()
      AND er.rank = 1
  );
$$;

-- Optional but recommended: lock down execute permissions
REVOKE ALL ON FUNCTION public.is_event_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_event_admin(uuid) TO authenticated;

-- =========================================================
-- Helper function: is the current user an org owner/admin
-- for the org that owns a given event?
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_event_org_admin(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events e
    JOIN public.organization_members om ON om.org_id = e.org_id
    WHERE e.id = p_event_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_event_org_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_event_org_admin(uuid) TO authenticated;

-- =========================================================
-- Enable RLS
-- =========================================================
ALTER TABLE public.event_roles ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- Read Policy: members of the event (or parent org) can view roles
-- =========================================================
CREATE POLICY "Allow members to view event roles"
ON public.event_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.event_members em
    WHERE em.event_id = event_roles.event_id
      AND em.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organization_members om ON om.org_id = e.org_id
    WHERE e.id = event_roles.event_id
      AND om.user_id = auth.uid()
  )
);

-- =========================================================
-- Write Policies: split by command so they never apply to SELECT
-- (this is what avoids the infinite-recursion error), and use
-- the SECURITY DEFINER helpers so the admin-rank lookup bypasses
-- RLS instead of re-triggering it.
-- =========================================================

CREATE POLICY "Allow admins to insert event roles"
ON public.event_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_event_admin(event_id)
  OR public.is_event_org_admin(event_id)
);

CREATE POLICY "Allow admins to update event roles"
ON public.event_roles
FOR UPDATE
TO authenticated
USING (
  public.is_event_admin(event_id)
  OR public.is_event_org_admin(event_id)
)
WITH CHECK (
  public.is_event_admin(event_id)
  OR public.is_event_org_admin(event_id)
);

CREATE POLICY "Allow admins to delete event roles"
ON public.event_roles
FOR DELETE
TO authenticated
USING (
  public.is_event_admin(event_id)
  OR public.is_event_org_admin(event_id)
);