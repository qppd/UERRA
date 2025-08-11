# URGENT FIX: OAuth 500 Error Solution

## Problem Identified
Your OAuth callback is working, but Supabase is returning a 500 Internal Server Error because the JWT state token contains multiple URLs in a single field, causing parsing errors.

## Root Cause
The Supabase configuration has multiple URLs in the Site URL field instead of using comma-separated values in the Redirect URLs field.

## IMMEDIATE FIX STEPS

### 1. Fix Supabase Configuration

**Go to**: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Authentication → Providers → Google

**Current WRONG Configuration** (causing the error):
```
Site URL: https://uerra.vercel.app https://uerra.vercel.app/ http://localhost:5173 http://localhost:5173/
```

**CORRECT Configuration**:
```
Site URL: https://uerra.vercel.app

Redirect URLs: https://uerra.vercel.app/**,http://localhost:5173/**,http://localhost:5174/**
```

### 2. Exact Steps in Supabase Dashboard

1. **Site URL field**: 
   - Clear everything
   - Enter ONLY: `https://uerra.vercel.app`
   - No trailing slash, no additional URLs

2. **Redirect URLs field**:
   - Enter: `https://uerra.vercel.app/**,http://localhost:5173/**,http://localhost:5174/**`
   - Use commas to separate URLs, no spaces
   - Include the `/**` wildcard for each domain

3. **Save** the configuration

### 3. Verify Google Cloud Console

**Go to**: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials

**Authorized JavaScript origins** (add each separately):
```
https://uerra.vercel.app
http://localhost:5173
http://localhost:5174
```

**Authorized redirect URIs**:
```
https://bieexexscxkrshdvyuhj.supabase.co/auth/v1/callback
```

### 4. Test the Fix

After making these changes:

1. **Clear your browser cache** or use incognito mode
2. **Test on production**: Try Google sign-in on your Vercel deployment
3. **Test locally**: Try Google sign-in on `http://localhost:5174`

## Why This Fixes the Error

The error occurred because:
1. Multiple URLs were in the `site_url` field
2. This created a malformed JWT state token
3. When Google redirected back to Supabase, the token couldn't be parsed
4. Result: 500 Internal Server Error

The fix ensures:
1. Single, clean Site URL
2. Properly formatted redirect URLs
3. Valid JWT state tokens
4. Successful OAuth flow

## Expected Result

After the fix, the OAuth flow should work:
1. Click "Sign in with Google"
2. Redirect to Google sign-in
3. Successful authentication
4. Redirect back to your app
5. User logged in successfully

## If Still Having Issues

1. Wait 5-10 minutes for Supabase configuration to propagate
2. Try in incognito/private browsing mode
3. Check browser console for any remaining errors
4. Verify your Google OAuth credentials are still valid

This should resolve the 500 error immediately once the Supabase configuration is corrected.
