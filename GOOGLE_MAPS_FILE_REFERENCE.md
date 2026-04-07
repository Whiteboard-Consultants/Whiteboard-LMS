# Google Maps Address Autocomplete - File & Component Reference

## 📋 Complete File Listing

### ✅ React Components (Ready to Use)

#### 1. **AddressAutocompleteField** 
**File:** `src/components/form-fields/address-autocomplete-field.tsx`

**Purpose:** Low-level component for single address input with autocomplete

**Props:**
```typescript
interface AddressAutocompleteFieldProps {
  field: ControllerRenderProps<any, any>;           // react-hook-form field
  label?: string;                                    // Field label ("Address", etc)
  placeholder?: string;                              // Input placeholder text
  onAddressSelected?: (components: AddressComponent) => void;  // Callback when address picked
  onLocationChange?: (location: GeoLocation) => void;         // Callback with lat/lng
  required?: boolean;                                         // Is field required?
  disabled?: boolean;                                         // Disable input?
}
```

**Features:**
- Real-time autocomplete suggestions
- Parses address components
- Returns coordinates
- Error handling with loading state
- Mobile-friendly
- Accessibility support

**Usage:**
```tsx
import { AddressAutocompleteField } from "@/components/form-fields/address-autocomplete-field";

<FormField
  control={form.control}
  name="address"
  render={({ field }) => (
    <AddressAutocompleteField
      field={field}
      label="Address"
      onAddressSelected={(components) => {
        form.setValue('city', components.city || '');
      }}
    />
  )}
/>
```

---

#### 2. **AddressGroupField**
**File:** `src/components/form-fields/address-group-field.tsx`

**Purpose:** High-level component - complete address form with auto-fill

**Props:**
```typescript
interface AddressGroupFieldProps {
  control: any;                    // react-hook-form control
  addressField: string;            // Form field name for address
  apartmentField?: string;         // Form field name for apartment
  cityField?: string;              // Form field name for city
  stateField?: string;             // Form field name for state
  postalCodeField?: string;        // Form field name for postal code
  countryField?: string;           // Form field name for country
  disabled?: boolean;              // Disable all inputs?
}
```

**What It Renders:**
- Address input (with autocomplete)
- Apartment/Suite input (optional)
- City input
- State/Province input
- Postal/ZIP code input
- Country input

**Features:**
- Auto-fills related fields when address selected
- All fields properly labeled
- Proper autocomplete attributes for browser suggestions
- Responsive grid layout

**Usage:**
```tsx
import { AddressGroupField } from "@/components/form-fields/address-group-field";

<AddressGroupField
  control={form.control}
  addressField="address"
  apartmentField="apartment"
  cityField="city"
  stateField="state"
  postalCodeField="postalCode"
  countryField="country"
/>
```

---

### ✅ React Hooks (Utility Functions)

#### 3. **useAddressValidation**
**File:** `src/hooks/use-address-validation.ts`

**Purpose:** Client-side hook for server-side address validation

**Functions:**
```typescript
export function useAddressValidation() {
  return {
    validateAddress: (address, city?, state?, postalCode?, country?) 
      => Promise<AddressValidationResponse | null>,
    isValidating: boolean,
    error: string | null,
  };
}
```

**Usage:**
```tsx
import { useAddressValidation } from "@/hooks/use-address-validation";

const { validateAddress, isValidating, error } = useAddressValidation();

const handleSubmit = async (values) => {
  const result = await validateAddress(
    values.address,
    values.city,
    values.state,
    values.postalCode,
    values.country
  );
  
  if (result?.isValid) {
    // Save to database
  } else {
    // Show error
  }
};
```

---

### ✅ API Endpoints (Backend)

#### 4. **Address Validation API**
**File:** `src/app/api/addresses/validate/route.ts`

**Method:** `POST`

**Endpoint:** `/api/addresses/validate`

**Request Body:**
```typescript
{
  address: string;        // e.g., "123 Main St"
  city?: string;          // e.g., "San Francisco"
  state?: string;         // e.g., "CA"
  postalCode?: string;    // e.g., "94102"
  country?: string;       // e.g., "United States"
}
```

**Response:**
```typescript
{
  isValid: boolean;
  formattedAddress?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  error?: string;
}
```

**Usage from Frontend:**
```tsx
const response = await fetch('/api/addresses/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'USA'
  })
});

const data = await response.json();
console.log(data.isValid, data.coordinates);
```

---

### ✅ TypeScript Types (Type Definitions)

#### 5. **Address Types**
**File:** `src/types/address.ts`

**Exported Types:**

```typescript
// Address components from Google Maps
AddressComponent {
  street_number?: string;
  route?: string;
  locality?: string;
  city?: string;
  administrative_area_level_1?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

// Geographic location
GeoLocation {
  lat: number;
  lng: number;
}

// Complete address details
AddressDetails {
  address: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  formattedAddress?: string;
  placeId?: string;
  location?: GeoLocation;
  isValid?: boolean;
  validatedAt?: Date;
}

// Google Places API response
GooglePlace {
  formatted_address: string;
  geometry?: { location: google.maps.LatLng; bounds?: google.maps.LatLngBounds; };
  address_components?: google.maps.GeocoderAddressComponent[];
  place_id: string;
  name: string;
}

// API validation response
AddressValidationResponse {
  isValid: boolean;
  formattedAddress?: string;
  coordinates?: { latitude: number; longitude: number; };
  error?: string;
}

// Extended student profile (NEW FIELDS)
StudentProfile {
  id: string;
  user_id: string;
  name?: string;
  phone?: string;
  education?: string;
  passingYear?: number;
  improvementAreas?: string[];
  careerPlan?: string;
  needsInterviewSupport?: boolean;
  // NEW ADDRESS FIELDS:
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}
```

---

### ✅ Database Migration

#### 6. **Address Fields Migration**
**File:** `supabase/migrations/add_address_fields.sql`

**What It Does:**
- Adds 6 new columns to `student_profiles` table
- Creates indexes for faster queries
- Adds documentation comments
- Optionally sets up RLS policies

**Columns Added:**
```sql
address TEXT              -- "123 Main Street"
apartment TEXT            -- "Apt 456" (optional)
city TEXT                 -- "San Francisco"
state TEXT                -- "CA"
postal_code TEXT          -- "94102"
country TEXT              -- "United States"
```

**Indexes Created:**
```sql
CREATE INDEX idx_student_profiles_city
CREATE INDEX idx_student_profiles_country
```

---

### ✅ Documentation Files

#### 7. **GOOGLE_MAPS_IMPLEMENTATION_SUMMARY.md**
- Complete overview of what was created
- 6-phase implementation plan
- Security checklist
- Cost estimation
- Features list

#### 8. **GOOGLE_MAPS_QUICK_START.md**
- Quick reference guide
- Setup checklist (8 items)
- Common problems & solutions
- Testing instructions
- Configuration options

#### 9. **PROFILE_FORM_INTEGRATION_EXAMPLE.md**
- Step-by-step code examples
- How to update profile form
- Schema changes
- useEffect updates
- onSubmit handler updates

#### 10. **GOOGLE_MAPS_IMPLEMENTATION_CHECKLIST.md**
- Detailed step-by-step checklist
- 10 phases with sub-tasks
- Verification steps after each phase
- Rollback plan if issues
- ~2-3 hours estimated total time

#### 11. **GOOGLE_MAPS_ARCHITECTURE.md**
- System architecture diagrams
- Data flow visualization
- Component hierarchy
- API integration points
- Error handling flow
- Performance considerations
- Cost analysis
- Security architecture
- Monitoring & debugging

#### 12. **This File (FILE_AND_COMPONENT_REFERENCE.md)**
- Complete listing of all created files
- Purpose of each component/API
- Props and usage examples
- Quick reference guide

---

## 🔧 Quick Reference

### Installation
```bash
npm install @googlemaps/js-api-loader
```

### Environment Setup
```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### Import Statements
```typescript
// High-level component (recommended for most cases)
import { AddressGroupField } from "@/components/form-fields/address-group-field";

// Low-level component (for custom layouts)
import { AddressAutocompleteField } from "@/components/form-fields/address-autocomplete-field";

// Validation hook
import { useAddressValidation } from "@/hooks/use-address-validation";

// Types
import type { 
  AddressComponent, 
  GeoLocation, 
  AddressDetails,
  StudentProfile 
} from "@/types/address";
```

### Zod Schema
```typescript
const formSchema = z.object({
  // ... existing fields
  address: z.string().optional().or(z.literal('')),
  apartment: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
});
```

---

## 📊 Decision Tree: Which Component to Use?

```
Need address autocomplete?
│
├─ Yes, and need:
│  ├─ Just address input → AddressAutocompleteField
│  ├─ Full address form with auto-fill → AddressGroupField
│  └─ Custom layout → AddressAutocompleteField + your fields
│
└─ No, just need validation → useAddressValidation hook
```

---

## 🔄 Common Workflows

### Workflow 1: Simple Address in Profile
```tsx
import { AddressGroupField } from "@/components/form-fields/address-group-field";

export const ProfileForm = () => {
  const form = useForm({
    schema: profileSchema  // includes address fields
  });

  return (
    <Form {...form}>
      <AddressGroupField
        control={form.control}
        addressField="address"
        cityField="city"
        stateField="state"
        postalCodeField="postalCode"
        countryField="country"
      />
      <Button onClick={form.handleSubmit(onSubmit)}>Save</Button>
    </Form>
  );
};
```

### Workflow 2: Multiple Addresses
```tsx
// Repeat AddressGroupField for each address type
<AddressGroupField
  control={form.control}
  addressField="homeAddress"
  cityField="homeCity"
  // ...
/>

<AddressGroupField
  control={form.control}
  addressField="workAddress"
  cityField="workCity"
  // ...
/>
```

### Workflow 3: Custom Layout
```tsx
<FormField
  control={form.control}
  name="address"
  render={({ field }) => (
    <AddressAutocompleteField
      field={field}
      label="Where are you from?"
      placeholder="Type your city..."
    />
  )}
/>
```

### Workflow 4: Server-Side Validation
```tsx
const { validateAddress, isValidating, error } = useAddressValidation();

const onSubmit = async (values) => {
  const result = await validateAddress(
    values.address, 
    values.city, 
    values.state,
    values.postalCode, 
    values.country
  );
  
  if (!result?.isValid) {
    toast.error("Invalid address");
    return;
  }
  
  // Save to database
};
```

---

## 🚀 Getting Started (TL;DR)

1. **Install:** `npm install @googlemaps/js-api-loader`
2. **Configure:** Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`
3. **Migrate:** Run the SQL in `add_address_fields.sql`
4. **Update Form:** Add `AddressGroupField` to profile form
5. **Test:** Type address, select suggestion, verify auto-fill
6. **Deploy:** Set API key secret in production

**Time estimate:** 30-45 minutes

---

## 📞 Support & Resources

- **Setup Guide:** GOOGLE_MAPS_QUICK_START.md
- **Full Details:** GOOGLE_MAPS_IMPLEMENTATION_SUMMARY.md
- **Checklist:** GOOGLE_MAPS_IMPLEMENTATION_CHECKLIST.md
- **Architecture:** GOOGLE_MAPS_ARCHITECTURE.md
- **Integration:** PROFILE_FORM_INTEGRATION_EXAMPLE.md
- **Google Docs:** https://developers.google.com/maps/documentation/places

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] Components import without errors
- [ ] `npm run typecheck` passes
- [ ] Database migration applied
- [ ] API key in `.env.local`
- [ ] Form renders in browser
- [ ] Autocomplete suggestions appear when typing
- [ ] Address selection auto-fills other fields
- [ ] Form submission saves to database
- [ ] `npm run build` succeeds
- [ ] No console errors

---

**You're all set! Start with the Quick Start guide:** [GOOGLE_MAPS_QUICK_START.md](GOOGLE_MAPS_QUICK_START.md)
