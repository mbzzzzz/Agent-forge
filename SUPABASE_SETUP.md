# Supabase Authentication Setup Guide

## ⚠️ Required Configuration Steps

To enable Google Sign-In, you need to configure both Supabase and Google Cloud Console. Follow these steps in order:

## Step 1: Create Google OAuth 2.0 Credentials

### 1.1 Create a Google Cloud Project (if you don't have one)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "AgentForge")
5. Click **"Create"**

### 1.2 Enable Google+ API

1. In Google Cloud Console, go to **"APIs & Services" > "Library"**
2. Search for **"Google+ API"** or **"People API"**
3. Click on it and click **"Enable"**

### 1.3 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - Choose **"External"** (unless you have a Google Workspace)
   - Fill in App name: **"AgentForge"**
   - User support email: (your email)
   - Developer contact: (your email)
   - Click **"Save and Continue"** through all steps
4. Back to creating credentials:
   - Application type: **"Web application"**
   - Name: **"AgentForge Web Client"**
   - **Authorized JavaScript origins**: (Add these - DO NOT skip this!)
     ```
     https://wgltfxvdbxvfypomirza.supabase.co
     http://localhost:5173
     https://agentforge-studio-8oqedlxht-mustafabutt1s-projects.vercel.app
     ```
   - **Authorized redirect URIs**: (Add this - REQUIRED!)
     ```
     https://wgltfxvdbxvfypomirza.supabase.co/auth/v1/callback
     ```
5. Click **"Create"**
6. **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these in Step 2!

## Step 2: Enable Google OAuth Provider in Supabase

1. Go to [Supabase Dashboard - Auth Providers](https://supabase.com/dashboard/project/wgltfxvdbxvfypomirza/auth/providers)
2. Find **"Google"** in the list of providers
3. Click on **"Google"** to expand it
4. Toggle **"Enable Google provider"** to **ON**
5. Paste your **Google Client ID** (from Step 1.3)
6. Paste your **Google Client Secret** (from Step 1.3)
7. Click **"Save"**

## Step 3: Configure Redirect URLs in Supabase

1. Go to [Supabase Dashboard - URL Configuration](https://supabase.com/dashboard/project/wgltfxvdbxvfypomirza/auth/url-configuration)
2. Under **"Redirect URLs"**, click **"Add URL"**
3. Add these URLs one by one:
   ```
   http://localhost:5173/auth/callback
   http://localhost:3000/auth/callback
   https://agentforge-studio-8oqedlxht-mustafabutt1s-projects.vercel.app/auth/callback
   ```
4. Click **"Save"** after adding each URL

## Step 4: Verify Configuration

### Check Supabase Settings:
- ✅ Google provider is **Enabled**
- ✅ Client ID and Secret are saved
- ✅ Redirect URLs are configured

### Check Google Cloud Console:
- ✅ OAuth 2.0 credentials created
- ✅ Authorized JavaScript origins include Supabase URL
- ✅ Authorized redirect URI includes: `https://wgltfxvdbxvfypomirza.supabase.co/auth/v1/callback`

### Verify Environment Variables

Make sure these are set in your `.env.local` file (for local development):
```env
VITE_SUPABASE_URL=https://wgltfxvdbxvfypomirza.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbHRmeHZkYnh2Znlwb21pcnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTI3MDIsImV4cCI6MjA3Njk4ODcwMn0.2Qu86mDEJTYUzqTfF_xQL0GCMO0ZjLiQr9CA_9Krhrg
```

And in Vercel (for production):
- `VITE_SUPABASE_URL` = `https://wgltfxvdbxvfypomirza.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (your anon key)

## Step 5: Test Google Sign-In

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open your app** (usually `http://localhost:5173`)

3. **Click "Continue with Google"** button

4. **Expected behavior:**
   - You should be redirected to Google's sign-in page
   - After signing in, you'll be redirected back to your app
   - You should be logged in successfully

### Testing Email/Password Auth:

1. **Email/Password Auth:**
   - Should work immediately after environment variables are set
   - If email confirmation is required, check your email inbox (and spam folder)

## Troubleshooting

### ❌ "Provider not enabled"
- **Solution**: Go to Supabase Dashboard > Authentication > Providers > Google, and enable it

### ❌ "Invalid redirect URL" or "redirect_uri_mismatch"
- **Solution**: 
  1. Check Google Cloud Console - make sure `https://wgltfxvdbxvfypomirza.supabase.co/auth/v1/callback` is in Authorized redirect URIs
  2. Check Supabase Dashboard - make sure your app URLs are in Redirect URLs list

### ❌ "Error 400: redirect_uri_mismatch"
- **Solution**: The redirect URI in Google Cloud Console must EXACTLY match: `https://wgltfxvdbxvfypomirza.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes or typos

### ❌ Google OAuth button doesn't redirect
- **Solution**: 
  1. Check browser console for errors
  2. Verify Google Client ID and Secret are correctly saved in Supabase
  3. Make sure the Google provider is enabled (toggle should be ON/green)

### ❌ Email confirmation not working
- **Solution**: Check Supabase email settings and spam folder. For testing, you can disable email confirmation in Supabase Dashboard > Authentication > Settings (not recommended for production)

### ✅ Quick Checklist:
- [ ] Google OAuth 2.0 credentials created in Google Cloud Console
- [ ] Authorized redirect URI set to: `https://wgltfxvdbxvfypomirza.supabase.co/auth/v1/callback`
- [ ] Google provider enabled in Supabase
- [ ] Google Client ID and Secret saved in Supabase
- [ ] Redirect URLs added in Supabase (including localhost for testing)
- [ ] Environment variables set correctly

