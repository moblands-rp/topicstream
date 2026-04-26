# Topic Supabase Setup (Free Tier)

## 1) Create a free Supabase project
1. Go to https://supabase.com and create an account.
2. Click **New project**.
3. Pick your organization.
4. Enter:
   - **Name**: `topic`
   - **Database Password**: create and save one safely
   - **Region**: nearest to your users
5. Click **Create new project** and wait for it to finish.

## 2) Get your project API keys
1. Open your Supabase project.
2. Go to **Project Settings -> API**.
3. Copy:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 3) Add environment variables locally
Create `/.env.local` in your Next.js project root:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4) Create watchlist table + security policies
1. In Supabase, open **SQL Editor**.
2. Open `supabase/schema.sql` from this project and copy all SQL.
3. Paste into SQL Editor and click **Run**.

This creates:
- `public.topic_watchlist` table
- row-level security (RLS)
- policies so users can only access their own rows

## 5) Configure Auth
1. Go to **Authentication -> Providers -> Email**.
2. Ensure **Email** provider is enabled.
3. Optional during testing: disable email confirmation to allow instant sign-in after register.

## 6) Run the app
```bash
npm install
npm run dev
```

## 7) Add env vars on Vercel
In Vercel Project Settings -> Environment Variables add:
- `NEXT_PUBLIC_TMDB_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Redeploy after adding them.
