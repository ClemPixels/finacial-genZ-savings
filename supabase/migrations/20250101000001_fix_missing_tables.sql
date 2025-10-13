-- Supabase Migration: Idempotent Schema Setup
-- This script safely creates all necessary tables, functions, and policies.
-- It uses "IF NOT EXISTS" and "CREATE OR REPLACE" to avoid errors if objects already exist.

/*
          # Create Wallets Table
          [This operation creates the 'wallets' table if it does not already exist. This table stores different financial accounts for each user, like spending or savings.]

          ## Query Description: [This query is safe to run multiple times. It will not affect existing data in the 'wallets' table if it's already present. It simply ensures the table structure is correct.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Table: public.wallets
          - Columns: id, user_id, name, type, balance, created_at
          
          ## Security Implications:
          - RLS Status: Will be enabled.
          - Policy Changes: Policies will be created in a subsequent step.
          - Auth Requirements: Requires user to be authenticated.
          
          ## Performance Impact:
          - Indexes: Primary key on 'id' and foreign key on 'user_id'.
          - Triggers: None.
          - Estimated Impact: Negligible.
          */
CREATE TABLE IF NOT EXISTS public.wallets (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    type public.wallet_type NOT NULL,
    balance numeric NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT wallets_pkey PRIMARY KEY (id),
    CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

/*
          # Create Goals Table
          [This operation creates the 'goals' table if it does not already exist. This table stores user-defined savings goals.]

          ## Query Description: [This query is safe to run multiple times. It ensures the 'goals' table exists without altering existing data.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Table: public.goals
          
          ## Security Implications:
          - RLS Status: Will be enabled.
          - Policy Changes: Policies will be created.
          
          ## Performance Impact:
          - Estimated Impact: Negligible.
          */
CREATE TABLE IF NOT EXISTS public.goals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    target_amount numeric NOT NULL,
    current_amount numeric NOT NULL DEFAULT 0,
    deadline date NULL,
    emoji character varying NULL,
    color character varying NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT goals_pkey PRIMARY KEY (id),
    CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

/*
          # Create Transactions Table
          [This operation creates the 'transactions' table if it does not already exist. This table logs all financial transactions.]

          ## Query Description: [This query is safe to run multiple times. It ensures the 'transactions' table exists without altering existing data.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Table: public.transactions
          
          ## Security Implications:
          - RLS Status: Will be enabled.
          - Policy Changes: Policies will be created.
          
          ## Performance Impact:
          - Estimated Impact: Negligible.
          */
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    description character varying NOT NULL,
    amount numeric NOT NULL,
    type public.transaction_type NOT NULL,
    category character varying NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

/*
          # Create Investments Table
          [This operation creates the 'investments' table if it does not already exist. This table tracks user investments.]

          ## Query Description: [This query is safe to run multiple times. It ensures the 'investments' table exists without altering existing data.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Table: public.investments
          
          ## Security Implications:
          - RLS Status: Will be enabled.
          - Policy Changes: Policies will be created.
          
          ## Performance Impact:
          - Estimated Impact: Negligible.
          */
CREATE TABLE IF NOT EXISTS public.investments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    symbol character varying NOT NULL,
    quantity numeric NOT NULL,
    current_value numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT investments_pkey PRIMARY KEY (id),
    CONSTRAINT investments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Policies
-- Drop and recreate policies to ensure they are up-to-date.

-- Wallets Policies
DROP POLICY IF EXISTS "Users can view their own wallets." ON public.wallets;
CREATE POLICY "Users can view their own wallets." ON public.wallets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own wallets." ON public.wallets;
CREATE POLICY "Users can create their own wallets." ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own wallets." ON public.wallets;
CREATE POLICY "Users can update their own wallets." ON public.wallets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Goals Policies
DROP POLICY IF EXISTS "Users can view their own goals." ON public.goals;
CREATE POLICY "Users can view their own goals." ON public.goals FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own goals." ON public.goals;
CREATE POLICY "Users can create their own goals." ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own goals." ON public.goals;
CREATE POLICY "Users can update their own goals." ON public.goals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view their own transactions." ON public.transactions;
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own transactions." ON public.transactions;
CREATE POLICY "Users can create their own transactions." ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Investments Policies
DROP POLICY IF EXISTS "Users can view their own investments." ON public.investments;
CREATE POLICY "Users can view their own investments." ON public.investments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own investments." ON public.investments;
CREATE POLICY "Users can create their own investments." ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure handle_new_user function and trigger are correctly set up
-- This was likely correct from the first migration, but we ensure it's up-to-date.
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
