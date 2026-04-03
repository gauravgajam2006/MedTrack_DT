-- ==========================================
-- MEDTRACK DATABASE AUDIT & FIX SCRIPT
-- ==========================================

BEGIN;

-- ----------------------------------------------------
-- 1. FIX SCHEMA & DEFAULT VALUES
-- ----------------------------------------------------
-- Ensure user_id correctly defaults to the authenticated user ID on row insert.
-- This prevents "user_id may not be linked properly" errors from the frontend.
ALTER TABLE public.medications ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.medication_logs ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.notification_logs ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Ensure medications schema precisely matches frontend usage
-- The columns we need are already present, but let's confirm the types:
-- id (uuid), user_id (uuid), name (text), dosage (text), frequency (text)
-- times (text[]), start_date (date), end_date (date), created_at (timestamptz)

-- Add a strict time format constraint for Reminder Data Validation
-- Checks that all entries in the `times` array are strictly formatted as "HH:mm"
CREATE OR REPLACE FUNCTION public.check_times_format(times text[]) 
RETURNS boolean AS $$
BEGIN
    RETURN (
        times IS NULL OR 
        (
            array_length(times, 1) > 0 AND 
            NOT EXISTS (
                -- Fails if any element doesn't match standard 24h format (e.g. 08:30, 23:59)
                SELECT 1 FROM unnest(times) t WHERE t !~ '^[0-2][0-9]:[0-5][0-9]$'
            )
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE public.medications DROP CONSTRAINT IF EXISTS times_format_check;
ALTER TABLE public.medications ADD CONSTRAINT times_format_check 
CHECK (public.check_times_format(times));


-- ----------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------
-- Ensure RLS is explicitly enabled on all public tables to prevent unauthorized data access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------
-- 3. ENSURE RLS POLICIES FOR SECURE DATA ACCESS
-- ----------------------------------------------------
-- We re-create the policies correctly mapping to auth.uid()
-- (If these already exist they will throw an error, so we DROP first just in case)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own data" ON public.' || quote_ident(t);
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert own data" ON public.' || quote_ident(t);
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own data" ON public.' || quote_ident(t);
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete own data" ON public.' || quote_ident(t);
    END LOOP;
END $$;

-- Policies for public.users
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

-- Policies for public.medications
CREATE POLICY "Users can view own data" ON public.medications FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own data" ON public.medications FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own data" ON public.medications FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own data" ON public.medications FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Policies for public.medication_logs
CREATE POLICY "Users can view own data" ON public.medication_logs FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own data" ON public.medication_logs FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own data" ON public.medication_logs FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own data" ON public.medication_logs FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Policies for public.notification_logs
CREATE POLICY "Users can view own data" ON public.notification_logs FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own data" ON public.notification_logs FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own data" ON public.notification_logs FOR DELETE USING ((SELECT auth.uid()) = user_id);


-- ----------------------------------------------------
-- 4. AUTHENTICATION LINKING TRIGGERS
-- ----------------------------------------------------
-- This trigger properly links new authentication signups to the public.users database
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and recreate it to be completely foolproof
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ----------------------------------------------------
-- 5. REAL-TIME SUPPORT
-- ----------------------------------------------------
-- Enable real-time updates for frontend notification and dashboard sync hooks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'medications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.medications;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'medication_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.medication_logs;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notification_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_logs;
    END IF;
END $$;

COMMIT;
