/**
 * Storage helpers for the onboarding tour (so OnboardingTour.tsx can export only the component for fast refresh).
 */

const TOUR_STORAGE_KEY = 'aira-onboarding-tour-done';

export function getOnboardingTourDone(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
}

export function setOnboardingTourDone(): void {
  localStorage.setItem(TOUR_STORAGE_KEY, 'true');
}

export function clearOnboardingTourDone(): void {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}
