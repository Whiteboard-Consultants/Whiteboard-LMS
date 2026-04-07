# Google Maps Address Autocomplete - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Next.js App                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            React Component (Profile Form)              │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │ AddressGroupField Component                  │    │   │
│  │  │                                              │    │   │
│  │  │ ┌──────────────────────────────┐            │    │   │
│  │  │ │ AddressAutocompleteField     │            │    │   │
│  │  │ │ (with Google Places API)     │            │    │   │
│  │  │ └──────────────────────────────┘            │    │   │
│  │  │             ↓                               │    │   │
│  │  │ ┌──────────────────────────────┐            │    │   │
│  │  │ │ City, State, Zip (auto-fill) │            │    │   │
│  │  │ └──────────────────────────────┘            │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  │  React Hook Form + Zod Validation                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        /api/addresses/validate (Optional)              │   │
│  │  - Server-side address validation                      │   │
│  │  - Returns formatted address + coordinates             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Supabase Database                         │   │
│  │  ┌────────────────────────────────────────┐           │   │
│  │  │ student_profiles table                 │           │   │
│  │  │ ├─ address (text)                      │           │   │
│  │  │ ├─ apartment (text)                    │           │   │
│  │  │ ├─ city (text)                         │           │   │
│  │  │ ├─ state (text)                        │           │   │
│  │  │ ├─ postal_code (text)                  │           │   │
│  │  │ ├─ country (text)                      │           │   │
│  │  │ └─ updated_at (timestamp)              │           │   │
│  │  └────────────────────────────────────────┘           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
              ┌─────────────────────────────┐
              │   Google Cloud Platform     │
              ├─────────────────────────────┤
              │ • Places API (Input)        │
              │ • Maps JavaScript API       │
              │ • Address Validation API    │
              │   (Optional - Server-side)  │
              └─────────────────────────────┘

```

---

## Data Flow Diagram

### User Workflow:

```
┌─────────┐
│ User    │
│ Opens   │
│ Form    │
└────┬────┘
     │
     ▼
┌─────────────────────────────────┐
│ Component Loads                 │
│ - Google Maps library loaded    │
│ - Places Autocomplete created   │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ User Types Address:             │
│ "123 main st, sf"               │
└────┬────────────────────────────┘
     │
     ▼ (Debounced)
┌─────────────────────────────────┐
│ Request Sent to Google          │
│ Places API (Autocomplete)       │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ Google Returns:                 │
│ - Suggestions list              │
│ (place IDs, names)              │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ Dropdown Shows Suggestions      │
│ User Selects One                │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ Place Details Retrieved:        │
│ - address_components            │
│ - geometry (lat/lng)            │
│ - formatted_address             │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ Components Parsed:              │
│ - street_number                 │
│ - route → address               │
│ - locality → city               │
│ - admin_area_level_1 → state    │
│ - postal_code                   │
│ - country                       │
└────┬────────────────────────────┘
     │
     ├─ onAddressSelected()
     │  └─ Auto-fill form fields
     │
     └─ onLocationChange()
        └─ Store coordinates
        
     ▼
┌─────────────────────────────────┐
│ Optional: Server Validation     │
│ POST /api/addresses/validate    │
│ → Returns validation status     │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ User Reviews &                  │
│ Submits Form                    │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ Form Validation (Zod)           │
│ - Check required fields         │
│ - Format validation             │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ Save to Supabase:               │
│ INSERT/UPDATE student_profiles  │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ Success - Show Toast            │
│ "Profile updated successfully!" │
└─────────────────────────────────┘
```

---

## Component Hierarchy

```
ProfileForm (React Hook Form)
│
├── FormField (address)
│   └── AddressGroupField
│       │
│       ├── FormField (address)
│       │   └── AddressAutocompleteField
│       │       └── Google Places Autocomplete
│       │
│       ├── FormField (apartment)
│       │   └── Input
│       │
│       ├── FormField (city)
│       │   └── Input
│       │
│       ├── FormField (state)
│       │   └── Input
│       │
│       ├── FormField (postalCode)
│       │   └── Input
│       │
│       └── FormField (country)
│           └── Input
│
└── Submit Button
    └── onSubmit handler
        └── Update Supabase
```

---

## API Integration Points

### 1. Client-Side: Google Places API

**Autocomplete Component → Google Servers**

```
Request:
├─ Input: "123 main str, san"
├─ Options:
│  ├─ componentRestrictions: { country: "in" }
│  ├─ types: ["address"]
│  └─ fields: ["address_components", "geometry"]
└─ Frequency: ~1 request per keystroke (debounced)

Response:
├─ Predictions array:
│  ├─ Place ID
│  ├─ Main text
│  ├─ Secondary text (address)
│  └─ Display name
└─ Rate: $0.009 per request
```

### 2. Client-Side: Google Geocoder

**After Selection → Get Details**

```
Request:
├─ Place ID (from autocomplete)
└─ Fields: ["address_components", "geometry"]

Response:
├─ address_components array:
│  ├─ { types: ["route"], long_name: "Main Street", ... }
│  ├─ { types: ["locality"], long_name: "San Francisco", ... }
│  ├─ { types: ["postal_code"], long_name: "94102", ... }
│  └─ ... more components
├─ geometry:
│  ├─ location: { lat: 37.7749, lng: -122.4194 }
│  └─ bounds: { northeast: {...}, southwest: {...} }
└─ formatted_address: "123 Main St, San Francisco, CA 94102, USA"
```

### 3. Server-Side (Optional): Address Validation API

**Your Backend → Google Servers**

```
Request:
├─ address:
│  ├─ addressLines: ["123 Main St, San Francisco, CA 94102, USA"]
│  └─ regionCode: "US"
└─ When: On form submit (for mission-critical operations)

Response:
├─ verdict:
│  ├─ addressComplete: true/false
│  ├─ hasUnconfirmedComponents: true/false
│  └─ claimTypes: ["RESIDENTIAL", "COMMERCIAL", ...]
├─ address:
│  └─ formattedAddress: "123 Main St, San Francisco, CA 94102, USA"
├─ geocode:
│  ├─ location: { latitude: 37.7749, longitude: -122.4194 }
│  └─ bounds: { northeast: {...}, southwest: {...} }
└─ Rate: $0.007 per validation
```

### 4. Database: Supabase

**Your Backend → Supabase**

```
INSERT/UPDATE student_profiles
└─ {
    user_id: "auth-id",
    address: "123 Main Street",
    apartment: "Apt 456",
    city: "San Francisco",
    state: "CA",
    postal_code: "94102",
    country: "United States",
    updated_at: "2024-04-06T..."
  }

Query Example:
SELECT * FROM student_profiles
WHERE country = 'United States'
  AND state = 'CA'
LIMIT 10;
```

---

## State Management Flow

```
Form State (React Hook Form)
│
├─ Controlled by AddressGroupField
│  │
│  └─ Each field has:
│     ├─ Value (from form.watch())
│     ├─ Validation errors
│     ├─ Touch state
│     └─ Dirty state
│
├─ When Address Selected:
│  ├─ Update all related fields via form.setValue()
│  ├─ Trigger validation
│  └─ Mark fields as touched
│
└─ On Submit:
   ├─ Validate all fields (Zod schema)
   ├─ Get all form values
   └─ Send to Supabase
```

---

## Error Handling Flow

```
┌─────────────────────────────────┐
│ Error Occurs                    │
└────┬────────────────────────────┘
     │
     ├─ No API Key?
     │  └─ Show: "Maps configuration error"
     │
     ├─ API Not Enabled?
     │  └─ Show: "Failed to load Google Maps" (after 10 min)
     │
     ├─ No Suggestions?
     │  └─ Show: Loading state, then allow manual entry
     │
     ├─ User Doesn't Select?
     │  └─ Show: "Please select a valid address"
     │
     ├─ Network Error?
     │  └─ Show: "Connection error - check internet"
     │
     ├─ Invalid Address?
     │  └─ Show: Form validation message
     │
     └─ Database Error?
        └─ Show: "Failed to save profile"
        └─ Log: Error details + User ID + Timestamp
```

---

## Performance Considerations

### Load Times:
- **Initial Load**: ~200-500ms (@googlemaps/js-api-loader)
- **First Autocomplete Request**: ~100-300ms
- **Subsequent Requests**: ~50-150ms (cached by browser)
- **Place Details**: ~100-200ms

### Optimization Strategies:

1. **Lazy Loading**
   - Load Google Maps library only when form opens
   - Not on initial page load

2. **Debouncing**
   - Wait 300ms after user stops typing
   - Reduces API calls by ~70%

3. **Caching**
   - Browser caches Places API responses
   - SessionStorage for recent addresses

4. **Pagination**
   - Suggestions limited to 5 results
   - Reduces UI rendering time

---

## Cost Analysis

**Monthly Estimate (10,000 users):**

```
If 30% make address lookups/month = 3,000 lookups

Places Autocomplete:
┌─ Lookups: 3,000
├─ Avg requests per lookup: 5 (typing + selection)
├─ Total requests: 15,000
├─ Free tier: 25,000
└─ Cost: $0 (within free tier)

Address Validation (if enabled):
┌─ Validations: 3,000 (on submit)
├─ Cost per: $0.007
└─ Total: $21/month

Maps JavaScript API:
├─ Included with Free tier
└─ Cost: $0 (up to limits)

TOTAL: ~$21/month
```

**At Scale (100,000 users @ 30%):**

```
30,000 lookups/month
150,000 autocomplete requests

Breakdown:
├─ Autocomplete: $1,350/month ($0.009 × 150k)
├─ Validation: $210/month ($0.007 × 30k)
├─ Maps JS: Included
└─ TOTAL: ~$1,560/month
```

---

## Security Architecture

```
┌──────────────────────────────┐
│   User's Device (Browser)    │
├──────────────────────────────┤
│ - Geocodes visible in HTML   │
│ - API Key exposed (required) │
│ - HTTPS enforced             │
└──────┬───────────────────────┘
       │
       ├─ Domain-restricted API Key
       ├─ Only allows requests from whitelist
       └─ Expires / Rotates regularly
       
       ▼
┌──────────────────────────────┐
│  Your Backend (Next.js)      │
├──────────────────────────────┤
│ ✓ Rate limiting              │
│ ✓ Input validation           │
│ ✓ Permission checks (RLS)    │
│ ✓ Audit logging              │
└──────┬───────────────────────┘
       │
       ├─ Server-side API key (secure)
       ├─ HTTPS only
       └─ No client exposure
       
       ▼
┌──────────────────────────────┐
│  Supabase Database           │
├──────────────────────────────┤
│ ✓ Row Level Security (RLS)   │
│ ✓ Encrypted connection       │
│ ✓ Audit logs                 │
│ ✓ Regular backups            │
└──────────────────────────────┘
```

---

## Monitoring & Debugging

### Key Metrics to Monitor:

1. **API Usage**
   - Google Cloud Console → Places API metrics
   - Daily/Monthly request volume
   - Failed requests percentage

2. **Performance**
   - Autocomplete response time
   - Component load time
   - Form submit latency

3. **Errors**
   - Failed API requests
   - Validation errors
   - Database save failures

### Debug Checklist:

```bash
# 1. Verify API Key
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# 2. Check Network Requests
Dev Tools → Network tab → Filter by "googleapis.com"

# 3. Console Errors
Dev Tools → Console → Filter by errors

# 4. Database Data
Supabase Dashboard → SQL Editor →
SELECT * FROM student_profiles WHERE address IS NOT NULL

# 5. API Logs
Supabase Dashboard → Logs → Filter by recent time
```

---

This architecture ensures:
- ✅ **Fast Performance**: Lazy loading, debouncing, caching
- ✅ **Security**: API key restrictions, server-side validation, RLS
- ✅ **Scalability**: Efficient API usage, cost-controlled
- ✅ **Reliability**: Error handling, fallbacks, logging
- ✅ **User Experience**: Auto-fill, validation, clear errors
