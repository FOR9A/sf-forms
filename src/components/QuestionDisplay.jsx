"use client";
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getCountryList, getCityList } from '../utils/helpers.js';
import styles from '../styles/form-display.module.scss';

// Question type definitions
export const QUESTION_TYPES = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Paragraph Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Radio Buttons" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "file", label: "File Upload" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "country", label: "Country" },
  { value: "city", label: "City" },
  { value: "header", label: "Header" },
  { value: "subheader", label: "Subheader" },
  { value: "paragraph", label: "Paragraph" },
];

// Component to render different question types
export const QuestionDisplay = ({ 
  question, 
  locale, 
  editMode, 
  formAnswers, 
  onInputChange, 
  onCheckboxChange, 
  validationErrors, 
  onCountryChange, 
  t,
  cssClasses = {},
  uploadEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
}) => {
  const [countries, setCountries] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [country, setCountry] = useState('');
  const [countryId, setCountryId] = useState(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Set local country state when form answers change for country questions
  useEffect(() => {
    if (question.type === 'country' && formAnswers[question.id]?.selectedOption) {
      const selectedCountryId = formAnswers[question.id].selectedOption;
      const selectedCountry = countries.find(country => country.id === selectedCountryId);
      if (selectedCountry) {
        setCountry(selectedCountry.value);
        setCountryId(selectedCountry.id);
      }
    }
  }, [question.type, formAnswers, countries]);

  // Fetch cities when country is selected - for city questions only
  useEffect(() => {
    const fetchCities = async () => {
      if (question.type === 'city') {
        let selectedCountryId = null;

        // Look for country questions in the form and get the selected country ID
        Object.entries(formAnswers).forEach(([questionId, answerData]) => {
          const questionObj = formAnswers._questions?.find(q => q.id === questionId);
          if (questionObj?.type === 'country' && answerData.selectedOption) {
            selectedCountryId = answerData.selectedOption;
          }
        });

        // Also check the global selectedCountryId if set
        if (!selectedCountryId && formAnswers.selectedCountryId) {
          selectedCountryId = formAnswers.selectedCountryId;
        }

        if (selectedCountryId && countries.length > 0) {
          setLoadingCities(true);
          try {
            const selectedCountry = countries.find(c => c.id === selectedCountryId);
            if (selectedCountry) {
              const cities = await getCityList({ country: selectedCountry.value, lang: locale });
              setCityList(Array.isArray(cities) ? cities : []);
            } else {
              setCityList([]);
            }
          } catch (error) {
            console.error('Error fetching cities:', error);
            setCityList([]);
          } finally {
            setLoadingCities(false);
          }
        } else {
          setCityList([]);
          setLoadingCities(false);
        }
      }
    };

    fetchCities();
  }, [formAnswers.selectedCountryId, question.type, locale, countries]);

  // Fetch all countries for country questions to help city questions
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryData = await getCountryList({ lang: locale });
        setCountries(Array.isArray(countryData) ? countryData : []);
      } catch (error) {
        setCountries([]);
      }
    };

    if (question.type === 'country' || question.type === 'city') {
      fetchCountries();
    }
  }, [question.type, locale]);

  // Get the question label in the current locale
  const label = locale === 'ar'
    ? (question.label?.ar || question.label?.en || question.name)
    : (question.label?.[locale] || question.label?.en || question.name);

  // Get the placeholder in the current locale
  const placeholder = locale === 'ar'
    ? (question.placeholder?.ar || question.placeholder?.en)
    : (question.placeholder?.[locale] || question.placeholder?.en);

  // Get the answer data for this question
  const answerData = formAnswers[question.id] || { value: '', selectedOptions: [], selectedOption: null };

  // Helper function to get option label
  const getOptionLabel = (option) => {
    if (locale === 'ar') {
      return option.label?.ar || option.label?.en || option.key || option.id;
    }
    return option.label?.[locale] || option.label?.en || option.key || option.id;
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploadingFile(true);
    setUploadProgress(0);

    try {
      const operations = JSON.stringify({
        query: "mutation uploadFile($input: UploadFile!) { uploadFile(input: $input) }",
        variables: { input: { file: null } }
      });

      const map = JSON.stringify({ file: ["variables.input.file"] });

      const formData = new FormData();
      formData.append("operations", operations);
      formData.append("map", map);
      formData.append("file", file);

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'LANG': locale || 'en',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result?.data?.uploadFile) {
        const fileUrl = result.data.uploadFile;
        onInputChange(question.id, fileUrl, 'filePath');
        onInputChange(question.id, file.name, 'fileName');
        onInputChange(question.id, fileUrl, 'value');
      } else if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Unknown upload error');
      }
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploadingFile(false);
      setUploadProgress(100);
    }
  };

  // Format date value
  const formatDateValue = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }

    return dateStr;
  };

  // Get default date value
  const getDefaultDateValue = () => {
    if (answerData.value) return formatDateValue(answerData.value);

    if (question.settings) {
      try {
        const settings = typeof question.settings === 'string' ?
          JSON.parse(question.settings) : question.settings;

        if (settings.defaultValue === 'today') {
          const today = new Date();
          return today.toISOString().split('T')[0];
        } else if (settings.defaultValue) {
          return formatDateValue(settings.defaultValue);
        }
      } catch (e) {
        console.error('Error parsing question settings:', e);
      }
    }

    return '';
  };

  // Render based on question type
  switch (question.type) {
    case 'header':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <h1>{label}</h1>
        </div>
      );

    case 'subheader':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <h2>{label}</h2>
        </div>
      );

    case 'paragraph':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <p>{label}</p>
        </div>
      );

    case 'text':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <input
              type="text"
              className={`${cssClasses.inputField || styles['sf-input-field']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}
              value={answerData.value || ''}
              onChange={(e) => onInputChange(question.id, e.target.value)}
              placeholder={placeholder}
            />
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>{answerData.value || '-'}</div>
          )}
          {validationErrors[question.id] && (
            <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <>
              <textarea
                className={`${cssClasses.inputField || styles['sf-input-field']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}
                value={answerData.value || ''}
                onChange={(e) => onInputChange(question.id, e.target.value)}
                placeholder={placeholder}
                rows={5}
              />
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>
              {answerData.value ? <div>{answerData.value}</div> : '-'}
            </div>
          )}
        </div>
      );

    case 'email':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <>
              <input
                type="email"
                className={`${cssClasses.inputField || styles['sf-input-field']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}
                value={answerData.value || ''}
                onChange={(e) => onInputChange(question.id, e.target.value)}
                placeholder={placeholder}
              />
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>
              {answerData.value ? (
                <a href={`mailto:${answerData.value}`}>{answerData.value}</a>
              ) : '-'}
            </div>
          )}
        </div>
      );

    case 'number':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <>
              <input
                type="number"
                className={`${cssClasses.inputField || styles['sf-input-field']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}
                value={answerData.value || ''}
                onChange={(e) => onInputChange(question.id, e.target.value)}
                placeholder={placeholder}
              />
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>{answerData.value || '-'}</div>
          )}
        </div>
      );

    case 'select':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <>
              <select
                className={`${cssClasses.inputField || styles['sf-input-field']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}
                value={answerData.selectedOption || ''}
                onChange={(e) => onInputChange(question.id, e.target.value, 'selectedOption')}
              >
                <option value="">{placeholder}</option>
                {question.options?.map(option => (
                  <option key={option.id} value={option.id}>
                    {getOptionLabel(option)}
                  </option>
                ))}
              </select>
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>
              {answerData.selectedOption ? (
                (() => {
                  const option = question.options?.find(opt => opt.id === answerData.selectedOption);
                  if (!option) return '-';
                  if (locale === 'ar') {
                    return option.label?.ar || option.label?.en || option.key || '-';
                  }
                  return option.label?.[locale] || option.label?.en || option.key || '-';
                })()
              ) : '-'}
            </div>
          )}
        </div>
      );

    case 'radio':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <>
              <div className={`${cssClasses.radioGroup || styles['sf-radio-group']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}>
                {question.options?.map(option => (
                  <div key={option.id} className={cssClasses.radioOption || styles['sf-radio-option']}>
                    <input
                      type="radio"
                      id={`option-${option.id}`}
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={answerData.selectedOption === option.id}
                      onChange={() => onInputChange(question.id, option.id, 'selectedOption')}
                    />
                    <label htmlFor={`option-${option.id}`}>{getOptionLabel(option)}</label>
                  </div>
                ))}
              </div>
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>
              {answerData.selectedOption ? (
                (() => {
                  const option = question.options?.find(opt => opt.id === answerData.selectedOption);
                  if (!option) return '-';
                  if (locale === 'ar') {
                    return option.label?.ar || option.label?.en || option.key || '-';
                  }
                  return option.label?.[locale] || option.label?.en || option.key || '-';
                })()
              ) : '-'}
            </div>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <>
              <div className={`${cssClasses.checkboxGroup || styles['sf-checkbox-group']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}>
                {question.options?.map(option => (
                  <div key={option.id} className={cssClasses.checkboxOption || styles['sf-checkbox-option']}>
                    <input
                      type="checkbox"
                      id={`option-${option.id}`}
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={answerData.selectedOptions?.includes(option.id) || false}
                      onChange={(e) => onCheckboxChange(question.id, option.id, e.target.checked)}
                      className={cssClasses.checkboxInput || styles['sf-checkbox-input']}
                    />
                    <label htmlFor={`option-${option.id}`}>{getOptionLabel(option)}</label>
                  </div>
                ))}
              </div>
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>
              {answerData.selectedOptions?.length ? (
                <ul className={cssClasses.optionsList || styles['sf-options-list']}>
                  {answerData.selectedOptions.map(optionId => {
                    const option = question.options?.find(opt => opt.id === optionId);
                    return option ? (
                      <li key={optionId}>{getOptionLabel(option)}</li>
                    ) : null;
                  })}
                </ul>
              ) : '-'}
            </div>
          )}
        </div>
      );

    case 'file':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <>
              <div className={`${cssClasses.fileInputWrapper || styles['sf-file-input-wrapper']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}>
                <input
                  type="file"
                  className={cssClasses.fileInput || styles['sf-file-input']}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  disabled={uploadingFile}
                />
                {uploadingFile && (
                  <div className={cssClasses.uploadingFile || styles['sf-uploading-file']}>
                    Uploading file... {uploadProgress > 0 ? `${uploadProgress}%` : ''}
                  </div>
                )}
                {answerData.filePath && (
                  <div className={cssClasses.uploadedFile || styles['sf-uploaded-file']}>
                    <a href={answerData.filePath} target="_blank" rel="noopener noreferrer" className={cssClasses.fileLink || styles['sf-file-link']}>
                      {'View uploaded -> ' + answerData.fileName || 'View uploaded file'}
                    </a>
                  </div>
                )}
              </div>
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>
              {answerData.filePath ? (
                <a href={answerData.filePath} target="_blank" rel="noopener noreferrer" className={cssClasses.fileLink || styles['sf-file-link']}>
                  {answerData.fileName || 'Download File'}
                </a>
              ) : '-'}
            </div>
          )}
        </div>
      );

    case 'date':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <>
              <input
                type="date"
                className={`${cssClasses.inputField || styles['sf-input-field']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}
                value={answerData.value || getDefaultDateValue()}
                onChange={(e) => onInputChange(question.id, e.target.value)}
              />
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>
              {answerData.value ? formatDateValue(answerData.value) : '-'}
            </div>
          )}
        </div>
      );

    case 'time':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <>
              <input
                type="time"
                className={`${cssClasses.inputField || styles['sf-input-field']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}
                value={answerData.value || ''}
                onChange={(e) => onInputChange(question.id, e.target.value)}
              />
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>{answerData.value || '-'}</div>
          )}
        </div>
      );

    case 'country':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label htmlFor="country" style={{ marginBottom: '10px' }}>
            {label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}
          </label>
          {editMode ? (
            <>
              <select
                className={`${cssClasses.inputField || styles['sf-input-field']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}
                value={country}
                onChange={(event) => {
                  const selectedCountryValue = event.target.value;
                  setCountry(selectedCountryValue);

                  const countryObject = countries.find((obj) => {
                    return obj.value === selectedCountryValue;
                  });

                  if (countryObject) {
                    setCountryId(countryObject.id);
                    onInputChange(question.id, countryObject.id, 'selectedOption');
                    onInputChange(question.id, countryObject.label, 'value');
                    onInputChange('selectedCountryId', countryObject.id);
                    onInputChange('country_id', countryObject.id);

                    if (onCountryChange) {
                      onCountryChange(countryObject.id, countryObject.value);
                    }
                  }
                }}
              >
                <option value="" defaultValue={true} disabled hidden>
                  {placeholder}
                </option>
                {countries.map((country, i) => (
                  <option
                    key={`${country.label}${i}`}
                    value={country.value}
                    name={country.value}
                  >
                    {country.label}
                  </option>
                ))}
              </select>
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>
              {answerData.value || '-'}
            </div>
          )}
        </div>
      );

    case 'city':
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label htmlFor="city" style={{ marginBottom: '10px' }}>
            {label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}
          </label>
          {editMode ? (
            <>
              <select
                className={`${cssClasses.inputField || styles['sf-input-field']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}
                value={answerData.selectedOption || ''}
                onChange={(e) => {
                  const selectedCityId = e.target.value;

                  if (selectedCityId) {
                    let selectedCity = cityList.find(city => city.id === selectedCityId);
                    if (!selectedCity) {
                      selectedCity = cityList.find(city => String(city.id) === String(selectedCityId));
                    }

                    if (selectedCity) {
                      onInputChange(question.id, selectedCity.id, 'selectedOption');
                      onInputChange(question.id, selectedCity.label, 'value');
                      onInputChange(question.id, selectedCity.id, 'value_entity_id');
                    }
                  } else {
                    onInputChange(question.id, null, 'selectedOption');
                    onInputChange(question.id, '', 'value');
                    onInputChange(question.id, null, 'value_entity_id');
                  }
                }}
                disabled={loadingCities}
              >
                <option value="" defaultValue={true}>
                  {loadingCities ? t('loading-cities') : placeholder}
                </option>
                {!loadingCities && cityList.length > 0 ? (
                  cityList.map((city, i) => (
                    <option key={`${city.id}${i}`} value={String(city.id)}>
                      {city.label}
                    </option>
                  ))
                ) : null}
              </select>
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
              {loadingCities && (
                <div className={cssClasses.helperText || styles['sf-helper-text']}>{t('loading-cities')}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>
              {answerData.value || '-'}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className={cssClasses.formField || styles['sf-form-field']}>
          <label>{label}{question.required && <span className={cssClasses.required || styles['sf-required']}>*</span>}</label>
          {editMode ? (
            <>
              <input
                type="text"
                className={`${cssClasses.inputField || styles['sf-input-field']} ${validationErrors[question.id] ? (cssClasses.inputError || styles['sf-input-error']) : ''}`}
                value={answerData.value || ''}
                onChange={(e) => onInputChange(question.id, e.target.value)}
                placeholder={placeholder}
              />
              {validationErrors[question.id] && (
                <div className={cssClasses.errorMessage || styles['sf-error-message']}>{validationErrors[question.id]}</div>
              )}
            </>
          ) : (
            <div className={cssClasses.answerValue || styles['sf-answer-value']}>{answerData.value || '-'}</div>
          )}
        </div>
      );
  }
};

export default QuestionDisplay;
