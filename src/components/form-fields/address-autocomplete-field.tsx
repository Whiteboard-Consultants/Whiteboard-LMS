"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ControllerRenderProps } from "react-hook-form";

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

interface AddressAutocompleteFieldProps {
  field: ControllerRenderProps<any, any>;
  label?: string;
  placeholder?: string;
  onAddressSelected?: (components: AddressComponent) => void;
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  required?: boolean;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: any;
  }
}

export function AddressAutocompleteField({
  field,
  label = "Address",
  placeholder = "Enter your address",
  onAddressSelected,
  onLocationChange,
  required = false,
  disabled = false,
}: AddressAutocompleteFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // First effect: Load Google Maps
  useEffect(() => {
    let isMounted = true;

    const loadMaps = async () => {
      try {
        await loadGoogleMaps();
        if (isMounted) {
          setMapsLoaded(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load Google Maps";
        console.error("Failed to load Google Maps:", errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    loadMaps();
    return () => {
      isMounted = false;
    };
  }, []);

  // Second effect: Initialize autocomplete once Google Maps is loaded
  useEffect(() => {
    if (!mapsLoaded) {
      console.log("Waiting for Google Maps to load...");
      return;
    }

    if (!window.google?.maps?.places?.Autocomplete) {
      console.log("Google Maps Autocomplete still not available");
      return;
    }

    let isMounted = true;

    const initializeAutocompleteWhenReady = () => {
      // Try ref first
      if (inputRef.current) {
        console.log("Initializing from ref");
        initializeAutocomplete();
        return;
      }

      // Fallback: Use MutationObserver to wait for input to be added to DOM
      let observer: MutationObserver | null = null;
      let timeout: NodeJS.Timeout | null = null;

      const checkAndInitialize = () => {
        if (!isMounted) return;

        const inputs = document.querySelectorAll("input");
        for (const inp of inputs) {
          if (
            inp.getAttribute("aria-label") === label ||
            inp.placeholder === placeholder ||
            (inp.className.includes("bg-background") &&
              inp.type === "text" &&
              !inp.disabled)
          ) {
            console.log("Input found via DOM query, initializing");
            if (inputRef && !inputRef.current) {
              inputRef.current = inp;
            }
            initializeAutocomplete();
            if (observer) observer.disconnect();
            if (timeout) clearTimeout(timeout);
            return;
          }
        }
      };

      // Check immediately
      checkAndInitialize();
      if (!isMounted) return;

      // Set up observer for future mutations
      observer = new MutationObserver(() => {
        checkAndInitialize();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });

      // Timeout after 5 seconds
      timeout = setTimeout(() => {
        if (observer) observer.disconnect();
        if (isMounted) {
          console.warn("Timeout waiting for address input element");
        }
      }, 5000);
    };

    initializeAutocompleteWhenReady();

    return () => {
      isMounted = false;
    };
  }, [mapsLoaded, label, placeholder]);

  const loadGoogleMaps = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (window.google?.maps?.places?.Autocomplete) {
        console.log("Google Maps already loaded");
        resolve();
        return;
      }

      // Check if script is already in DOM
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );
      
      if (existingScript) {
        // Wait for it to load with timeout
        let attempts = 0;
        const waitForGoogle = () => {
          if (window.google?.maps?.places?.Autocomplete) {
            console.log("Google Maps script loaded (existing)");
            resolve();
          } else if (attempts < 50) {
            // Max 5 seconds (50 * 100ms)
            attempts++;
            setTimeout(waitForGoogle, 100);
          } else {
            reject(new Error("Timeout waiting for Google Maps to load"));
          }
        };
        waitForGoogle();
        return;
      }

      // Load new script
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        reject(
          new Error(
            "Google Maps API key is not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local"
          )
        );
        return;
      }

      console.log("Loading Google Maps script...");
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;

      script.onload = () => {
        console.log("Google Maps script loaded successfully");
        // Add a small delay to ensure Google object is available
        setTimeout(() => resolve(), 100);
      };

      script.onerror = () => {
        reject(new Error("Failed to load Google Maps API"));
      };

      document.head.appendChild(script);
    });
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current) {
      console.warn("Input ref not available");
      return;
    }

    if (!window.google?.maps?.places?.Autocomplete) {
      console.warn("Google Maps Autocomplete not available");
      return;
    }

    try {
      console.log("Initializing autocomplete...");

      const options: any = {
        fields: ["address_components", "geometry", "name", "formatted_address"],
        types: ["address"],
      };

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      console.log("Autocomplete instance created successfully");

      autocompleteRef.current.addListener("place_changed", () => {
        console.log("Place changed event triggered");
        handlePlaceChange();
      });

      inputRef.current.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" && e.keyCode === 13) {
          e.preventDefault();
        }
      });
    } catch (err) {
      console.error("Error initializing autocomplete:", err);
      setError(
        "Failed to initialize address autocomplete. Please refresh the page."
      );
    }
  };

  const handlePlaceChange = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();

    if (!place.address_components) {
      setError("Please select a valid address from the suggestions.");
      return;
    }

    const addressComponents: AddressComponent = {};

    place.address_components.forEach((component: any) => {
      const type = component.types[0];
      const longName = component.long_name;
      const shortName = component.short_name;

      switch (type) {
        case "street_number":
          addressComponents.street_number = longName;
          break;
        case "route":
          addressComponents.route = longName;
          break;
        case "locality":
          addressComponents.locality = longName;
          addressComponents.city = longName; // Map locality to city
          break;
        case "administrative_area_level_1":
          addressComponents.administrative_area_level_1 = shortName;
          addressComponents.state = shortName; // Map to state
          break;
        case "postal_code":
          addressComponents.postal_code = longName;
          break;
        case "country":
          addressComponents.country = longName;
          break;
      }
    });

    if (inputRef.current) {
      field.onChange(place.formatted_address || "");
    }

    if (onAddressSelected) {
      onAddressSelected(addressComponents);
    }

    if (onLocationChange && place.geometry?.location) {
      onLocationChange({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }

    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e.target.value);
  };

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <div className="relative">
          <Input
            ref={inputRef}
            {...field}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            onChange={handleInputChange}
            autoComplete="off"
            className="bg-background"
            aria-label={label}
            required={required}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </FormControl>
      {error && (
        <p className="text-sm font-medium text-destructive mt-1">{error}</p>
      )}
      <FormMessage />
    </FormItem>
  );
}
