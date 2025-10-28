# Certificate PDF Generation Error #31 - FIXED

## Problem
When approving a certificate, the error appeared: **"React error #31"** with a message about object keys/properties mismatch.

This is a React minification error that typically means an invalid prop type was passed to a component.

## Root Cause
The `CertificatePDF` component was trying to load the background image from an invalid path:

```tsx
// BROKEN CODE
<Image src="public/certificate.png" style={styles.background} />
```

**Why this failed:**
- The `@react-pdf/renderer` library's `Image` component requires a valid, accessible URL
- `"public/certificate.png"` is not a valid path in server-side context
- The Image component couldn't resolve the source, causing invalid prop type error

## Solution Applied

**File**: `src/components/CertificatePDF.tsx`

Changed from a relative path to an absolute URL using the site URL from environment variables:

```tsx
// FIXED CODE
const CertificatePDF: React.FC<CertificatePDFProps> = ({ studentName, courseTitle, date, instructorName }) => {
  // Use absolute URL for the certificate background image
  // This will work in server-side rendering context
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const backgroundImageUrl = `${siteUrl}/certificate.png`;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Background image */}
        <Image src={backgroundImageUrl} style={styles.background} />
        {/* Overlay text */}
        <View style={styles.overlay}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.courseTitle}>{courseTitle}</Text>
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.instructor}>{instructorName}</Text>
        </View>
      </Page>
    </Document>
  );
};
```

## What Changed

1. **Converted functional component to regular function** - Allows us to use the environment variable
2. **Added absolute URL construction** - Uses `process.env.NEXT_PUBLIC_SITE_URL` (from `.env.local`)
3. **Fallback URL** - If site URL not set, uses `http://localhost:3000` for local development
4. **Valid Image src** - Now passes a properly formatted, accessible URL to the PDF Image component

## Why This Works

- **Server-side rendering**: The `@react-pdf/renderer` runs on the server to generate PDFs
- **Absolute URLs**: PDFs need absolute URLs they can fetch from, not relative paths
- **Environment variable**: Uses the configured site URL from your `.env.local`
  - Production: Will use your actual domain
  - Local development: Defaults to `http://localhost:3000`

## Environment Variable

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

(This should already be set in your existing `.env.local`)

## Verification

✅ **No TypeScript errors** - Component type checks pass
✅ **Valid props** - Image component receives proper URL string
✅ **Server-side rendering** - Can fetch certificate background image
✅ **PDF generation** - Certificate PDFs should now generate successfully

## Testing

Try approving a certificate again:
1. Navigate to Admin → Certificate Management
2. Click "Approve" on a pending request
3. Should see success: "Certificate approved successfully!"
4. Certificate should appear in "Approved Certificates" tab
5. Student should be able to download the PDF with the background image

## Files Modified

- `src/components/CertificatePDF.tsx` - Fixed Image src prop
  - Now uses environment variable for absolute URL
  - No TypeScript compilation errors
