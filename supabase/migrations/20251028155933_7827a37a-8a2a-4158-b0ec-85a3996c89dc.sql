-- Add admin role to melhorsaude2025@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE email = 'melhorsaude2025@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;