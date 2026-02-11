import { describe, it, expect } from 'vitest';
import { AI_PROMPT_MAX_LENGTH, AI_PROMPT_MIN_LENGTH } from './featureContracts';

describe('featureContracts', () => {
  it('AI_PROMPT_MAX_LENGTH is a positive number', () => {
    expect(typeof AI_PROMPT_MAX_LENGTH).toBe('number');
    expect(AI_PROMPT_MAX_LENGTH).toBeGreaterThan(0);
  });

  it('AI_PROMPT_MIN_LENGTH is 1', () => {
    expect(AI_PROMPT_MIN_LENGTH).toBe(1);
  });

  it('AI_PROMPT_MAX_LENGTH is greater than AI_PROMPT_MIN_LENGTH', () => {
    expect(AI_PROMPT_MAX_LENGTH).toBeGreaterThan(AI_PROMPT_MIN_LENGTH);
  });
});
