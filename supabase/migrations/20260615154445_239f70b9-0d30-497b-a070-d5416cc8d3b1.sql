-- Backfill: if the admin email already exists in auth, grant admin role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(u.email) = 'evogueconsulting@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger: when this email signs up in the future, auto-assign admin
CREATE OR REPLACE FUNCTION public.seed_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'evogueconsulting@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS seed_admin_on_signup ON auth.users;
CREATE TRIGGER seed_admin_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.seed_admin_on_signup();