# The Places I've Been — My Personal Travel Journal

A private, single-user digital travel scrapbook built with React, TypeScript, and Supabase.

## Private Supabase Setup

1. Create a new Supabase project.
2. Open the **SQL Editor** in your Supabase Dashboard and run [`supabase/schema.sql`](./supabase/schema.sql).
   - Creates `destinations` and `destination_photos` tables with strict Row-Level Security (`auth.uid() = user_id`).
   - Creates a private Storage bucket named `travel-photos` (`public = false`) with owner-only folder policies and signed URL access.
3. Keep the journal single-user and private:
   - In **Authentication → Providers / Sign Up**, disable public user sign-ups ("Allow new users to sign up" = off).
   - Under **Authentication → Users**, manually create your own single owner email + password account.
4. Copy `.env.example` to `.env` and fill in:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
5. Start the app:
   ```bash
   npm install
   npm run dev
   ```

> If `.env` is not configured yet, the welcome cover also includes a **Local Browser Journal** preview mode powered by IndexedDB so entries and uploaded photographs persist locally in your browser until you connect Supabase.

