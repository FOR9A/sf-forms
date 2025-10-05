"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { useQuery, useMutation, gql } from '@apollo/client';
import QuestionDisplay from './QuestionDisplay.jsx';
import { GET_FORM_WITH_ANSWERS, ADD_UPDATE_BULK_FORM_ANSWERS } from '../graphql/queries.js';
import styles from '../styles/form-display.module.scss';

// GraphQL mutation imported from queries.js

export default function FormDisplay({ 
  formId, 
  entityId, 
  submissionId,
  cssClasses = {}, 
  themeConfig = {},
  onSaveSuccess,
  onSaveError,
  customValidation,
  readOnly = false ,
  token,
  locale,
  session
}) {
  const router = useRouter();
  
  // Use props or fallback to router query
  const id = formId;
  const entity_id = entityId;
  const submission_id = submissionId;
  
  const [theme, setTheme] = useState('souqfann');
  const [editMode, setEditMode] = useState(!readOnly);
  const [formData, setFormData] = useState(null);
  const [formAnswers, setFormAnswers] = useState({});
  const [saveStatus, setSaveStatus] = useState(null);
  const [visibleQuestions, setVisibleQuestions] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Apply theme configuration
  useEffect(() => {
    if (themeConfig.theme) {
      setTheme(themeConfig.theme);
    }
    
    if (themeConfig.colors && typeof document !== 'undefined') {
      Object.entries(themeConfig.colors).forEach(([property, value]) => {
        document.documentElement.style.setProperty(`--${property}`, value);
      });
    }
  }, [themeConfig]);

  // GraphQL mutation hooks
  const [addUpdateBulkFormAnswers, { loading: saveLoading }] = useMutation(ADD_UPDATE_BULK_FORM_ANSWERS, {
    onCompleted: (data) => {
      console.log('Bulk form answers saved:', data);
      setSaveStatus('success');
      if (onSaveSuccess) onSaveSuccess(data);
      setTimeout(() => setSaveStatus(null), 3000);
    },
    onError: (error) => {
      console.error('Error saving bulk form answers:', error);
      setSaveStatus('error');
      if (onSaveError) onSaveError(error);
      setTimeout(() => setSaveStatus(null), 5000);
    },
    context: {
      headers: {
        "X-Auth-Token": token || ""
      },
    }
  });


  // Fetch form data with answers
  const { loading, error, data, refetch } = useQuery(GET_FORM_WITH_ANSWERS, {
    variables: { form_id: id, submission_id: submission_id, preview: false },
    
    onCompleted: (data) => {
      console.log('GET_FORM_WITH_ANSWERS completed successfully:', data);
      if (data?.getFormWithAnswers) {
        setFormData(data.getFormWithAnswers);
        initializeFormAnswers(data.getFormWithAnswers);
      }
    },
    onError: (error) => {
      console.error('GET_FORM_WITH_ANSWERS error:', error);
    },
    context: {
      headers: {
        "X-Auth-Token": token || ""
      },
    },
  });
  
  // Monitor query conditions and refetch when they become available
  useEffect(() => {
    console.log('FormDisplay Debug - useEffect triggered with conditions:', {
      hasSession: !!session,
      hasToken: !!token,
      hasId: !!id,
      hasEntityId: !!entity_id,
      canExecuteQuery: !!(token && id && entity_id)
    });

    if (token && id && entity_id) {
      console.log('FormDisplay Debug - Attempting to refetch query...');
      refetch().then((result) => {
        console.log('FormDisplay Debug - Refetch result:', result);
      }).catch((error) => {
        console.error('FormDisplay Debug - Refetch error:', error);
      });
    }
  }, [token, id, entity_id, refetch]);

  // Re-evaluate visible questions when form answers change
  useEffect(() => {
    if (formData && formData.questions && formAnswers && Object.keys(formAnswers).length > 0) {
      const updatedVisibleQuestions = formData.questions
        .filter(question => evaluateConditions(question, formAnswers, formData.questions))
        .map(q => q.id);
      
      setVisibleQuestions(updatedVisibleQuestions);
    }
  }, [formAnswers, formData]);

  // Initialize form answers from API data is loaded
  const initializeFormAnswers = (formData) => {
    const initialAnswers = {};

    formData.questions.forEach(question => {
      if (question.answer) {
        const answer = question.answer;

        if (question.type === 'checkbox' && answer.selected_options?.length > 0) {
          initialAnswers[question.id] = {
            value: answer.value_text || '',
            selectedOptions: answer.selected_options.map(opt => opt.id)
          };
        } else if (question.type === 'radio' || question.type === 'select') {
          initialAnswers[question.id] = {
            value: answer.value_text || '',
            selectedOption: answer.selected_options && answer.selected_options.length > 0 ?
              answer.selected_options[0].id : null
          };
        } else if (question.type === 'file') {
          initialAnswers[question.id] = {
            value: answer.value_text || '',
            filePath: answer.file_path || '',
            fileName: answer.file_path ? answer.file_path.split('/').pop() : ''
          };
        } else if (question.type === 'number') {
          initialAnswers[question.id] = {
            value: answer.value_number?.toString() || answer.value_text || ''
          };
        } else if (question.type === 'date') {
          let formattedDate = '';
          if (answer.value_date) {
            formattedDate = answer.value_date.split(' ')[0];
          }
          initialAnswers[question.id] = {
            value: formattedDate || ''
          };
        } else if (question.type === 'country') {
          initialAnswers[question.id] = {
            value: answer.value_text || '',
            selectedOption: answer.value_entity_id || null,
            value_entity_id: answer.value_entity_id || null
          };
        } else if (question.type === 'city') {
          initialAnswers[question.id] = {
            value: answer.value_text || '',
            selectedOption: answer.value_entity_id || null,
            value_entity_id: answer.value_entity_id || null
          };
        } else {
          initialAnswers[question.id] = {
            value: answer.value_text || ''
          };
        }
      } else {
        // No answer yet, initialize empty
        if (question.type === 'checkbox') {
          initialAnswers[question.id] = { value: '', selectedOptions: [] };
        } else if (question.type === 'radio' || question.type === 'select') {
          initialAnswers[question.id] = { value: '', selectedOption: null };
        } else if (question.type === 'file') {
          initialAnswers[question.id] = { value: '', file: null, filePath: '', fileName: '' };
        } else if (question.type === 'country') {
          initialAnswers[question.id] = { value: '', selectedOption: null, value_entity_id: null };
        } else if (question.type === 'city') {
          initialAnswers[question.id] = { value: '', selectedOption: null, value_entity_id: null };
        } else {
          initialAnswers[question.id] = { value: '' };
        }
      }
    });

    initialAnswers._questions = formData.questions;
    setFormAnswers(initialAnswers);

    // Initialize visible questions based on conditions
    const initialVisibleQuestions = formData.questions
      .filter(question => evaluateConditions(question, initialAnswers, formData.questions))
      .map(q => q.id);
    
    setVisibleQuestions(initialVisibleQuestions);
  };

  // Evaluate conditions for a question
  const evaluateConditions = (question, answers, questions) => {
    if (!question.has_condition || !question.conditionsTarget || question.conditionsTarget.length === 0) {
      return true;
    }

    for (const condition of question.conditionsTarget) {
      const sourceQuestionId = condition.source_question_id;
      const sourceAnswer = answers[sourceQuestionId];
      const sourceQuestion = questions.find(q => q.id === sourceQuestionId);

      if (!sourceQuestion || !sourceAnswer) continue;

      let actualValue;
      if (sourceQuestion.type === 'radio' || sourceQuestion.type === 'select') {
        const selectedOption = sourceQuestion.options?.find(opt => opt.id === sourceAnswer.selectedOption);
        actualValue = selectedOption?.key || '';
      } else if (sourceQuestion.type === 'checkbox') {
        const selectedOptions = sourceAnswer.selectedOptions || [];
        const selectedKeys = selectedOptions.map(optId => {
          const option = sourceQuestion.options?.find(opt => opt.id === optId);
          return option?.key || '';
        });
        actualValue = selectedKeys.join(',');
      } else if (sourceQuestion.type === 'country' || sourceQuestion.type === 'city') {
        // For country/city fields, check value_entity_id first, then value_text
        actualValue = sourceAnswer.value_entity_id;
      } else {
        actualValue = sourceAnswer.value || '';
      }

      const conditionValue = condition.value;
      const comparator = condition.comparator;
      const action = condition.action;

      let conditionMet = false;

      switch (comparator) {
        case 'equals':
          conditionMet = actualValue === conditionValue;
          break;
        case 'not_equals':
          conditionMet = actualValue !== conditionValue;
          break;
        case 'contains':
          conditionMet = actualValue.includes(conditionValue);
          break;
        case 'not_contains':
          conditionMet = !actualValue.includes(conditionValue);
          break;
        case 'greater_than':
          conditionMet = parseFloat(actualValue) > parseFloat(conditionValue);
          break;
        case 'less_than':
          conditionMet = parseFloat(actualValue) < parseFloat(conditionValue);
          break;
        case 'is_empty':
          conditionMet = !actualValue || actualValue === '' || 
                        (Array.isArray(actualValue) && actualValue.length === 0);
          break;
        case 'is_not_empty':
          conditionMet = actualValue && actualValue !== '' && actualValue !== null && actualValue !== undefined &&
                        (!Array.isArray(actualValue) || actualValue.length > 0);
          break;
        default:
          conditionMet = false;
      }

      if (action === 'show' && !conditionMet) return false;
      if (action === 'hide' && conditionMet) return false;
    }

    return true;
  };

  // Handle country changes
  const onCountryChange = (countryId, countryValue) => {
    setFormAnswers(prev => {
      const updatedAnswers = { ...prev };

      if (formData && formData.questions) {
        formData.questions.forEach(question => {
          if (question.type === 'city') {
            updatedAnswers[question.id] = {
              ...updatedAnswers[question.id],
              selectedOption: null,
              value: '',
              value_entity_id: null
            };
          }
        });
      }

      updatedAnswers._questions = formData.questions;
      return updatedAnswers;
    });
  };

  // Handle input changes
  const onInputChange = (questionId, value, field = 'value') => {
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }

    setFormAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  // Handle checkbox changes
  const onCheckboxChange = (questionId, optionId, isChecked) => {
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }

    setFormAnswers(prev => {
      const currentOptions = prev[questionId]?.selectedOptions || [];
      let newOptions;

      if (isChecked) {
        newOptions = [...currentOptions, optionId];
      } else {
        newOptions = currentOptions.filter(id => id !== optionId);
      }

      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          selectedOptions: newOptions
        }
      };
    });
  };

  // Update visible questions when form answers change
  useEffect(() => {
    if (formData && formData.questions) {
      const visibleQuestionIds = formData.questions
        .filter(question => {
          if (question.is_user_visible === false) return false;
          return evaluateConditions(question, formAnswers, formData.questions);
        })
        .map(question => question.id);

      setVisibleQuestions(visibleQuestionIds);
    }
  }, [formAnswers, formData]);

  // Validate form
  const validateForm = () => {
    console.log("🔍 validateForm CALLED");
    console.log("📋 formData:", formData);
    console.log("📝 formAnswers:", formAnswers);
    console.log("👁️ visibleQuestions:", visibleQuestions);
    
    const errors = {};
    let isValid = true;

    formData.questions.forEach(question => {
      console.log(`\n--- Validating Question ID: ${question.id} ---`);
      console.log("Question:", question);
      
      if (question.is_user_visible === false) {
        console.log("❌ Skipped: is_user_visible is false");
        return;
      }
      if (!visibleQuestions.includes(question.id)) {
        console.log("❌ Skipped: not in visibleQuestions");
        return;
      }
      if (['header', 'subheader', 'paragraph'].includes(question.type)) {
        console.log("❌ Skipped: display-only type");
        return;
      }

      if (question.required) {
        console.log("✅ Question is required");
        const answer = formAnswers[question.id];
        console.log("Answer:", answer);
        let isEmpty = false;

        switch (question.type) {
          case 'text':
          case 'textarea':
          case 'email':
          case 'number':
          case 'date':
          case 'time':
            isEmpty = !answer.value || answer.value.trim() === '';
            console.log(`isEmpty check (text-based): ${isEmpty}`);
            break;
          case 'select':
          case 'radio':
          case 'country':
          case 'city':
            isEmpty = !answer.selectedOption;
            console.log(`isEmpty check (select-based): ${isEmpty}`);
            break;
          case 'checkbox':
            isEmpty = !answer.selectedOptions || answer.selectedOptions.length === 0;
            console.log(`isEmpty check (checkbox): ${isEmpty}`);
            break;
          case 'file':
            isEmpty = !answer.file && !answer.filePath;
            console.log(`isEmpty check (file): ${isEmpty}`);
            break;
          default:
            isEmpty = !answer.value || answer.value.trim() === '';
            console.log(`isEmpty check (default): ${isEmpty}`);
        }

        if (isEmpty) {
          console.log("⚠️ Field is empty - adding error");
          let errorMessage = "field-required";
          
          if (question.error_message) {
            const customError = locale === 'ar'
              ? (question.error_message.ar || question.error_message.en )
              : (question.error_message[locale] || question.error_message.en );
            
            // Only use custom error if it's not empty
            if (customError && customError.trim() !== '') {
              errorMessage = customError;
            }
          }
          
          errors[question.id] = errorMessage;
          console.log(`Error set: ${errors[question.id]}`);
          isValid = false;
        }
      }

      // Custom validation
      if (customValidation && customValidation[question.id]) {
        console.log("🔧 Running custom validation");
        const customError = customValidation[question.id](formAnswers[question.id], formAnswers);
        if (customError) {
          console.log("⚠️ Custom validation error:", customError);
          errors[question.id] = customError;
          isValid = false;
        }
      }
    });

    console.log("\n📊 VALIDATION RESULTS:");
    console.log("Errors:", errors);
    console.log("isValid:", isValid);
    
    setValidationErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit Called");

    if (!token) {
      console.error('Authentication token not available');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaveStatus('saving');

    try {
      // Prepare bulk answers array
      const answers = [];

      Object.entries(formAnswers).forEach(([questionId, data]) => {
        const question = formData.questions.find(q => q.id === questionId);
        if (!question) return;

        if (question.is_user_visible === false) return;
        if (['header', 'subheader', 'paragraph'].includes(question.type)) return;

        // Determine value type based on question type
        let valueType = 'text';
        if (question.type === 'number') valueType = 'number';
        else if (question.type === 'checkbox' || question.type === 'radio' || question.type === 'select') valueType = 'text'; // Keep as text since we're storing option values
        else if (question.type === 'country') valueType = 'country';
        else if (question.type === 'city') valueType = 'city';
        else if (question.type === 'file') valueType = 'file';
        else if (question.type === 'date') valueType = 'date';
        else if (question.type === 'datetime') valueType = 'datetime';
        else if (question.type === 'boolean') valueType = 'boolean';

        const answerInput = {
          question_id: questionId,
          value_type: valueType
        };

        // Add appropriate value fields based on question type
        if (question.type === 'checkbox') {
          answerInput.selected_option_ids = data.selectedOptions || [];
          answerInput.value_text = data.value || '';
        } else if (question.type === 'radio' || question.type === 'select') {
          answerInput.selected_option_ids = data.selectedOption ? [data.selectedOption] : [];
          answerInput.value_text = data.value || '';
        } else if (question.type === 'country') {
          answerInput.value_text = data.value || '';
          if (data.selectedOption) {
            answerInput.value_entity_id = data.selectedOption;
          }
        } else if (question.type === 'city') {
          answerInput.value_text = data.value || '';
          if (data.value_entity_id) {
            answerInput.value_entity_id = data.value_entity_id;
          }
        } else if (question.type === 'number') {
          answerInput.value_number = parseFloat(data.value) || 0;
          answerInput.value_text = data.value || '';
        } else if (question.type === 'file') {
          answerInput.value_text = data.filePath || data.value || '';
          if (data.filePath) {
            answerInput.file_path = data.filePath;
          }
        } else if (question.type === 'date') {
          const dateValue = data.value;
          if (dateValue && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            answerInput.value_date = dateValue;
            answerInput.value_text = dateValue;
          } else if (dateValue) {
            try {
              const date = new Date(dateValue);
              if (!isNaN(date.getTime())) {
                const formattedDate = date.toISOString().split('T')[0];
                answerInput.value_date = formattedDate;
                answerInput.value_text = formattedDate;
              }
            } catch (e) {
              console.error('Error formatting date:', e);
              answerInput.value_date = dateValue;
              answerInput.value_text = dateValue;
            }
          }
        } else if (question.type === 'boolean') {
          answerInput.value_boolean = Boolean(data.value);
          answerInput.value_text = data.value ? 'true' : 'false';
        } else {
          answerInput.value_text = data.value || '';
        }

        answers.push(answerInput);
      });

      // Prepare bulk mutation input
      const bulkInput = {
        form_id: id,
        submission_id: submission_id,
        entity_id: entity_id || null,
        answers: answers
      };

      console.log('Submitting bulk form answers:', bulkInput);

      // Execute bulk mutation
      const result = await addUpdateBulkFormAnswers({
        variables: {
          input: bulkInput
        }
      });

      console.log('Bulk form submission result:', result);

      if (result.data?.addUpdateBulkFormAnswers?.success) {
        const returnedSubmissionId = result.data.addUpdateBulkFormAnswers.submission_id;
        
        // If we don't have a submission_id in the URL but got one from the API, update the URL
        if (!submission_id && returnedSubmissionId) {
          console.log('Adding submission_id to URL:', returnedSubmissionId);
          
          // Create new URL with submission_id parameter
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('submission_id', returnedSubmissionId);
          
          // Update the URL without causing a page reload
          router.push(currentUrl.pathname + currentUrl.search, undefined, { shallow: true });
        }
        
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        console.error('Bulk form submission failed:', result.data?.addUpdateBulkFormAnswers?.message);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 5000);
      }

    } catch (error) {
      console.error('Error saving bulk form answers:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className={`${cssClasses.loadingContainer || styles['sf-loading-container']}`}>
        <p>loading</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cssClasses.errorContainer || styles['sf-error-container']}`}>
        <h2>error-loading-form</h2>
        <p>{error.message}</p>
      </div>
    );
  }
console.log("formData",formData)
  return (
    <div>
      <div className={`${cssClasses.formContainer || styles['sf-form-container']}`}>
        {formData ? (
          <div className={`${cssClasses.form || styles['sf-form']}`}>
            <form onSubmit={handleSubmit}>
              <div className={`${cssClasses.formRows || styles['sf-form-rows']}`}>
                {formData.questions
                  .filter(question => {
                    if (question.is_user_visible === false) return false;
                    if (visibleQuestions.length === 0) return true;
                    return visibleQuestions.includes(question.id);
                  })
                  .map(question => (
                    <div className={`${cssClasses.formRow || styles['sf-form-row']}`} key={question.id}>
                      <QuestionDisplay
                        question={question}
                        locale={locale}
                        editMode={editMode}
                        formAnswers={formAnswers}
                        onInputChange={onInputChange}
                        onCheckboxChange={onCheckboxChange}
                        validationErrors={validationErrors}
                        onCountryChange={onCountryChange}
                        cssClasses={cssClasses}
                      />
                    </div>
                  ))}
              </div>

              {editMode && (
                <button
                  type="submit"
                  className={`${cssClasses.submitButton || styles['sf-btn-primary']} ${saveLoading ? styles['sf-loading'] : ''}`}
                  disabled={saveLoading}
                >
                  {!saveLoading && <p>save-form</p>}
                </button>
              )}

              {saveStatus && (
                <div className={`${cssClasses.saveStatus || styles['sf-save-status']} ${saveStatus === 'success' ? styles['sf-success'] : saveStatus === 'error' ? styles['sf-error'] : styles['sf-saving']}`}>
                  {saveStatus === 'success' && (
                    <>
                      <span>saved-successfully</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <span>save-error</span>
                  )}
                  {saveStatus === 'saving' && (
                    <>
                      <span>saving</span>
                    </>
                  )}
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className={`${cssClasses.noData || styles['sf-no-data']}`}>
            <p>no-form-data</p>
          </div>
        )}
      </div>
    </div>
  );
}