import { describe, it, expect } from 'vitest';
import { needsOnboarding, type OnboardingState } from './onboarding';

function state(overrides: Partial<OnboardingState> = {}): OnboardingState {
  return {
    onboardingStep: -1,
    curriculumType: 'school',
    selectedBoard: 'CBSE',
    selectedGrade: '10',
    selectedExam: null,
    selectedSubject: 'Mathematics',
    profile: { currentTopic: 'algebra-basics' } as OnboardingState['profile'],
    ...overrides,
  };
}

describe('needsOnboarding', () => {
  it('returns false when all fields are set (school)', () => {
    expect(needsOnboarding(state())).toBe(false);
  });

  it('returns true when onboardingStep is not -1', () => {
    expect(needsOnboarding(state({ onboardingStep: 0 }))).toBe(true);
  });

  it('returns true when curriculumType is null', () => {
    expect(needsOnboarding(state({ curriculumType: null }))).toBe(true);
  });

  it('returns true when school but missing board or grade', () => {
    expect(needsOnboarding(state({ selectedBoard: null }))).toBe(true);
    expect(needsOnboarding(state({ selectedGrade: null }))).toBe(true);
  });

  it('returns true when competitive but missing exam', () => {
    expect(needsOnboarding(state({ curriculumType: 'competitive', selectedExam: null }))).toBe(true);
  });

  it('returns true when subject or currentTopic missing', () => {
    expect(needsOnboarding(state({ selectedSubject: null }))).toBe(true);
    expect(needsOnboarding(state({ profile: null }))).toBe(true);
    expect(needsOnboarding(state({ profile: { currentTopic: undefined } as OnboardingState['profile'] }))).toBe(true);
  });

  it('returns false when competitive and exam set', () => {
    expect(needsOnboarding(state({
      curriculumType: 'competitive',
      selectedBoard: null,
      selectedGrade: null,
      selectedExam: 'JEE Main',
      selectedSubject: 'Physics',
      profile: { currentTopic: 'mechanics' } as OnboardingState['profile'],
    }))).toBe(false);
  });
});
