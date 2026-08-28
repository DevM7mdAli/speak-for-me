import { phraseTextFor } from '../arabicForm';

const phrase = (over: Partial<Parameters<typeof phraseTextFor>[0]> = {}) => ({
  text: { en: 'I am tired', ar: 'أنا متعب', arFeminine: 'أنا متعبة' },
  ...over,
});

/**
 * Arabic adjectives agree with the speaker's gender, so a single stored
 * string is wrong for roughly half of patients. The caregiver sets the
 * form once; phrases that do not vary are unaffected.
 */
describe('phraseTextFor', () => {
  it('uses the masculine form by default', () => {
    expect(phraseTextFor(phrase(), 'ar', 'masculine')).toBe('أنا متعب');
  });

  it('uses the feminine form when the caregiver has set it', () => {
    expect(phraseTextFor(phrase(), 'ar', 'feminine')).toBe('أنا متعبة');
  });

  it('falls back to the masculine form when no feminine variant exists', () => {
    const noVariant = phrase({ text: { en: 'I need water', ar: 'أحتاج ماء' } });
    expect(phraseTextFor(noVariant, 'ar', 'feminine')).toBe('أحتاج ماء');
  });

  it('never applies the Arabic form to English', () => {
    expect(phraseTextFor(phrase(), 'en', 'feminine')).toBe('I am tired');
  });

  it('ignores an empty feminine variant rather than speaking nothing', () => {
    const blank = phrase({ text: { en: 'x', ar: 'أنا متعب', arFeminine: '   ' } });
    expect(phraseTextFor(blank, 'ar', 'feminine')).toBe('أنا متعب');
  });
});
