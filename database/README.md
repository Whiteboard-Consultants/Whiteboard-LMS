# Database Setup Instructions

## Setting up the Supabase Database Schema

The application requires specific database tables to function properly. Follow these steps to set up your Supabase database:

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** in the left sidebar
3. Create a new query

### 2. Run the Setup Script

1. Copy the contents of `setup.sql` in this directory
2. Paste it into the SQL Editor
3. Click "Run" to execute the script

This will create all necessary tables:
- `courses` - Course information and metadata
- `enrollments` - Student enrollment records
- `lessons` - Course content and lessons
- `tests` - Assessments and quizzes
- `questions` - Test questions
- `announcements` - System announcements

### 3. Verify Setup

After running the script, you should see the following tables in your Supabase database:
- ✅ `users` (should already exist from auth)
- ✅ `courses`
- ✅ `enrollments` 
- ✅ `lessons`
- ✅ `tests`
- ✅ `questions`
- ✅ `announcements`

### 4. Row Level Security (RLS)

The script automatically enables Row Level Security and creates appropriate policies for:
- Data access control based on user roles
- Proper isolation between instructors and students
- Admin access to all data

### 5. Test the Setup

Once the tables are created, try logging in as an instructor. The dashboard should now load without the "table not found" errors.

## Troubleshooting

If you encounter issues:

1. **Permission Errors**: Make sure you're running the SQL as a database admin
2. **UUID Extension**: The script enables the `uuid-ossp` extension - this should work on all Supabase projects
3. **Policy Conflicts**: If policies already exist, you may need to drop them first

## Next Steps

After the database is set up:
1. Create some test instructor and student accounts
2. Test course creation functionality
3. Verify enrollment and lesson access

## Database Schema Notes

- Uses UUIDs for all primary keys
- Supports both JSON and normalized instructor references
- Includes proper indexes for performance
- Flexible course structure with nested lessons
- Comprehensive enrollment tracking