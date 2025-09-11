import {
  validateEmail,
  validateRequired,
  formatDate,
  getLocalizedText,
  processFormData
} from '../utils/helpers';

describe('Helper Functions', () => {
  describe('validateEmail', () => {
    test('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+label@example.org')).toBe(true);
    });

    test('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    test('validates text fields', () => {
      expect(validateRequired('hello', 'text')).toBe(true);
      expect(validateRequired('', 'text')).toBe(false);
      expect(validateRequired('   ', 'text')).toBe(false);
    });

    test('validates select fields', () => {
      expect(validateRequired('option1', 'select')).toBe(true);
      expect(validateRequired('', 'select')).toBe(false);
      expect(validateRequired(null, 'select')).toBe(false);
    });

    test('validates checkbox fields', () => {
      expect(validateRequired(['option1'], 'checkbox')).toBe(true);
      expect(validateRequired([], 'checkbox')).toBe(false);
      expect(validateRequired(null, 'checkbox')).toBe(false);
    });

    test('validates file fields', () => {
      expect(validateRequired({ filePath: '/path/to/file' }, 'file')).toBe(true);
      expect(validateRequired({ file: new File([''], 'test.txt') }, 'file')).toBe(true);
      expect(validateRequired({}, 'file')).toBe(false);
    });
  });

  describe('formatDate', () => {
    test('formats valid dates', () => {
      const result = formatDate('2023-12-25', 'en');
      expect(result).toMatch(/12\/25\/2023|25\/12\/2023/); // Different locales
    });

    test('handles invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date');
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
    });
  });

  describe('getLocalizedText', () => {
    const textObject = {
      en: 'Hello',
      ar: 'مرحبا',
      fr: 'Bonjour'
    };

    test('returns correct locale text', () => {
      expect(getLocalizedText(textObject, 'en')).toBe('Hello');
      expect(getLocalizedText(textObject, 'ar')).toBe('مرحبا');
      expect(getLocalizedText(textObject, 'fr')).toBe('Bonjour');
    });

    test('falls back to English', () => {
      expect(getLocalizedText(textObject, 'de')).toBe('Hello');
    });

    test('returns fallback for missing text', () => {
      expect(getLocalizedText(null, 'en', 'fallback')).toBe('fallback');
      expect(getLocalizedText({}, 'en', 'fallback')).toBe('fallback');
    });

    test('handles string input', () => {
      expect(getLocalizedText('Simple string', 'en')).toBe('Simple string');
    });
  });

  describe('processFormData', () => {
    const mockQuestions = [
      { id: 'q1', type: 'text' },
      { id: 'q2', type: 'select' },
      { id: 'q3', type: 'checkbox' }
    ];

    const mockFormAnswers = {
      q1: { value: 'Answer 1' },
      q2: { value: 'Option A', selectedOption: 'opt1' },
      q3: { value: 'Multiple', selectedOptions: ['opt1', 'opt2'] },
      _questions: mockQuestions
    };

    test('processes form data correctly', () => {
      const result = processFormData(mockFormAnswers, mockQuestions);
      
      expect(result.q1).toEqual({
        questionType: 'text',
        value: 'Answer 1'
      });

      expect(result.q2).toEqual({
        questionType: 'select',
        value: 'Option A',
        selectedOption: 'opt1'
      });

      expect(result.q3).toEqual({
        questionType: 'checkbox',
        value: 'Multiple',
        selectedOptions: ['opt1', 'opt2']
      });
    });

    test('skips internal properties', () => {
      const result = processFormData(mockFormAnswers, mockQuestions);
      expect(result._questions).toBeUndefined();
    });
  });
});
