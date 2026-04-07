"use client";

import React from "react";
import { ControllerRenderProps, useFormContext } from "react-hook-form";
import { AddressAutocompleteField } from "./address-autocomplete-field";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AddressComponent {
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

interface AddressGroupFieldProps {
  control: any; // useFormContext return type
  addressField: string;
  apartmentField?: string;
  cityField?: string;
  stateField?: string;
  postalCodeField?: string;
  countryField?: string;
  disabled?: boolean;
}

/**
 * Renders a group of address fields with autocomplete for the main address
 * Automatically fills in related fields when an address is selected
 */
export function AddressGroupField({
  control,
  addressField,
  apartmentField,
  cityField,
  stateField,
  postalCodeField,
  countryField,
  disabled = false,
}: AddressGroupFieldProps) {
  const { setValue } = useFormContext(); // Get setValue from form context
  
  return (
    <div className="space-y-4">
      {/* Main address field with autocomplete */}
      <FormField
        control={control}
        name={addressField}
        render={({ field }) => (
          <AddressAutocompleteField
            field={field}
            label="Street Address"
            placeholder="123 Main Street"
            disabled={disabled}
            onAddressSelected={(components: AddressComponent) => {
              // Auto-fill related fields using proper react-hook-form API
              if (cityField && components.city) {
                setValue(cityField, components.city);
              }
              if (stateField && components.state) {
                setValue(stateField, components.state);
              }
              if (postalCodeField && components.postal_code) {
                setValue(postalCodeField, components.postal_code);
              }
              if (countryField && components.country) {
                setValue(countryField, components.country);
              }
            }}
          />
        )}
      />

      {/* Optional apartment/suite field */}
      {apartmentField && (
        <FormField
          control={control}
          name={apartmentField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apartment, Suite, etc. (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Apt 123"
                  disabled={disabled}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* City field */}
      {cityField && (
        <FormField
          control={control}
          name={cityField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="San Francisco"
                  disabled={disabled}
                  autoComplete="address-level2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* State and Postal Code - side by side */}
      <div className="grid grid-cols-2 gap-4">
        {stateField && (
          <FormField
            control={control}
            name={stateField}
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="CA"
                    disabled={disabled}
                    autoComplete="address-level1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {postalCodeField && (
          <FormField
            control={control}
            name={postalCodeField}
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP/Postal Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="12345"
                    disabled={disabled}
                    autoComplete="postal-code"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Country field */}
      {countryField && (
        <FormField
          control={control}
          name={countryField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="United States"
                  disabled={disabled}
                  autoComplete="country-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
