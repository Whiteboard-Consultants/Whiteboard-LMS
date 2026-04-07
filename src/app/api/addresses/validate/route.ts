// API endpoint for server-side address validation
// File: src/app/api/addresses/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';

interface AddressValidationRequest {
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface AddressValidationResponse {
  isValid: boolean;
  formattedAddress?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  error?: string;
}

/**
 * POST /api/addresses/validate
 * 
 * Validates an address using Google Maps Address Validation API
 * Requires GOOGLE_MAPS_API_KEY environment variable
 * 
 * Request body:
 * {
 *   "address": "123 Main St, San Francisco, CA 94102, USA"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body: AddressValidationRequest = await request.json();

    if (!body.address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Construct full address string
    const fullAddress = [
      body.address,
      body.city,
      body.state,
      body.postalCode,
      body.country,
    ]
      .filter(Boolean)
      .join(', ');

    // Call Google Maps Address Validation API
    const response = await fetch(
      'https://addressvalidation.googleapis.com/v1:validateAddress',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: {
            addressLines: [fullAddress],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Check validation result
    const validationResult = data.result?.verdict;
    
    if (!validationResult) {
      return NextResponse.json(
        {
          isValid: false,
          error: 'Address could not be validated',
        } as AddressValidationResponse,
        { status: 400 }
      );
    }

    // Extract formatted address and coordinates
    const addressComponent = data.result?.address;
    const geocode = data.result?.geocode;

    const response_data: AddressValidationResponse = {
      isValid: validationResult.deliverabilityAnalysis?.addressComplete === true,
      formattedAddress: addressComponent?.formattedAddress,
      coordinates: geocode?.location
        ? {
            latitude: geocode.location.latitude,
            longitude: geocode.location.longitude,
          }
        : undefined,
    };

    return NextResponse.json(response_data);
  } catch (error) {
    console.error('Address validation error:', error);
    
    return NextResponse.json(
      {
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      } as AddressValidationResponse,
      { status: 500 }
    );
  }
}
