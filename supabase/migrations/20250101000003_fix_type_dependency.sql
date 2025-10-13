/*
          # [Fix Schema Creation Order]
          This script corrects the order of operations in the database schema setup. It ensures that custom ENUM types are created *before* the tables that rely on them, resolving the "type does not exist" error. It uses `IF NOT EXISTS` to safely create only the missing objects without causing errors on existing ones.

          ## Query Description: [This operation will create missing tables, types, functions, and security policies. It is designed to be non-destructive and will not alter or delete any existing data. It is safe to run on your current database to bring it up to the required schema version.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Creates ENUM types: `wallet_type`, `transaction_type`
          - Creates Tables: `profiles`, `wallets`, `goals`, `investments`, `transactions`
          - Creates Function: `handle_new_user`
          - Creates Trigger: `on_auth_user_created`
          - Enables RLS and creates policies for all tables.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Policies are based on `auth.uid()`]
          
          ## Performance Impact:
          - Indexes: [Primary keys and foreign keys are indexed by default.]
          - Triggers: [Adds one trigger on `auth.users` for profile creation.]
          - Estimated Impact: [Low. The changes are structural and will have minimal impact on performance until the tables are populated with a large amount of data.]
          */

-- Create custom ENUM types first if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_type') THEN
        CREATE TYPE public.wallet_type AS ENUM ('spending', 'savings');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');
    END IF;
END$$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamp with time zone,
    full_name text,
    avatar_url text
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    type public.wallet_type NOT NULL,
    balance numeric NOT NULL DEFAULT 0
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    target_amount numeric NOT NULL,
    current_amount numeric NOT NULL DEFAULT 0,
    deadline date,
    emoji text,
    color text
);

-- Create investments table
CREATE TABLE IF NOT EXISTS public.investments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    symbol text NOT NULL,
    quantity numeric NOT NULL,
    current_value numeric NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    description text NOT NULL,
    amount numeric NOT NULL,
    type public.transaction_type NOT NULL,
    category text
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own wallets." ON public.wallets;
CREATE POLICY "Users can view their own wallets." ON public.wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own wallets." ON public.wallets;
CREATE POLICY "Users can create their own wallets." ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wallets." ON public.wallets;
CREATE POLICY "Users can update their own wallets." ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own goals." ON public.goals;
CREATE POLICY "Users can view their own goals." ON public.goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own goals." ON public.goals;
CREATE POLICY "Users can create their own goals." ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own goals." ON public.goals;
CREATE POLICY "Users can update their own goals." ON public.goals FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own investments." ON public.investments;
CREATE POLICY "Users can view their own investments." ON public.investments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own investments." ON public.investments;
CREATE POLICY "Users can create their own investments." ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own investments." ON public.investments;
CREATE POLICY "Users can update their own investments." ON public.investments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transactions." ON public.transactions;
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own transactions." ON public.transactions;
CREATE POLICY "Users can create their own transactions." ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own transactions." ON public.transactions;
CREATE POLICY "Users can update their own transactions." ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
