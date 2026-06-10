
CREATE TABLE public.role_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_role public.app_role NOT NULL,
  to_role public.app_role NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_change_requests TO authenticated;
GRANT ALL ON public.role_change_requests TO service_role;

ALTER TABLE public.role_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert their own role requests"
  ON public.role_change_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view their own role requests"
  ON public.role_change_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update role requests"
  ON public.role_change_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX role_change_requests_user_id_idx ON public.role_change_requests(user_id);
CREATE INDEX role_change_requests_status_idx ON public.role_change_requests(status);

CREATE TRIGGER update_role_change_requests_updated_at
  BEFORE UPDATE ON public.role_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
