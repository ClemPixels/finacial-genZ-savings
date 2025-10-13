/*
          # [Initial Schema Setup]
          This script sets up the complete initial database schema for the financial application. It creates tables for profiles, wallets, transactions, goals, and investments. It also configures Row Level Security (RLS) to ensure users can only access their own data and sets up a trigger to automatically create a user profile upon sign-up.

          ## Query Description: This operation is structural and foundational. It is safe to run on a new project but could cause issues if run on a project with existing, conflicting tables. It defines the core data structure for the entire application.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "High"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Creates Tables: `profiles`, `wallets`, `transactions`, `goals`, `investments`
          - Creates Types: `wallet_type`, `transaction_type`
          - Creates Function: `handle_new_user()`
          - Creates Trigger: `on_auth_user_created`
          
          ## Security Implications:
          - RLS Status: Enabled on all new tables.
          - Policy Changes: Yes, creates ownership and access policies for all tables.
          - Auth Requirements: Policies are linked to `auth.uid()`.
          
          ## Performance Impact:
          - Indexes: Primary keys and foreign keys will have indexes created automatically.
          - Triggers: Adds one trigger on the `auth.users` table.
          - Estimated Impact: Low impact on a new database.
          */

-- Create a table for public profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamptz,
  full_name text,
  avatar_url text
);

-- Set up Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- This trigger automatically creates a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function after a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Wallets Table
CREATE TYPE public.wallet_type AS ENUM ('spending', 'savings');
CREATE TABLE public.wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type public.wallet_type NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own wallets." ON public.wallets FOR ALL USING (auth.uid() = user_id);

-- Transactions Table
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL,
  type public.transaction_type NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transactions." ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Goals Table
CREATE TABLE public.goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric NOT NULL DEFAULT 0,
  deadline date,
  emoji text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals." ON public.goals FOR ALL USING (auth.uid() = user_id);

-- Investments Table
CREATE TABLE public.investments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  symbol text NOT NULL,
  quantity numeric NOT NULL,
  current_value numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own investments." ON public.investments FOR ALL USING (auth.uid() = user_id);
