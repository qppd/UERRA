# OAuth Configuration Guide for UERRA

## Problem: Error 500 "unexpected_failure" on Google OAuth

This error typically occurs due to misconfigured redirect URLs between Google Cloud Console and Supabase.

## Required Configurations

### 1. Google Cloud Console Setup

**Navigate to**: [Google Cloud Console](https://console.cloud.google.com/)

1. **Go to**: APIs & Services → Credentials
2. **Find your OAuth 2.0 Client ID** (or create one if none exists)
3. **Configure Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:5174
   https://uerra.vercel.app
   https://YOUR_ACTUAL_VERCEL_URL.vercel.app
   ```

4. **Configure Authorized redirect URIs**:
   ```
   http://localhost:5173/auth/callback
   http://localhost:5174/auth/callback
   https://uerra.vercel.app/auth/callback
   https://YOUR_ACTUAL_VERCEL_URL.vercel.app/auth/callback
   https://bieexexscxkrshdvyuhj.supabase.co/auth/v1/callback
   ```

### 2. Supabase Dashboard Setup

**Navigate to**: [Supabase Dashboard](https://supabase.com/dashboard)

1. **Go to**: Authentication → Providers → Google
2. **Enable the provider**: Toggle ON
3. **Set Client ID**: Copy from Google Cloud Console
4. **Set Client Secret**: Copy from Google Cloud Console
5. **Configure Site URL**:
   ```
   https://uerra.vercel.app
   ```
6. **Configure Redirect URLs** (comma-separated):
   ```
   http://localhost:5173/**,http://localhost:5174/**,https://uerra.vercel.app/**,https://YOUR_ACTUAL_VERCEL_URL.vercel.app/**
   ```

### 3. Vercel Environment Variables

**In your Vercel Dashboard**:

1. **Go to**: Your Project → Settings → Environment Variables
2. **Add these variables**:
   ```
   VITE_SUPABASE_URL=https://bieexexscxkrshdvyuhj.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

## Common Issues and Solutions

### Issue 1: "unexpected_failure" Error 500
**Cause**: Redirect URL mismatch
**Solution**: Ensure all URLs in Google Console match exactly with Supabase configuration

### Issue 2: OAuth works locally but fails on Vercel
**Cause**: Missing Vercel URL in Google Console or incorrect Site URL in Supabase
**Solution**: Add your exact Vercel deployment URL to both configurations

### Issue 3: "redirect_uri_mismatch" error
**Cause**: The redirect URI in the request doesn't match any registered URIs
**Solution**: Check that the Supabase callback URL is registered in Google Console

## Testing Steps

1. **Test locally**: Use `http://localhost:5174/?debug=oauth`
2. **Check console logs**: Look for detailed error information
3. **Test production**: Deploy to Vercel and test there
4. **Verify URLs**: Ensure all URLs are exactly correct (no trailing slashes, correct protocols)

## Debug Information to Collect

When the error occurs, collect:
1. Browser console logs
2. Network tab showing the OAuth request
3. The exact URL where the error happens
4. The redirect URL being used

## Quick Fix Checklist

- [ ] Google OAuth Client ID and Secret are correct in Supabase
- [ ] All development and production URLs are in Google Console
- [ ] Supabase Site URL matches your production domain
- [ ] Supabase redirect URLs include wildcards (**)
- [ ] Environment variables are set correctly in Vercel
- [ ] No trailing slashes in configured URLs
- [ ] HTTPS is used for production URLs

## Still Having Issues?

1. Check Supabase logs in Dashboard → Logs
2. Verify your Vercel deployment URL exactly matches configuration
3. Try creating a new OAuth client in Google Console
4. Contact support with the specific error details and configuration screenshots
