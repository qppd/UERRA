# Email Verification Fix Guide

## ✅ Code Fix Applied

Updated `src/Register.jsx` to include `emailRedirectTo` option in the `signUp` call.

```jsx
const { data, error: supaError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: redirectTo, // This was missing!
  }
});
```

## 🔧 Supabase Dashboard Configuration Required

### 1. Enable Email Confirmations

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Settings**
4. Under **User Management**:
   - ✅ **Enable email confirmations** should be **ON**
   - ✅ **Enable email change confirmations** should be **ON**

### 2. Configure Site URL

1. In the same **Authentication** → **Settings** page
2. Under **Site URL**:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`

### 3. Configure Redirect URLs

1. Under **Redirect URLs**, add:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)

### 4. Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize the **Confirm signup** template:
   - Subject: "Welcome to UERRA - Confirm your email"
   - Body: Customize with your branding

## 🧪 Testing Email Verification

### Test Steps:
1. Register with a real email address
2. Check your email inbox (and spam folder)
3. Click the verification link
4. Should redirect back to your app

### Common Issues:

**No email received:**
- Check Supabase Auth settings are enabled
- Verify Site URL is correct
- Check email spam folder
- Try with a different email provider

**Email link doesn't work:**
- Verify Redirect URLs are configured
- Check that your app is running on the configured URL
- Ensure the Site URL matches your development/production URL

**Email link redirects to wrong URL:**
- Double-check the Site URL in Supabase dashboard
- Verify the `emailRedirectTo` parameter in your code

## 🔍 Debug Console

Add this to test email verification status:

```jsx
// In your useAuthSession.js or wherever you handle auth
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session);
    if (event === 'SIGNED_UP') {
      console.log('User signed up but needs email confirmation');
    }
    if (event === 'SIGNED_IN') {
      console.log('User signed in and email confirmed');
    }
  });
  
  return () => subscription.unsubscribe();
}, []);
```

## ⚡ Quick Fix Checklist

- [x] Updated Register.jsx with `emailRedirectTo`
- [ ] Enable email confirmations in Supabase Dashboard
- [ ] Set correct Site URL in Supabase Dashboard  
- [ ] Add Redirect URLs in Supabase Dashboard
- [ ] Test with real email address
- [ ] Check email inbox and spam folder

After completing these steps, email verification should work properly!