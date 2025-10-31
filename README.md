<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ssLIh-wJz3jHnCRY4l0OumaNnEa4Oaxo

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory with the following variables:
   ```env
   VITE_SUPABASE_URL=https://wgltfxvdbxvfypomirza.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbHRmeHZkYnh2Znlwb21pcnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTI3MDIsImV4cCI6MjA3Njk4ODcwMn0.2Qu86mDEJTYUzqTfF_xQL0GCMO0ZjLiQr9CA_9Krhrg
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Features

- 🔐 **Supabase Authentication** - Secure user authentication with email/password and Google OAuth
- 🎨 **Modern UI Design** - Beautiful glassmorphism interface with smooth animations
- 🚀 **Brand Kit Studio** - AI-powered brand identity generation
- 📱 **Product Mockup Generator** - Create photorealistic product mockups
- 🎬 **AI Poster Designer** - Design stunning posters for any event
- 📸 **Social Media Creator** - Generate content with images and captions
- 🎥 **AI Video Creator** - Produce professional videos with Veo

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **UI:** Tailwind CSS, Framer Motion, Lucide Icons
- **Backend:** Supabase (Auth & Database)
- **AI:** Google Gemini API
- **Deployment:** Vercel

## Deploy to Vercel

✅ **Deployed Successfully!**

**Production URL:** [https://agentforge-studio-8oqedlxht-mustafabutt1s-projects.vercel.app](https://agentforge-studio-8oqedlxht-mustafabutt1s-projects.vercel.app)

**Project Dashboard:** [https://vercel.com/mustafabutt1s-projects/agentforge-studio/settings](https://vercel.com/mustafabutt1s-projects/agentforge-studio/settings)

### ⚠️ Important: Set Environment Variables

Before using the app, add the following environment variables in the Vercel dashboard:

1. Go to: [Vercel Project Settings > Environment Variables](https://vercel.com/mustafabutt1s-projects/agentforge-studio/settings/environment-variables)
2. Add these variables for **Production, Preview, and Development**:
   - `VITE_SUPABASE_URL` = `https://wgltfxvdbxvfypomirza.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbHRmeHZkYnh2Znlwb21pcnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTI3MDIsImV4cCI6MjA3Njk4ODcwMn0.2Qu86mDEJTYUzqTfF_xQL0GCMO0ZjLiQr9CA_9Krhrg`
   - `GEMINI_API_KEY` = (Your Gemini API key)
3. After adding variables, **redeploy** the project from the dashboard

### Deploy Commands

**Redeploy to production:**
```bash
vercel --prod
```

**View deployment logs:**
```bash
vercel inspect --logs
```

## Database Schema

The app uses Supabase with the following tables:
- `profiles` - User profile information
- `brand_kits` - Saved brand identity kits
- `user_creations` - User-generated content (mockups, posters, social posts, videos)

All tables have Row Level Security (RLS) enabled for user data isolation.
