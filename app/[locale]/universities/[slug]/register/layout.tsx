import { Suspense, type ReactNode } from "react";
import { RegisterSuspenseFallback } from "./register-suspense-fallback";

/**
 * `useSearchParams()` in the client page must sit under a Suspense boundary.
 * Keeping Suspense in a **Server** layout avoids SSR/client tree mismatches on the
 * default client page export (dev / Turbopack / embedded preview).
 */
export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RegisterSuspenseFallback />}>{children}</Suspense>;
}
