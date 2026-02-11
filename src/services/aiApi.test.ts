import { describe, it, expect } from 'vitest';
import { generateContent } from './aiApi';

describe('aiApi', () => {
  it('generateContent rejects empty prompt with validation error', async () => {
    await expect(generateContent('')).rejects.toThrow('Prompt cannot be empty');
  });

  it('generateContent rejects whitespace-only prompt', async () => {
    await expect(generateContent('   ')).rejects.toThrow('Prompt cannot be empty');
  });
});
