# PostGIS Location Fix for Map Pins

## Issue
The map pins were not showing because the location data in the database is stored in PostGIS binary format (WKB - Well-Known Binary) which looks like:
`0101000020E6100000C70A2362EF6A5E400FC4680C29F52B40`

## Solution
I've implemented a two-tier solution:

### 1. PostgreSQL Function (Recommended)
Run the SQL in `get-reports-function.sql` in your Supabase SQL Editor. This creates a function that:
- Converts PostGIS geometry to readable longitude/latitude coordinates
- Joins with categories table to get category names and colors
- Returns clean data ready for the map

### 2. Fallback JavaScript Decoder
If the PostgreSQL function fails, the code falls back to a JavaScript decoder that:
- Parses the PostGIS binary format directly in the browser
- Extracts longitude and latitude from the WKB hex string

## Files Modified
- `MapWidget.jsx` - Updated to use RPC function with fallback
- `get-reports-function.sql` - New PostgreSQL function

## Setup Steps

1. **Run the SQL function** (in Supabase SQL Editor):
   ```sql
   -- Copy and paste the contents of get-reports-function.sql
   ```

2. **Test the map**:
   - Start the dev server: `npm run dev`
   - Navigate to a page with the map
   - Check browser console for any errors
   - Look for reports pins on the map

## Debugging

If pins still don't show:

1. **Check console logs**:
   - Look for "RPC function returned:" or "Using fallback query"
   - Check if coordinates are being decoded properly

2. **Verify database**:
   ```sql
   -- Check if reports have location data
   SELECT id, description, location FROM reports WHERE location IS NOT NULL LIMIT 5;
   
   -- Test the function
   SELECT * FROM get_reports_with_coordinates() LIMIT 5;
   ```

3. **Check coordinate validity**:
   - Longitude should be around 121.99 for Unisan
   - Latitude should be around 13.86 for Unisan

## Expected Result
After running the SQL function, the map should display:
- Red pins for pending reports
- Orange pins for acknowledged reports  
- Yellow pins for in_progress reports
- Green pins for resolved reports
- Gray pins for cancelled reports

Clicking on any pin shows a popup with report details.