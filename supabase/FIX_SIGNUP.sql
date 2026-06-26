-- Run this in Supabase Dashboard → SQL Editor
-- Fixes: "Database error saving new user" on signup

-- Remove the broken trigger (profile is created by the FastAPI backend instead)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Optional: keep a fixed trigger if you prefer DB-side profile creation
-- (uncomment block below and comment out DROP TRIGGER above)

/*
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
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;

DROP POLICY IF EXISTS "Auth admin can insert profiles" ON public.profiles;
CREATE POLICY "Auth admin can insert profiles"
    ON public.profiles FOR INSERT TO supabase_auth_admin WITH CHECK (true);

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/