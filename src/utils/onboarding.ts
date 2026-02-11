/**
 * Shared onboarding state check so redirect logic is consistent across
 * App (ProtectedRoute, DefaultRedirect), TeachingPage, and LoginPage.
 */
import type { CurriculumType, UserProfile } from '../types';

export interface OnboardingState {
  onboardingStep: number;
  curriculumType: CurriculumType | null;
  selectedBoard: string | null;
  selectedGrade: string | null;
  selectedExam: string | null;
  selectedSubject: string | null;
  profile: UserProfile | null;
}

/** True if user has not completed curriculum selection (needs onboarding or mode selection). */
export function needsOnboarding(state: OnboardingState): boolean {
  return (
    state.onboardingStep !== -1 ||
    !state.curriculumType ||
    (state.curriculumType === 'school' && (!state.selectedBoard || !state.selectedGrade)) ||
    (state.curriculumType === 'competitive' && !state.selectedExam) ||
    !state.selectedSubject ||
    !state.profile?.currentTopic
  );
}
