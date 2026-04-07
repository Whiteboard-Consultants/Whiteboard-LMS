// TypeScript types for address autocomplete
// File: src/types/address.ts

/**
 * Address component types as returned by Google Maps Places API
 */
export interface AddressComponent {
  street_number?: string;
  route?: string;
  locality?: string;
  city?: string;
  administrative_area_level_1?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  [key: string]: string | undefined;
}

/**
 * Geographic coordinates
 */
export interface GeoLocation {
  lat: number;
  lng: number;
}

/**
 * Complete address object with all details
 */
export interface AddressDetails {
  // Main address components
  address: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  
  // Metadata
  formattedAddress?: string;
  placeId?: string;
  location?: GeoLocation;
  
  // Validation
  isValid?: boolean;
  validatedAt?: Date;
}

/**
 * Google Places API Place object
 */
export interface GooglePlace {
  formatted_address: string;
  geometry?: {
    location: google.maps.LatLng;
    bounds?: google.maps.LatLngBounds;
  };
  address_components?: google.maps.GeocoderAddressComponent[];
  place_id: string;
  name: string;
}

/**
 * Response from address validation API
 */
export interface AddressValidationResponse {
  isValid: boolean;
  formattedAddress?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  error?: string;
}

/**
 * Props for AddressAutocompleteField component
 */
export interface AddressAutocompleteFieldProps {
  field: any; // react-hook-form ControllerRenderProps
  label?: string;
  placeholder?: string;
  onAddressSelected?: (components: AddressComponent) => void;
  onLocationChange?: (location: GeoLocation) => void;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Props for AddressGroupField component
 */
export interface AddressGroupFieldProps {
  control: any; // react-hook-form UseFormReturn.control
  addressField: string;
  apartmentField?: string;
  cityField?: string;
  stateField?: string;
  postalCodeField?: string;
  countryField?: string;
  disabled?: boolean;
}

/**
 * Extended profile type with address fields
 */
export interface StudentProfile {
  id: string;
  user_id: string;
  name?: string;
  phone?: string;
  education?: string;
  passingYear?: number;
  improvementAreas?: string[];
  careerPlan?: string;
  needsInterviewSupport?: boolean;
  
  // Address fields
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}
