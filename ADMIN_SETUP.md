# Quick Admin User Setup Guide

## Step 1: Create Required Database Tables

First, you need to create the necessary tables in your Supabase database. Run these SQL scripts in your **Supabase SQL Editor**:

### 1. Create Users Table
```sql
-- Copy and run the entire content from: sql/create-users-table-simple.sql
-- This creates the basic users table with proper RLS policies
```

**Alternative**: If you encounter column name errors, try this basic version:
```sql
-- Basic users table creation
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'instructor', 'student')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
    "isProfileComplete" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can register themselves" ON users FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. Create Carts Table (Optional)
```sql
-- Copy and run the entire content from: sql/create-carts-table.sql
-- This enables cart functionality with database persistence
```

### 3. Create Announcements Table (Optional)
```sql
-- Copy and run the entire content from: sql/create-announcements-table.sql
-- This enables announcement banners on the admin dashboard
```

## Step 2: Create Admin User

### Option A: Supabase Dashboard (Recommended)

#### Create Auth User
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **WhitedgeLMS** project
3. Navigate to **Authentication** → **Users**
4. Click **"Add user"** button
5. Fill in:
   - **Email**: `admin@whitedgelms.com`
   - **Password**: `Admin@123456`
   - **Auto Confirm User**: ✅ **YES** (important!)
6. Click **"Create user"**
7. **Copy the User ID** from the newly created user

#### Create Database User Record
1. Navigate to **Database** → **Table Editor**
2. Select the **users** table
3. Click **"Insert"** → **"Insert row"**
4. Fill in these values:
   - **id**: [paste the User ID from above]
   - **name**: `Admin User`
   - **email**: `admin@whitedgelms.com`
   - **role**: `admin`
   - **status**: `approved`
   - **isProfileComplete**: `true`
   - **createdAt**: [leave empty - will auto-fill]
5. Click **"Save"**

### Option B: SQL Script (Alternative)

```sql
-- First, manually create the auth user in the Supabase Dashboard
-- Then replace 'YOUR_AUTH_USER_ID_HERE' with the actual User ID

INSERT INTO users (
  id, 
  name, 
  email, 
  role, 
  status, 
  "isProfileComplete", 
  "createdAt"
) VALUES (
  'YOUR_AUTH_USER_ID_HERE',  -- Replace with actual User ID from dashboard
  'Admin User',
  'admin@whitedgelms.com',
  'admin',
  'approved',
  true,
  NOW()
);
```

## Step 3: Test Login

- **URL**: http://localhost:3000/login
- **Email**: `admin@whitedgelms.com`
- **Password**: `Admin@123456`

After login, you should be redirected to the admin dashboard.

---

## Current System Status

### ✅ What's Working
- **Authentication system** (Supabase Auth)
- **User management** with role-based access
- **Cart system** (with graceful fallback if table missing)
- **Announcement banners** (with graceful fallback if table missing)
- **Application builds and runs** without Firebase errors
- **Real-time user data** updates via Supabase subscriptions

### ⚠️ What Needs Database Tables
- **Cart persistence** (works locally without table)
- **User profiles** (requires users table)
- **Announcement display** (works without table, just shows nothing)
- **Course data** (will need courses table next)

### 🔄 In Progress
- **Core data fetching functions** migration
- **Real-time subscriptions** for dashboards
- **Admin management actions**

---

## Troubleshooting

### Cart Warnings in Console
If you see cart-related warnings, it's normal - the cart works locally until you create the `carts` table.

### Login Issues
1. Ensure the `users` table exists
2. Verify the user record was created with `role: 'admin'`
3. Check that `status: 'approved'` and `isProfileComplete: true`

### Database Access Issues
1. Check RLS policies are enabled
2. Verify the user ID matches between auth.users and users tables
3. Ensure proper permissions are granted

---

## Next Steps After Login Works
1. **Test admin dashboard** access
2. **Create courses table** for course management
3. **Migrate remaining Firebase functions**
4. **Set up course content management**