"use client";

import { useSyncExternalStore } from "react";

// SSR-safe access to `window.location.search`. During static prerender
// `window` is undefined; we return "" so the server and client render the
// same initial value, then the client reads the real query string. Using
// useSyncExternalStore avoids hydration mismatches (React error #418).
const subscribe = () => () => {};

export function useLocationSearch(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
}
