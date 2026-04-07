# Google Maps Address Autocomplete Integration Guide

## Overview
This guide walks you through integrating Google Maps Places API address autocomplete into your WhitedgeLMS application.

## Prerequisites
- Google Cloud Project with Places API enabled
- Google Maps API key with billing enabled
- React Hook Form (already in your project)
- Next.js 13+ (you have this)

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Places API
   - Maps JavaScript API
   - Address Validation API (optional)
4. Create an API key (Credentials > Create Credentials > API Key)
5. Restrict the key to your domains for security

## Step 2: Add Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

## Step 3: Install Google Maps Library

```bash
npm install @googlemaps/js-api-loader
```

## Step 4: Create Reusable Component

Create `src/components/form-fields/address-autocomplete-field.tsx` (see next section)

## Step 5: Update Your Forms

### In Profile Form:
```tsx
import { AddressAutocompleteField } from "@/components/form-fields/address-autocomplete-field";

// Add to schema
const formSchema = z.object({
  // ... existing fields
  address: z.string().min(5, { message: "Please enter a valid address." }).optional().or(z.literal('')),
  apartment: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
});

// In form fields
<FormField
  control={form.control}
  name="address"
  render={({ field }) => (
    <AddressAutocompleteField 
      field={field}
      onAddressSelected={(components) => {
        // Handle parsed address components
        form.setValue('city', components.city || '');
        form.setValue('state', components.state || '');
        form.setValue('postalCode', components.postal_code || '');
        form.setValue('country', components.country || '');
      }}
    />
  )}
/>
```

## Step 6: API Endpoint for Validation (Optional)

Create `src/app/api/validate-address/route.ts` for server-side address validation.

## Security Considerations

1. **API Key Restrictions**: Limit to specific domains and APIs
2. **Rate Limiting**: Implement on backend API
3. **CORS**: Configure appropriately
4. **Server-side Validation**: Always validate addresses on backend
5. **Data Storage**: Hash sensitive address data if storing

## Performance Tips

1. Debounce autocomplete requests
2. Lazy load the maps library script
3. Cache recent addresses client-side
4. Use session storage for temporary address data

## Troubleshooting

### "Places API not enabled"
- Check Google Cloud Console that API is enabled
- Wait 5-10 minutes for API to activate

### "API key invalid"
- Verify key in `.env.local`
- Check domain restrictions in Google Cloud
- Ensure billing is enabled

### "No suggestions appearing"
- Verify restrictions aren't too strict
- Try in an allowed domain
- Check browser console for errors

## Next Steps

1. Create the component (steps in next file)
2. Add environment variable
3. Update your forms with the new field
4. Test with real addresses
5. Deploy with appropriate API key restrictions
