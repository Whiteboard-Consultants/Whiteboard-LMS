// Optional: Hook to use address validation in your forms
// File: src/hooks/use-address-validation.ts

import { useState, useCallback } from 'react';

interface AddressValidationResponse {
  isValid: boolean;
  formattedAddress?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  error?: string;
}

export function useAddressValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAddress = useCallback(
    async (
      address: string,
      city?: string,
      state?: string,
      postalCode?: string,
      country?: string
    ): Promise<AddressValidationResponse | null> => {
      if (!address?.trim()) {
        setError('Address is required');
        return null;
      }

      try {
        setIsValidating(true);
        setError(null);

        const response = await fetch('/api/addresses/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            city,
            state,
            postalCode,
            country,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data: AddressValidationResponse = await response.json();

        if (!data.isValid) {
          setError(data.error || 'Address could not be validated');
          return null;
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Address validation failed';
        setError(errorMessage);
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  return {
    validateAddress,
    isValidating,
    error,
  };
}
