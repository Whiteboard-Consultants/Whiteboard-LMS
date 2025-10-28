import { format } from "date-fns";

/**
 * Converts various date formats to a JavaScript Date object
 * Supports: Date objects, ISO strings, timestamp objects
 * Returns null for invalid dates
 */
export function convertToDate(dateValue: any): Date | null {
  // Handle null/undefined
  if (!dateValue) return null;
  
  // Already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // Handle ISO string format (Supabase default)
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Handle timestamp objects with seconds property
  if (typeof dateValue === 'object' && dateValue !== null && 'seconds' in dateValue) {
    const milliseconds = dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000;
    const date = new Date(milliseconds);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Last resort: try direct conversion
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Safely formats a date value with fallback for invalid dates
 */
export function safeFormatDate(dateValue: any, formatStr: string): string {
  if (!dateValue) return '';
  
  try {
    const date = convertToDate(dateValue);
    if (!date) return 'Invalid Date';
    return format(date, formatStr);
  } catch {
    return 'Invalid Date';
  }
}

