-- =========================================================
-- event_members table
-- =========================================================
CREATE TABLE public.event_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.event_roles(id),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL, -- Nullable for Global Admins
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'invited', 'declined'
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id) -- Prevents adding the same user twice to an event
);

-- =========================================================
-- Helper: is the current user *any* member of this event?
-- SECURITY DEFINER so it bypasses RLS on event_members itself,
-- avoiding self-referential recursion.
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_event_member(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_members em
    WHERE em.event_id = p_event_id
      AND em.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_event_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_event_member(uuid) TO authenticated;

-- Note: is_event_admin(uuid) and is_event_org_admin(uuid) are reused
-- from the event_roles migration — no need to redefine them here.

-- =========================================================
-- Enable RLS
-- =========================================================
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- Read Policy: members of the event (or parent org) can view roster
-- =========================================================
CREATE POLICY "Allow members to view event roster"
ON public.event_members
FOR SELECT
TO authenticated
USING (
  public.is_event_member(event_id)
  OR public.is_event_org_admin(event_id)
);

-- =========================================================
-- Write Policies: split by command, using SECURITY DEFINER helpers
-- =========================================================

CREATE POLICY "Allow admins to insert event members"
ON public.event_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_event_admin(event_id)
  OR public.is_event_org_admin(event_id)
);

CREATE POLICY "Allow admins to update event members"
ON public.event_members
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

CREATE POLICY "Allow admins to delete event members"
ON public.event_members
FOR DELETE
TO authenticated
USING (
  public.is_event_admin(event_id)
  OR public.is_event_org_admin(event_id)
);