# Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In project **Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or use Publishable key as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
3. Add these to `.env.local` (see `.env.example`).
4. Run the migration: in Supabase Dashboard go to **SQL Editor**, paste the contents of `migrations/20250301000000_create_profiles.sql`, and run it. This creates the `profiles` table, RLS policies, and the trigger that creates a profile row when a user signs up (default role: `investor`).
5. Optional: in **Authentication → Providers** enable Email and set "Confirm email" as needed.

Roles: `investor` (dashboard), `staff` (staff panel), `admin`. New users get `investor`; change role in Supabase Table Editor or via SQL for staff/admin access.
