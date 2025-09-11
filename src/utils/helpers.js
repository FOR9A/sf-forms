// Helper functions for country and city data
export const getCountryList = async ({ lang = 'en' } = {}) => {
  try {
    // This should be replaced with your actual API endpoint
    const response = await fetch(`/api/countries?lang=${lang}`);
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

export const getCityList = async ({ country, lang = 'en' } = {}) => {
  try {
    // This should be replaced with your actual API endpoint
    const response = await fetch(`/api/cities?country=${country}&lang=${lang}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

// Theme configuration helpers
export const getCurrentTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') || 'souqfann';
  }
  return 'souqfann';
};

export const themeColorOverrides = {
  souqfann: {
    primaryColor: '#007bff',
    primaryColorDark: '#0056b3',
    accentColor: '#28a745'
  },
  visitpetra: {
    primaryColor: '#dc3545',
    primaryColorDark: '#c82333',
    accentColor: '#ffc107'
  },
  'khairat-aldar': {
    primaryColor: '#6f42c1',
    primaryColorDark: '#5a32a3',
    accentColor: '#20c997'
  }
};

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value, questionType) => {
  switch (questionType) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'number':
    case 'date':
    case 'time':
      return !!(value && value.trim() !== '');
    case 'select':
    case 'radio':
    case 'country':
    case 'city':
      return value !== null && value !== undefined && value !== '';
    case 'checkbox':
      return Array.isArray(value) && value.length > 0;
    case 'file':
      return !!(value && (value.filePath || value.file));
    default:
      return !!(value && value.trim() !== '');
  }
};

// Date formatting helpers
export const formatDate = (dateString, locale = 'en') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Form data processing helpers
export const processFormData = (formAnswers, questions) => {
  const processedData = {};
  
  Object.entries(formAnswers).forEach(([questionId, answerData]) => {
    if (questionId.startsWith('_')) return; // Skip internal properties
    
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    processedData[questionId] = {
      questionType: question.type,
      value: answerData.value,
      ...(answerData.selectedOption && { selectedOption: answerData.selectedOption }),
      ...(answerData.selectedOptions && { selectedOptions: answerData.selectedOptions }),
      ...(answerData.filePath && { filePath: answerData.filePath }),
      ...(answerData.fileName && { fileName: answerData.fileName }),
    };
  });
  
  return processedData;
};

// Localization helpers
export const getLocalizedText = (textObject, locale, fallback = '') => {
  if (!textObject) return fallback;
  
  if (typeof textObject === 'string') return textObject;
  
  if (locale === 'ar') {
    return textObject.ar || textObject.en || fallback;
  }
  
  return textObject[locale] || textObject.en || fallback;
};
