-- Fix: "Database error saving new user" on email signup
-- Cause: handle_new_user trigger blocked by RLS / missing grants for supabase_auth_admin

-- Recreate trigger function with correct security settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1),
            ''
        )
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    RETURN NEW;
END;
$$;

-- Allow Supabase Auth to insert profiles during signup
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;
GRANT ALL ON TABLE public.worker_profiles TO supabase_auth_admin;

-- RLS policy so auth admin can insert during trigger execution
DROP POLICY IF EXISTS "Auth admin can insert profiles" ON public.profiles;
CREATE POLICY "Auth admin can insert profiles"
    ON public.profiles
    FOR INSERT
    TO supabase_auth_admin
    WITH CHECK (true);

-- Users can insert their own profile (fallback)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);