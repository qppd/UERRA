# Citizen-Only Report Submission System
## UERRA (Unisan Emergency Reporting and Response App)

This document outlines the enhanced citizen-only report submission system with proper security measures and database schema.

## 🔐 Security Overview

### Role-Based Access Control
- **ONLY CITIZENS** can submit emergency reports
- Database-level constraints enforce citizen-only submission
- Frontend validation prevents non-citizens from accessing report forms
- Row-Level Security (RLS) policies ensure data protection

### User Roles in the System
```
┌─────────────────┬─────────────────┬──────────────────┬─────────────────┐
│ Role            │ Submit Reports  │ View Reports     │ Manage Reports  │
├─────────────────┼─────────────────┼──────────────────┼─────────────────┤
│ citizen         │ ✅ YES          │ Own reports only │ Own pending     │
│ admin           │ ❌ NO           │ All reports      │ All reports     │
│ agency          │ ❌ NO           │ Assigned reports │ Assigned reports│
│ superadmin      │ ❌ NO           │ All reports      │ All reports     │
└─────────────────┴─────────────────┴──────────────────┴─────────────────┘
```

## 📋 Database Schema Features

### Enhanced Reports Table
```sql
CREATE TABLE public.reports (
    -- Core fields
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    title TEXT,
    description TEXT NOT NULL,
    
    -- Location data (PostGIS)
    location POINT,
    address TEXT,
    
    -- Media attachments
    photo_url TEXT,
    video_url TEXT,
    
    -- Status and priority
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    emergency_level TEXT DEFAULT 'standard',
    
    -- Citizen-specific fields
    citizen_contact TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    
    -- Metadata for tracking
    submitted_via TEXT DEFAULT 'web',
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 🔒 CITIZEN-ONLY CONSTRAINT
    CONSTRAINT citizen_only_reports CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = user_id 
            AND users.role = 'citizen'
        )
    )
);
```

### Row-Level Security Policies

#### 1. Citizen Report Submission (INSERT)
```sql
CREATE POLICY "Only citizens can submit reports" ON public.reports
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'citizen'
        )
    );
```

#### 2. Citizen Report Viewing (SELECT)
```sql
CREATE POLICY "Citizens can view their own reports" ON public.reports
    FOR SELECT USING (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'citizen'
        )
    );
```

#### 3. Database-Level Validation Trigger
```sql
CREATE OR REPLACE FUNCTION validate_citizen_report()
RETURNS TRIGGER AS $$
BEGIN
    -- Enforce citizen-only submission at database level
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = NEW.user_id 
        AND users.role = 'citizen'
    ) THEN
        RAISE EXCEPTION 'Only citizens can submit emergency reports';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_citizen_only_reports
    BEFORE INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION validate_citizen_report();
```

## 🛡️ Frontend Security Implementation

### 1. CitizenReportService Class
```javascript
// Located: src/services/CitizenReportService.js
export class CitizenReportService {
  
  // Validates user role before submission
  static async validateCitizen(user) {
    if (userData.role !== 'citizen') {
      throw new Error('Only citizens are authorized to submit emergency reports');
    }
  }
  
  // Secure report submission with validation
  static async submitReport(reportData, user, photoFile) {
    // 1. Validate user is citizen
    await this.validateCitizen(user);
    
    // 2. Validate report data
    this.validateReportData(reportData);
    
    // 3. Upload photo with security checks
    // 4. Submit to database with RLS protection
    // 5. Create audit trail
  }
}
```

### 2. Enhanced ReportFormDialog Component
```javascript
// Located: src/components/ReportFormDialog.jsx

// Role verification on dialog open
const checkUserRole = async () => {
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (data.role !== 'citizen') {
    setError('Only citizens are authorized to submit emergency reports');
  }
};

// Disabled form for non-citizens
<Button
  disabled={userRole !== 'citizen'}
  onClick={handleSubmit}
>
  Submit Report
</Button>
```

## 🔄 Report Submission Flow

```
1. User opens report dialog
   ↓
2. System verifies user role = 'citizen'
   ↓
3. If not citizen → Show access denied message
   ↓
4. If citizen → Show report form
   ↓
5. User fills form and submits
   ↓
6. CitizenReportService.validateCitizen()
   ↓
7. Database trigger validates citizen role
   ↓
8. RLS policy enforces citizen-only INSERT
   ↓
9. Report created with audit trail
   ↓
10. Auto-assign to relevant agencies
```

## 📁 File Structure

```
uniapp/
├── citizen-report-schema.sql          # Enhanced database schema
├── src/
│   ├── services/
│   │   └── CitizenReportService.js    # Secure report submission service
│   └── components/
│       ├── ReportFormDialog.jsx       # Enhanced form with role checks
│       ├── CitizenDashboard.jsx       # Citizen-only dashboard
│       └── MyReports.jsx              # Citizen report management
```

## 🧪 Testing Citizen-Only Access

### Test Cases:

1. **Valid Citizen Submission**
   ```sql
   -- Should succeed
   INSERT INTO reports (user_id, category_id, description) 
   VALUES ('citizen-uuid', 'category-uuid', 'Emergency description');
   ```

2. **Invalid Admin Submission**
   ```sql
   -- Should fail with error
   INSERT INTO reports (user_id, category_id, description) 
   VALUES ('admin-uuid', 'category-uuid', 'Emergency description');
   -- Error: Only citizens can submit emergency reports
   ```

3. **Frontend Role Check**
   ```javascript
   // Should show access denied for non-citizens
   await CitizenReportService.submitReport(data, adminUser, photo);
   // Error: Only citizens are authorized to submit emergency reports
   ```

## 🚀 Setup Instructions

### 1. Run Database Schema
```bash
# In Supabase SQL Editor, execute:
psql -f citizen-report-schema.sql
```

### 2. Update Frontend
```bash
# The ReportFormDialog.jsx is already updated
# CitizenReportService.js is ready to use
npm run dev
```

### 3. Test the System
1. Login as a citizen → Should see "Report Emergency" button
2. Login as admin/agency → Should NOT see report submission options
3. Try to access report form as non-citizen → Should show access denied

## 🔧 Maintenance

### Adding New Citizen Features
- All new features should use `CitizenReportService` for validation
- Always check user role before allowing actions
- Use RLS policies for database-level security

### Monitoring
- Check `report_updates` table for audit trail
- Monitor failed submission attempts in logs
- Review RLS policy effectiveness regularly

---

**Security Note**: This system implements defense-in-depth with multiple layers of citizen-only validation:
1. Frontend role checks
2. Service layer validation  
3. Database constraints
4. RLS policies
5. Database triggers

This ensures that even if one layer fails, the system remains secure and only citizens can submit emergency reports.
