---
description: How to deploy the ISKCON Kirtan app to Vercel
---

# Deploying to Vercel Guide

Follow these steps to host your application on Vercel.

## 1. Prepare your Code
Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).
- If you haven't yet, initialize git and push:
```powershell
git init
git add .
git commit -m "Initial commit"
# Create a repo on GitHub and follow their "push an existing repository" instructions
```

## 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in (GitHub login is recommended).
2. Click **"Add New..."** -> **"Project"**.
3. Find your repository and click **"Import"**.

## 3. Configure Build Settings
Vercel usually detects Vite automatically, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 4. Environment Variables (CRITICAL) 🔑
Your app won't work without connecting to Supabase. You must add these under the "Environment Variables" section in Vercel:

1. **VITE_SUPABASE_URL**: Copy the value from your local `.env` file.
2. **VITE_SUPABASE_ANON_KEY**: Copy the value from your local `.env` file.

## 5. Deploy
- Click **"Deploy"**.
- Once finished, Vercel will provide you with a production URL (e.g., `iskcon-kirtan-app.vercel.app`).

## 6. Update Supabase URL (Optional but Recommended)
In your Supabase Dashboard, go to **Authentication -> URL Configuration** and add your new Vercel URL to the "Site URL" or "Redirect URLs" if you plan to use authentication features in the future.

---
**Troubleshooting**:
- If the build fails, check that `npm run build` works locally on your machine first.
- If you see a blank screen on the deployed site, check the browser console (F12) to ensure the Supabase keys are correctly loaded.
