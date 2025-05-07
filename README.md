# Web Ledger Lite

This is a Next.js application for personal finance management, using Supabase for backend services.

## Supabase Setup

This application uses Supabase for authentication and database storage.

### 1. Create a Supabase Project

1.  Go to [Supabase](https://supabase.com/) and sign up or log in.
2.  Create a new project.

### 2. Database Schema

Run the following SQL in the Supabase SQL Editor for your project to create the necessary tables and policies.

```sql
-- Create the transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'income' or 'expense'
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10, 2) NOT NULL, -- Adjust precision and scale as needed
  date TIMESTAMPTZ NOT NULL,
  source_fixed_cost_id UUID REFERENCES public.fixed_costs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the fixed_costs table
CREATE TABLE public.fixed_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL, -- Adjust precision and scale as needed
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for both tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions table
CREATE POLICY "Users can manage their own transactions"
ON public.transactions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for fixed_costs table
CREATE POLICY "Users can manage their own fixed costs"
ON public.fixed_costs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS transactions_user_id_date_idx ON public.transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS fixed_costs_user_id_idx ON public.fixed_costs (user_id);

-- Optional: Allow authenticated users to read their own user data from auth.users
-- This is often useful for fetching user profiles.
-- CREATE POLICY "Authenticated users can read their own user data"
-- ON auth.users FOR SELECT
-- USING (auth.uid() = id);

```

**Explanation:**

*   **`transactions` Table:** Stores individual income and expense records.
    *   `user_id`: Links to the authenticated user.
    *   `amount`: Stored as `NUMERIC` for accurate currency representation.
    *   `source_fixed_cost_id`: Optionally links a transaction to a fixed cost item.
    *   `ON DELETE CASCADE` for `user_id`: If a user is deleted, their transactions are also deleted.
    *   `ON DELETE SET NULL` for `source_fixed_cost_id`: If a fixed cost is deleted, associated transactions will have this field set to NULL.
*   **`fixed_costs` Table:** Stores recurring fixed cost items.
    *   `user_id`: Links to the authenticated user.
*   **RLS Policies:** Row Level Security is enabled to ensure users can only access and modify their own data.
    *   The policies `Users can manage their own transactions` and `Users can manage their own fixed costs` restrict operations to the data belonging to the currently authenticated user (`auth.uid()`).
*   **Indexes:** Created on `user_id` and `date` columns to improve query performance for common data retrieval patterns.

### 3. Environment Variables

Create a `.env.local` file in the root of your project and add your Supabase project URL and Anon Key:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with the actual values from your Supabase project settings (Project Settings -> API).

### 4. Authentication Settings (Supabase Dashboard)

1.  Navigate to **Authentication** -> **Providers** in your Supabase dashboard.
2.  Ensure the **Email** provider is enabled.
3.  Under **Authentication** -> **Settings**:
    *   **Disable "Confirm email"**: For this project, we are skipping email confirmation for new sign-ups to simplify the user experience. *For a production application, you would typically want email confirmation enabled.*

## Getting Started with the App

To get started with the application locally:

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Set up your `.env.local` file as described above.
4.  Ensure your Supabase database schema is set up using the SQL provided.
5.  Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:9002` (or the port specified in your `package.json`).

## Available Scripts

*   `npm run dev`: Starts the Next.js development server.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the codebase.
*   `npm run typecheck`: Checks TypeScript types.

This README provides the necessary steps to set up the backend with Supabase and run the application.
The `GUIDANCE.md` file contains previous (now outdated) guidance for a Firebase backend and can be disregarded or removed.

```