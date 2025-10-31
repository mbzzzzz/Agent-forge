# Supabase Authentication Setup Guide

## ⚠️ Required Configuration Steps

To fix authentication issues, you need to configure Supabase properly:

### 1. Enable Google OAuth Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/wgltfxvdbxvfypomirza/auth/providers)
2. Navigate to: **Authentication > Providers**
3. Find **Google** and click to configure
4. Enable the Google provider
5. Add your **Google Client ID** and **Google Client Secret**:
   - Get these from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 credentials if you don't have them

### 2. Configure Redirect URLs

1. Go to [Supabase Dashboard - URL Configuration](https://supabase.com/dashboard/project/wgltfxvdbxvfypomirza/auth/url-configuration)
2. Add these **Redirect URLs**:
   ```
   https://agentforge-studio.vercel.app/auth/callback
   https://agentforge-studio-*.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

### 3. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add these **Authorized JavaScript origins**:
   ```
   https://agentforge-studio.vercel.app
   https://wgltfxvdbxvfypomirza.supabase.co
   ```
4. Add these **Authorized redirect URIs**:
   ```
   https://wgltfxvdbxvfypomirza.supabase.co/auth/v1/callback
   ```

### 4. Email Confirmation Settings

If signup requires email confirmation:
1. Go to [Supabase Dashboard - Auth Settings](https://supabase.com/dashboard/project/wgltfxvdbxvfypomirza/auth/settings)
2. Under **Email Auth**, you can:
   - **Disable email confirmation** for testing (not recommended for production)
   - Or keep it enabled and ensure emails are being sent

### 5. Verify Environment Variables

Make sure these are set in Vercel:
- ✅ `VITE_SUPABASE_URL` = `https://wgltfxvdbxvfypomirza.supabase.co`
- ✅ `VITE_SUPABASE_ANON_KEY` = (your anon key)

## Testing Authentication

1. **Email/Password Auth:**
   - Should work immediately after environment variables are set
   - If email confirmation is required, check your email

2. **Google OAuth:**
   - Requires Google provider to be enabled in Supabase
   - Requires redirect URLs to be configured
   - Will redirect to Google, then back to your app

## Troubleshooting

- **"Invalid redirect URL"**: Add your Vercel URL to Supabase redirect URLs
- **"Provider not enabled"**: Enable Google in Supabase Auth > Providers
- **Email not sending**: Check Supabase email settings and spam folder
- **OAuth not working**: Verify Google Client ID/Secret in Supabase dashboard

