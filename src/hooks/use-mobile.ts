
"use client"

import { useState, useEffect, useLayoutEffect } from "react"

/**
 * useIsMobile: Detects if viewport is mobile.
 * 
 * Uses useLayoutEffect instead of useEffect to update state BEFORE paint,
 * preventing hydration mismatches and FOUC (Flash of Unstyled Content).
 * 
 * On server: Returns { isMobile: false, isMounted: false }
 * On client: Updates to actual values before first paint
 */
export function useIsMobile() {
  const [state, setState] = useState(() => {
    // Server-side or initial render: always return false
    // This ensures server and client start with same values
    if (typeof window === "undefined") {
      return { isMobile: false, isMounted: false }
    }
    // Client side after hydration
    return { isMobile: false, isMounted: false }
  })

  // Use useLayoutEffect instead of useEffect
  // This runs SYNCHRONOUSLY after DOM mutations but BEFORE browser paint
  // This means hydration completes, state updates, but nothing has been painted yet
  useLayoutEffect(() => {
    const checkDevice = () => {
      const isMobileNow = window.matchMedia("(max-width: 1023px)").matches
      setState({ isMobile: isMobileNow, isMounted: true })
    }

    // Update state immediately (before paint)
    checkDevice()

    // Add listener for window resize
    window.addEventListener("resize", checkDevice)

    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return state
}
