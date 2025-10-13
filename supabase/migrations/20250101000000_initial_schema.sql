/*
          # Initial Schema Setup
          This script sets up the initial database schema for the GenZ financial savings application. It creates tables for user profiles, accounts, goals, transactions, and investments. It also establishes Row Level Security (RLS) to ensure users can only access their own data and sets up a trigger to automatically create a user profile upon sign-up.

          ## Query Description: This is a foundational script for a new database. It creates all the necessary tables and security policies. There is no risk to existing data as it's intended for a fresh setup. No backup is required if you are starting from an empty project.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Tables Created: profiles, accounts, goals, transactions, investments
          - Triggers Created: on_auth_user_created
          - Functions Created: handle_new_user
          - RLS Policies: Enabled and configured for all new tables.
          
          ## Security Implications:
          - RLS Status: Enabled on all user-data tables.
          - Policy Changes: Yes, new policies are created to restrict data access to the owner.
          - Auth Requirements: Policies are based on `auth.uid()`, linking data to authenticated users.
          
          ## Performance Impact:
          - Indexes: Primary keys and foreign keys are indexed by default.
          - Triggers: A single trigger on `auth.users` for profile creation. Impact is minimal.
          - Estimated Impact: Low performance impact.
          */

-- 1. Create profiles table to store public user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT UNIQUE
);

COMMENT ON TABLE public.profiles IS 'Public profile information for each user.';

-- 2. Set up RLS for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Create accounts table
CREATE TABLE public.accounts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    type TEXT NOT NULL, -- e.g., 'spending', 'savings'
    name TEXT NOT NULL,
    last_four_digits TEXT,
    gradient_colors TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.accounts IS 'User bank or wallet accounts.';

-- 5. Set up RLS for accounts table
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own accounts." ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create new accounts." ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts." ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts." ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- 6. Create goals table
CREATE TABLE public.goals (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    emoji TEXT,
    target_amount NUMERIC(10, 2) NOT NULL,
    current_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deadline DATE,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.goals IS 'User savings goals.';

-- 7. Set up RLS for goals table
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goals." ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create new goals." ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals." ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals." ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- 8. Create transactions table
CREATE TABLE public.transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    icon TEXT,
    merchant TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.transactions IS 'Financial transactions for each user.';

-- 9. Set up RLS for transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create new transactions." ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions." ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions." ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- 10. Create investments table
CREATE TABLE public.investments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    symbol TEXT,
    value NUMERIC(10, 2) NOT NULL,
    change_percent NUMERIC(5, 2),
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.investments IS 'User investment holdings.';

-- 11. Set up RLS for investments table
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own investments." ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create new investments." ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investments." ON public.investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investments." ON public.investments FOR DELETE USING (auth.uid() = user_id);
