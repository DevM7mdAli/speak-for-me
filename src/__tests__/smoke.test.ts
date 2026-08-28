import { SPEECH_LOCALES } from '@/i18n';

describe('test runner', () => {
  it('compiles typescript and resolves the @ alias', () => {
    expect(SPEECH_LOCALES.ar).toBe('ar-SA');
  });
});
