# Smart Bookmark App

- A real-time, production-ready bookmark manager built with Next.js (App Router) and Supabase.

## Live Demo
- https://smart-bookmark-app-nu-blue.vercel.app

## GitHub Repository
- https://github.com/Animesh42u2/smart-bookmark-app

## Features

- Google OAuth Authentication (Supabase)

- Add bookmarks

- Delete bookmarks

- Search bookmarks

- Real-time sync across multiple tabs

- Dark / Light mode toggle

- Row-Level Security (RLS) enforced

- Deployed on Vercel

## Tech Stack

- Next.js (App Router)

- Supabase (Auth, PostgreSQL, Realtime)

- Tailwind CSS

- Vercel

## Environment Variables

Create a `.env.local` file:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

In production, these are securely configured in Vercel Project Settings.

#  Challenges Faced & Solutions
- Missing <html> in Layout

**Problem:**
- App Router threw an error due to missing required <html> and <body> tags in layout.tsx.

**Solution:**
- Updated layout:

<html lang="en">
  <body>{children}</body>
</html>

- 2 Row-Level Security (RLS) Configuration

**Problem:**
- Insert and delete operations failed due to missing policies.

**Solution:**
- Enabled RLS and created policies:

- Allow select where auth.uid() = user_id

- Allow insert where auth.uid() = user_id

- Allow delete where auth.uid() = user_id

- Ensured bookmarks are private per user.

- 3 user_id Default Issue

**Problem:**
- Insert failed because user_id was not attached.

**Solution:**
- Explicitly passed:

- user_id: user.id

# during insert 400 Insert Error Debugging

**Problem:**
- Received 400 Bad Request during insert.

# Cause:

- RLS misconfiguration

- Missing user_id

- Invalid auth session

**Solution:**
- Verified session before insert and debugged Supabase logs to correct policies.

5 Realtime Publication Not Triggering

**Problem:**
- Changes were not syncing across tabs.

**Solution:**
- Enabled replication for bookmarks table and subscribed to:

supabase
  .channel("realtime-bookmarks")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "bookmarks" },
    fetchBookmarks
  )
  .subscribe();


- Now insert and delete sync instantly.

## 6️⃣ Dark & Light Mode Implementation

**Problem:**
- Theme needed to persist across refresh.

**Solution:**
- Configured tailwind.config.ts:

- darkMode: "class"

- Used document.documentElement.classList.toggle("dark") and stored preference in localStorage.

- Google OAuth Redirect Issue (Production)

**Problem:**
- After deployment, login redirected to:

- http://localhost:3000

# Resulting in:

- ERR_CONNECTION_REFUSED

# Cause:
- Supabase Site URL was still set to localhost.

**Solution:**
# Updated:

- Supabase → Authentication → URL Configuration

# Set:

- https://smart-bookmark-app-nu-blue.vercel.app

- Also updated authorized domains in Google Cloud Console.

## Run Locally
git clone https://github.com/Animesh42u2/smart-bookmark-app.git
cd smart-bookmark-app
npm install
npm run dev

# Open:

http://localhost:3000

##  Deployment

- Deployed on Vercel with production environment variables configured securely.

## Author

Animesh Mohapatra
