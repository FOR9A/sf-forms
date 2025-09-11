import { ReactNode } from 'react';

export interface QuestionOption {
  id: string;
  key: string;
  value: string;
  label: {
    en?: string;
    ar?: string;
    [key: string]: string;
  };
}

export interface QuestionCondition {
  id: string;
  source_question_id: string;
  comparator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
  action: 'show' | 'hide';
}

export interface FormAnswer {
  id: string;
  value_text?: string;
  value_number?: number;
  value_date?: string;
  value_entity_id?: string;
  file_path?: string;
  selected_options?: QuestionOption[];
}

export interface Question {
  id: string;
  name: string;
  text: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'radio' | 'checkbox' | 'file' | 'date' | 'time' | 'country' | 'city' | 'header' | 'subheader' | 'paragraph';
  required: boolean;
  is_user_visible: boolean;
  has_condition: boolean;
  label: {
    en?: string;
    ar?: string;
    [key: string]: string;
  };
  placeholder?: {
    en?: string;
    ar?: string;
    [key: string]: string;
  };
  error_message?: {
    en?: string;
    ar?: string;
    [key: string]: string;
  };
  settings?: string | object;
  options?: QuestionOption[];
  conditionsTarget?: QuestionCondition[];
  answer?: FormAnswer;
}

export interface FormData {
  id: string;
  name: string;
  description?: string;
  status: string;
  questions: Question[];
}

export interface FormAnswerData {
  value: string;
  selectedOptions?: string[];
  selectedOption?: string | null;
  filePath?: string;
  fileName?: string;
  file?: File | null;
  value_entity_id?: string | null;
}

export interface FormAnswers {
  [questionId: string]: FormAnswerData;
  _questions?: Question[];
  selectedCountryId?: string;
  country_id?: string;
}

export interface ValidationErrors {
  [questionId: string]: string;
}

export interface CSSClasses {
  formContainer?: string;
  form?: string;
  formRows?: string;
  formRow?: string;
  formField?: string;
  inputField?: string;
  inputError?: string;
  required?: string;
  answerValue?: string;
  radioGroup?: string;
  radioOption?: string;
  checkboxGroup?: string;
  checkboxOption?: string;
  fileInputWrapper?: string;
  fileInput?: string;
  uploadingFile?: string;
  uploadedFile?: string;
  fileLink?: string;
  optionsList?: string;
  errorMessage?: string;
  helperText?: string;
  submitButton?: string;
  saveStatus?: string;
  loadingContainer?: string;
  errorContainer?: string;
  noData?: string;
}

export interface ThemeConfig {
  theme?: string;
  colors?: {
    [property: string]: string;
  };
}

export interface CustomValidation {
  [questionId: string]: (answerData: FormAnswerData, allAnswers: FormAnswers) => string | null;
}

export interface FormDisplayProps {
  formId?: string;
  entityId?: string;
  cssClasses?: CSSClasses;
  themeConfig?: ThemeConfig;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: any) => void;
  customValidation?: CustomValidation;
  readOnly?: boolean;
}

export interface QuestionDisplayProps {
  question: Question;
  locale: string;
  editMode: boolean;
  formAnswers: FormAnswers;
  onInputChange: (questionId: string, value: any, field?: string) => void;
  onCheckboxChange: (questionId: string, optionId: string, isChecked: boolean) => void;
  validationErrors: ValidationErrors;
  onCountryChange?: (countryId: string, countryValue: string) => void;
  t: (key: string) => string;
  cssClasses?: CSSClasses;
  uploadEndpoint?: string;
}

export interface Country {
  id: string;
  value: string;
  label: string;
}

export interface City {
  id: string;
  value: string;
  label: string;
}

export interface GetCountryListParams {
  lang?: string;
}

export interface GetCityListParams {
  country: string;
  lang?: string;
}

export declare const QUESTION_TYPES: Array<{
  value: string;
  label: string;
}>;

export declare function FormDisplay(props: FormDisplayProps): JSX.Element;
export declare function QuestionDisplay(props: QuestionDisplayProps): JSX.Element;

export declare function getCountryList(params?: GetCountryListParams): Promise<Country[]>;
export declare function getCityList(params: GetCityListParams): Promise<City[]>;
export declare function getCurrentTheme(): string;
export declare function validateEmail(email: string): boolean;
export declare function validateRequired(value: any, questionType: string): boolean;
export declare function formatDate(dateString: string, locale?: string): string;
export declare function processFormData(formAnswers: FormAnswers, questions: Question[]): object;
export declare function getLocalizedText(textObject: any, locale: string, fallback?: string): string;

export declare const themeColorOverrides: {
  [themeName: string]: {
    primaryColor: string;
    primaryColorDark: string;
    accentColor: string;
  };
};
