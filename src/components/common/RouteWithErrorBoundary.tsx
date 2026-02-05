import { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Wraps a route's element in an ErrorBoundary so a single page crash
 * doesn't take down the whole app. User gets ErrorFallback with Retry / Go Home.
 */
export default function RouteWithErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
