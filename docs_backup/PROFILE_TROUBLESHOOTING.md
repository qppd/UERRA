# UERRA Profile Creation Troubleshooting Guide

## Current Status ✅

Based on your user data, you have 3 users in your system. The "Create Profile" issue should now be resolved with the following fixes:

### Applied Fixes:
1. **Enhanced error handling** with detailed console logging
2. **Loading state feedback** ("Creating Profile..." button text)
3. **Improved upsertUserProfile function** with better error handling
4. **Database column fixes** (phone, address, is_active columns)

## Testing Steps

### 1. For Existing Users
Since you already have users in the database, test with a superadmin account:

1. **Login as superadmin**: `sajedhm@gmail.com`
2. **Navigate to "Profile Test"** in the sidebar (new option for superadmin)
3. **Click "Check Current Profile"** - should show your existing profile
4. **Click "Test Profile Creation"** - should work without errors

### 2. For New Users (Create Profile Flow)
1. **Create a new account** with a different email
2. **After registration**, you should see the "Create Profile" screen
3. **Click "Create Profile"** - should show "Creating Profile..." then reload
4. **Should redirect to citizen dashboard**

### 3. Manual Database Check
Run this SQL in Supabase to verify your users table structure:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check your current users
SELECT id, email, name, role, agency_id, phone, address, is_active, created_at
FROM public.users
ORDER BY created_at;
```

## If Still Having Issues

### 1. Browser Console Errors
Open browser Developer Tools (F12) → Console tab and look for:
- Red error messages when clicking "Create Profile"
- Network tab for failed API requests
- Any authentication errors

### 2. Database Issues
Run the fix SQL files in this order:
```sql
-- 1. First run: fix-users-table.sql
-- 2. Then run: update-user-names.sql
-- 3. Finally verify with the check queries above
```

### 3. Clear Browser Data
- Clear browser cache and cookies
- Try in incognito/private mode
- Disable browser extensions

### 4. Environment Issues
Check your `.env` file has:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Expected Behavior

### ✅ Working State:
- New users see "Create Profile" button
- Button shows "Creating Profile..." when clicked
- Page reloads and shows citizen dashboard
- Existing users skip profile creation

### ❌ Problem Signs:
- Button does nothing when clicked
- Error messages in console
- Infinite loading states
- Database permission errors

## Quick Fix Commands

### Reset a User's Profile:
```sql
-- If you need to reset a user to test profile creation
DELETE FROM public.users WHERE email = 'test@example.com';
-- Then try logging in with that email again
```

### Force Create Profile:
```sql
-- Manually create a profile if needed
INSERT INTO public.users (id, email, name, role, is_active)
VALUES (
  'user-id-from-auth-users-table',
  'email@example.com',
  'User Name',
  'citizen',
  true
);
```

## Contact for Support

If none of these steps work:
1. Check the browser console for specific error messages
2. Share the exact error from the console
3. Verify your Supabase project is properly configured
4. Ensure RLS policies are set correctly

The latest code improvements include better error messages and debugging information to help identify exactly where the issue occurs.
