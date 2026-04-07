# Google Maps Address Autocomplete - Quick Start

## 📋 Setup Checklist

- [ ] **Step 1: Get Google Maps API Key**
  1. Visit [Google Cloud Console](https://console.cloud.google.com/)
  2. Create/select a project
  3. Enable: Places API, Maps JavaScript API
  4. Create API Key (Credentials → Create Credentials → API Key)
  5. Restrict to your domain

- [ ] **Step 2: Configure Environment**
  Add to `.env.local`:
  ```
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
  ```

- [ ] **Step 3: Install Dependencies**
  ```bash
  npm install @googlemaps/js-api-loader
  ```

- [ ] **Step 4: Update Database**
  Run the migration:
  ```bash
  supabase migration new add_address_fields
  # Copy contents from supabase/migrations/add_address_fields.sql
  ```

- [ ] **Step 5: Use Components in Forms**
  See PROFILE_FORM_INTEGRATION_EXAMPLE.md for implementation

## 🚀 Quick Integration

### In Your Form Component:

```tsx
import { AddressGroupField } from "@/components/form-fields/address-group-field";

// In your form schema (using zod):
const formSchema = z.object({
  // ... existing fields
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

// In your form JSX:
<AddressGroupField
  control={form.control}
  addressField="address"
  cityField="city"
  stateField="state"
  postalCodeField="postalCode"
  countryField="country"
/>
```

## 📁 Files Created

1. **Components:**
   - `src/components/form-fields/address-autocomplete-field.tsx` - Core component
   - `src/components/form-fields/address-group-field.tsx` - Ready-to-use address form group

2. **API:**
   - `src/app/api/addresses/validate/route.ts` - Server-side validation (optional)

3. **Hooks:**
   - `src/hooks/use-address-validation.ts` - Address validation hook

4. **Database:**
   - `supabase/migrations/add_address_fields.sql` - Schema migration

5. **Documentation:**
   - `GOOGLE_MAPS_ADDRESS_SETUP.md` - Full setup guide
   - `PROFILE_FORM_INTEGRATION_EXAMPLE.md` - Integration examples

## 🔒 Security Best Practices

1. **API Key Restrictions:**
   - Only allow your domain(s)
   - Limit to Places API, Maps JS API only
   - Set HTTP referrers if possible

2. **Rate Limiting:**
   - Implement on your backend API endpoint
   - Use debouncing on the client (already included)

3. **Data Protection:**
   - Hash address data if storing for logging
   - Don't expose raw API keys in client code (using NEXT_PUBLIC_ is required for this library)
   - Validate addresses on the backend

## ⚙️ Configuration Options

### Restrict to Specific Countries:

```tsx
// In address-autocomplete-field.tsx, modify the options:
const options: google.maps.places.AutocompleteOptions = {
  componentRestrictions: { 
    country: ["in", "us", "uk"] // Your countries
  },
  fields: ["address_components", "geometry", "name", "formatted_address"],
  types: ["address"],
};
```

### Customize Field Labels:

```tsx
<AddressAutocompleteField
  field={field}
  label="Enter your location"
  placeholder="Start typing your address..."
/>
```

## 🧪 Testing

1. **Test with sample addresses:**
   - "123 Main St, San Francisco, CA 94102"
   - "1600 Amphitheatre Parkway, Mountain View, CA 94043"

2. **Check browser console:**
   - No API errors
   - Suggestions appearing correctly
   - Location data being captured

3. **Verify database:**
   ```sql
   SELECT address, city, state, postal_code, country 
   FROM student_profiles 
   LIMIT 5;
   ```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key invalid" | Verify key in .env.local, check domain restrictions |
| No suggestions | Wait 10 mins for API to activate, check billing enabled |
| Component not rendering | Verify @googlemaps/js-api-loader installed |
| Values not saving | Check form schema includes address fields |

## 📖 Next Steps

1. Start with `AddressGroupField` component in your profile form
2. Test autocomplete functionality
3. Optionally add server-side validation via `/api/addresses/validate`
4. Deploy with proper API key restrictions
5. Monitor Google Cloud Console for usage

## 🔗 Useful Resources

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Google Maps Loader Docs](https://github.com/googlemaps/js-api-loader)
- [Address Validation API](https://developers.google.com/maps/documentation/address-validation)
