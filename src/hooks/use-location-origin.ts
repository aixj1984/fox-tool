"use client";

import { useSyncExternalStore } from "react";

// SSR-safe access to `window.location.origin` for `output: "export"` builds.
// During static prerender `window` is undefined and we return an empty
// string; on the client we return the real origin. Using useSyncExternalStore
// avoids hydration mismatches (React error #418) and the lint rule that
// forbids calling setState directly inside an effect.
const subscribe = () => () => {};

export function useLocationOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
}
