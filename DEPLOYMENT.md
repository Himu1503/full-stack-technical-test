# Vercel Deployment Guide

This guide will help you deploy PulseEvents to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com) if needed)
2. Your GitHub repository connected to Vercel (or you can deploy via CLI)

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click "Add New Project"
   - Select your GitHub repository (`full-stack-technical-test`)
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `.` (root)
   - **Build Command:** `npm run build` (should auto-detect)
   - **Output Directory:** `dist` (should auto-detect)
   - **Install Command:** `npm install` (should auto-detect)

4. **Add Environment Variables**
   - Click "Environment Variables" section
   - Add the following variables:
     ```
     VITE_API_BASE_URL=https://x15zoj9on9.execute-api.us-east-1.amazonaws.com/prod
     VITE_API_KEY=Qqv2A0oZvd9fNkPb9Mcad4CUiIX5UvzP7PLr3IPM
     VITE_EMAILJS_SERVICE_ID=service_sc3ic4k
     VITE_EMAILJS_TEMPLATE_ID=template_le3xd6i
     VITE_EMAILJS_PUBLIC_KEY=RB5Yit_MaD6sCCDOf
     ```
   - Make sure to add them for all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project-name.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - First deployment: Select "Set up and deploy"
   - Select your project settings
   - Add environment variables when prompted

4. **For Production Deployment**
   ```bash
   vercel --prod
   ```

## Environment Variables Setup in Vercel

After deployment, you can add/update environment variables:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `VITE_API_BASE_URL`
   - `VITE_API_KEY`
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`

**Important:** After adding environment variables, you need to redeploy:
- Go to **Deployments** tab
- Click the three dots (⋮) on the latest deployment
- Select **Redeploy**

## Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test event listing page
- [ ] Test event detail page
- [ ] Test event registration
- [ ] Verify email confirmation works
- [ ] Test on mobile device
- [ ] Check that all environment variables are set correctly

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)
- Check build logs in Vercel dashboard

### API Calls Fail After Deployment
- Verify `VITE_API_BASE_URL` is set correctly
- Check that `VITE_API_KEY` is included
- Ensure environment variables are set for the correct environment (Production/Preview)

### Email Not Working
- Verify all EmailJS environment variables are set
- Check EmailJS template uses correct variable names (`{{total_price}}`, etc.)
- Check browser console for errors

## Build Configuration

The project uses the following Vercel configuration (stored in `vercel.json`):

- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **SPA Routing:** All routes redirect to `index.html` for client-side routing

## Continuous Deployment

Once connected to GitHub, Vercel will automatically deploy:
- Every push to `main` branch → Production deployment
- Pull requests → Preview deployments
- Other branches → Preview deployments

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Review the build logs in Vercel dashboard

