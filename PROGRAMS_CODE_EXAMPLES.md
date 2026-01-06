# Programs Table - Code Examples & Usage

## Quick Reference: Using the Programs System

### For Component Developers

#### Display Programs on Any Page
```typescript
import { ProgramsTable } from '@/components/programs-table';
import { useAuth } from '@/hooks/use-auth';

export default function MyPage() {
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'admin';

  return (
    <div>
      <h1>Our Programs</h1>
      <ProgramsTable isAdmin={isAdmin} />
    </div>
  );
}
```

#### Get Programs List
```typescript
import { getPrograms } from '@/app/admin/programs-actions';

async function showAllPrograms() {
  const result = await getPrograms();
  
  if (result.success) {
    console.log(result.data); // Array of programs with course_count
    result.data.forEach(program => {
      console.log(`${program.name}: ${program.course_count} courses`);
    });
  } else {
    console.error(result.error);
  }
}
```

#### Create a New Program
```typescript
import { createProgram } from '@/app/admin/programs-actions';

async function addNewProgram() {
  const result = await createProgram({
    name: 'Advanced GMAT Preparation',
    description: 'Comprehensive GMAT course with 40+ lessons',
    start_date: '2026-03-01',
    last_enrollment_date: '2026-04-30'
  });

  if (result.success) {
    console.log('Program created:', result.data);
    // result.data contains the new program object
  } else {
    console.error('Error:', result.error);
  }
}
```

#### Update a Program
```typescript
import { updateProgram } from '@/app/admin/programs-actions';

async function updateExistingProgram(programId: string) {
  const result = await updateProgram(programId, {
    name: 'Updated Program Name',
    start_date: '2026-04-15',
    last_enrollment_date: '2026-05-31'
  });

  if (result.success) {
    console.log('Updated:', result.data);
  }
}
```

#### Delete a Program
```typescript
import { deleteProgram } from '@/app/admin/programs-actions';

async function removeProgram(programId: string) {
  if (window.confirm('Delete this program?')) {
    const result = await deleteProgram(programId);
    
    if (result.success) {
      console.log('Program deleted');
    }
  }
}
```

#### Get Courses in a Program
```typescript
import { getCoursesByProgram } from '@/app/admin/programs-actions';

async function viewProgramCourses(programId: string) {
  const result = await getCoursesByProgram(programId);
  
  if (result.success) {
    console.log(`Courses: ${result.data.length}`);
    result.data.forEach(course => {
      console.log(`- ${course.title}`);
    });
  }
}
```

#### Link Course to Program
```typescript
import { linkCourseToProgram } from '@/app/admin/programs-actions';

async function assignCourseToProgram(courseId: string, programId: string) {
  const result = await linkCourseToProgram(courseId, programId);
  
  if (result.success) {
    console.log('Course linked to program');
  }
}
```

#### Unlink Course from Program
```typescript
import { unlinkCourseFromProgram } from '@/app/admin/programs-actions';

async function removeCourseFromProgram(courseId: string) {
  const result = await unlinkCourseFromProgram(courseId);
  
  if (result.success) {
    console.log('Course removed from program');
  }
}
```

---

### For SQL Users

#### View All Programs with Course Counts
```sql
SELECT * FROM programs_with_courses
ORDER BY created_at DESC;
```

#### Get Courses in a Specific Program
```sql
SELECT c.*
FROM courses c
WHERE c.program_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY c.created_at DESC;
```

#### Find Programs with Most Courses
```sql
SELECT 
  name,
  course_count,
  start_date,
  last_enrollment_date
FROM programs_with_courses
ORDER BY course_count DESC
LIMIT 10;
```

#### Courses Not Assigned to Any Program
```sql
SELECT * FROM courses WHERE program_id IS NULL;
```

#### Update Program Dates
```sql
UPDATE programs
SET 
  start_date = '2026-06-01',
  last_enrollment_date = '2026-07-31',
  updated_at = NOW()
WHERE name = 'IELTS Preparation';
```

#### Count Programs Created This Month
```sql
SELECT COUNT(*) as programs_this_month
FROM programs
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW());
```

---

### Component Usage in React

#### Full Example: Programs Dashboard
```typescript
'use client';

import { useEffect, useState } from 'react';
import { getPrograms, createProgram, deleteProgram } from '@/app/admin/programs-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Program } from '@/app/admin/programs-actions';

export default function ProgramsDashboard() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  // Fetch programs on mount
  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    const result = await getPrograms();
    if (result.success) {
      setPrograms(result.data);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;

    const result = await createProgram({
      name: newName,
      description: 'New program'
    });

    if (result.success) {
      toast({ title: 'Success', description: 'Program created' });
      setNewName('');
      await loadPrograms();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteProgram(id);
    if (result.success) {
      await loadPrograms();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Programs</h1>

      <div className="flex gap-2">
        <Input
          placeholder="New program name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button onClick={handleCreate}>Create</Button>
      </div>

      <div className="space-y-2">
        {programs.map((program) => (
          <div
            key={program.id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{program.name}</h3>
              <p className="text-sm text-gray-600">
                {program.course_count} courses • {program.start_date}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(program.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Error Handling Pattern

```typescript
async function safeOperation() {
  try {
    const result = await updateProgram(programId, data);

    if (!result.success) {
      // Handle operation failure
      console.error('Operation failed:', result.error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Unknown error occurred'
      });
      return;
    }

    // Handle success
    console.log('Operation successful:', result.data);
    toast({
      title: 'Success',
      description: 'Program updated successfully'
    });

    // Refresh data
    await refreshPrograms();

  } catch (error) {
    // Handle unexpected errors
    console.error('Exception:', error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'An unexpected error occurred'
    });
  }
}
```

---

### API Response Types

```typescript
// Success responses
interface SuccessResponse<T> {
  success: true;
  data: T;
  error: null;
  message?: string;
}

// Error responses
interface ErrorResponse {
  success: false;
  error: string;
  data?: null;
}

// Program type
interface Program {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  last_enrollment_date?: string;
  created_at: string;
  updated_at: string;
  course_count?: number;
}

// Example usage
async function getProgram() {
  const result = await getPrograms();
  
  if (result.success) {
    // result.data is Program[]
    const programs: Program[] = result.data;
  } else {
    // result.error is string
    const errorMessage: string = result.error;
  }
}
```

---

### Form Validation Example

```typescript
function validateProgram(data: Partial<Program>): string | null {
  if (!data.name?.trim()) {
    return 'Program name is required';
  }

  if (data.name.length < 3) {
    return 'Program name must be at least 3 characters';
  }

  if (data.start_date && data.last_enrollment_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.last_enrollment_date);

    if (start > end) {
      return 'Start date must be before last enrollment date';
    }
  }

  return null; // Valid
}

// Usage
const error = validateProgram({
  name: 'IELTS',
  start_date: '2026-01-01',
  last_enrollment_date: '2026-02-01'
});

if (error) {
  toast({ variant: 'destructive', description: error });
} else {
  // Create program
}
```

---

### Real-world Integration: Enrollment Page

```typescript
// src/app/(main)/student/enroll/page.tsx
import { getPrograms, getCoursesByProgram } from '@/app/admin/programs-actions';

export default async function EnrollmentPage() {
  const programsResult = await getPrograms();
  const programs = programsResult.success ? programsResult.data : [];

  return (
    <div>
      <h1>Select Your Program</h1>

      <div className="grid grid-cols-3 gap-4">
        {programs.map((program) => (
          <div
            key={program.id}
            className="p-4 border rounded cursor-pointer hover:bg-gray-100"
            onClick={() => showProgramDetails(program.id)}
          >
            <h3 className="font-bold">{program.name}</h3>
            <p className="text-sm">
              {program.course_count} courses
            </p>
            <p className="text-xs text-gray-600">
              Enrolls until: {program.last_enrollment_date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

async function showProgramDetails(programId: string) {
  const coursesResult = await getCoursesByProgram(programId);
  if (coursesResult.success) {
    // Display courses in modal/dialog
  }
}
```

---

### Advanced: Batch Operations

```typescript
// Update multiple programs
async function updateMultiplePrograms(
  programIds: string[],
  updates: Partial<Program>
) {
  const results = await Promise.all(
    programIds.map(id => updateProgram(id, updates))
  );

  const successes = results.filter(r => r.success).length;
  const failures = results.filter(r => !r.success).length;

  return { successes, failures, results };
}

// Usage
const { successes, failures } = await updateMultiplePrograms(
  ['id1', 'id2', 'id3'],
  { last_enrollment_date: '2026-12-31' }
);

console.log(`Updated ${successes}, failed ${failures}`);
```

---

### TypeScript Type Safety

```typescript
import type { Program } from '@/app/admin/programs-actions';

// Type-safe function
function displayProgram(program: Program): JSX.Element {
  return (
    <div>
      <h3>{program.name}</h3>
      <p>{program.description}</p>
      <p>Starts: {program.start_date}</p>
      <p>Enrolls until: {program.last_enrollment_date}</p>
      <p>Contains {program.course_count} courses</p>
    </div>
  );
}

// All properties are type-checked
const program: Program = {
  id: 'uuid',
  name: 'IELTS',
  // TypeScript requires: created_at, updated_at
  // Optional: description, start_date, last_enrollment_date
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
};
```

---

## Testing Checklist

```typescript
// Unit test example with Jest
describe('Programs', () => {
  test('creates a program', async () => {
    const result = await createProgram({
      name: 'Test Program',
      start_date: '2026-01-01'
    });
    
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Test Program');
  });

  test('validates required fields', async () => {
    const result = await createProgram({
      name: ''
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  test('updates program', async () => {
    const updateResult = await updateProgram('test-id', {
      name: 'Updated Name'
    });
    
    expect(updateResult.success).toBe(true);
  });

  test('deletes program', async () => {
    const result = await deleteProgram('test-id');
    
    expect(result.success).toBe(true);
  });

  test('links course to program', async () => {
    const result = await linkCourseToProgram('course-id', 'program-id');
    
    expect(result.success).toBe(true);
  });
});
```

---

This guide covers everything you need to use the Programs system in your application!
