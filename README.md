# The Places I've Been — My Personal Travel Journal

A publicly viewable, read-only digital travel scrapbook with owner-only editing, built with React, TypeScript, and Supabase.

## Access & Security Model

- **Public Visitors**: Can immediately browse the Home page, published destinations, photographs, travel dates, memories, wishlist postcards, and interactive Travel Map without logging in.
- **Unpublished / Private Entries**: Destinations marked private (`is_published = false`) and their photographs are inaccessible to anonymous visitors at both the Postgres and Storage RLS levels.
- **Owner-Only Editing**: Only the registered owner account (`public.journal_owners`) can sign in via the discreet **Owner Login** button to add, edit, publish/unpublish, feature, or delete destinations, photographs, and wishlist items.

## Supabase Setup

1. Create a Supabase project.
2. Open **Authentication → Users** and create your single owner email + password account, and disable **Allow new users to sign up** under **Authentication → Sign In / Providers**.
3. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor.
   - Creates `journal_owners`, `destinations`, and `destination_photos` with strict Row-Level Security.
   - Configures the `travel-photos` Storage bucket (`public = false`) so anonymous visitors can only read photos attached to published entries (`is_published = true`), while bucket listing and all writes remain locked to the owner.
4. Copy `.env.example` to `.env` and fill in:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
   ```
5. Start the app:
   ```bash
   npm install
   npm run dev
   ```
