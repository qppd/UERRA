# Supabase Storage Setup for UERRA

## Overview
This guide explains how to set up Supabase Storage for handling photo uploads in emergency reports.

## 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"Create bucket"**
4. Configure the bucket:
   - **Name**: `photos`
   - **Public bucket**: ✅ Enable (so photos can be viewed)
   - **File size limit**: 5MB (recommended for emergency photos)
   - **Allowed MIME types**: `image/*` (images only)

## 2. Set Up Row Level Security (RLS)

Add these policies to your storage bucket:

### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Allow authenticated users to upload photos" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'photos');
```

### Policy 2: Allow public viewing of photos
```sql
CREATE POLICY "Allow public viewing of photos" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'photos');
```

### Policy 3: Allow users to update their own photos
```sql
CREATE POLICY "Users can update their own photos" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Policy 4: Allow users to delete their own photos
```sql
CREATE POLICY "Users can delete their own photos" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 3. Alternative: No RLS Setup (Simpler)

If you prefer a simpler setup during development:

1. Create the `photos` bucket as public
2. Disable RLS on the bucket temporarily
3. This allows any authenticated user to upload/view photos

⚠️ **Warning**: This is less secure and should only be used in development.

## 4. Test the Setup

1. Start your development server
2. Login as a citizen user
3. Try submitting a report with a photo
4. Check if the photo appears in the Supabase Storage dashboard

## 5. File Structure

Photos will be stored with this structure:
```
photos/
├── reports/
│   ├── [user_id]-[timestamp].jpg
│   ├── [user_id]-[timestamp].png
│   └── ...
```

## 6. Environment Variables

Make sure your `.env` file has the correct Supabase configuration:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Troubleshooting

### Photos not uploading?
1. Check browser console for errors
2. Verify RLS policies are correct
3. Ensure bucket exists and is public
4. Check file size limits (5MB max)

### Photos not displaying?
1. Verify bucket is public
2. Check the public URL format
3. Ensure RLS allows public viewing

### Access denied errors?
1. Check if user is authenticated
2. Verify RLS policies
3. Check bucket permissions

## Production Considerations

1. **File Size Limits**: Consider implementing client-side image compression
2. **Storage Costs**: Monitor storage usage and implement cleanup policies
3. **Security**: Review RLS policies for production use
4. **Backup**: Set up regular backups of uploaded photos
5. **CDN**: Consider using a CDN for faster photo loading

## Sample RLS Policy for Production

For production, you might want more restrictive policies:

```sql
-- Only allow photo uploads for reports
CREATE POLICY "Only allow photo uploads for valid reports" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.reports 
    WHERE user_id = auth.uid() 
    AND created_at > NOW() - INTERVAL '1 hour'
  )
);
```

This ensures users can only upload photos within 1 hour of creating a report.
