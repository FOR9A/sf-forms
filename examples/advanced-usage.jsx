import React, { useState } from 'react';
import { FormDisplay } from '@your-org/dynamic-form';

// Advanced usage with custom validation and callbacks
function AdvancedFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Custom validation rules
  const customValidation = {
    'email-question': (answerData, allAnswers) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (answerData.value && !emailRegex.test(answerData.value)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
    'password-question': (answerData) => {
      if (answerData.value && answerData.value.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      if (answerData.value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(answerData.value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return null;
    },
    'confirm-password-question': (answerData, allAnswers) => {
      const passwordAnswer = allAnswers['password-question'];
      if (answerData.value !== passwordAnswer?.value) {
        return 'Passwords do not match';
      }
      return null;
    },
    'phone-question': (answerData) => {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (answerData.value && !phoneRegex.test(answerData.value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    }
  };

  const handleSaveSuccess = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage('Form submitted successfully!');
    
    try {
      // Additional processing after form save
      await processFormSubmission(data);
      
      // Redirect or show success message
      setTimeout(() => {
        window.location.href = '/success';
      }, 2000);
      
    } catch (error) {
      console.error('Post-submission processing failed:', error);
      setSubmitMessage('Form saved but additional processing failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveError = (error) => {
    console.error('Form submission failed:', error);
    setSubmitMessage('Failed to submit form. Please try again.');
    setIsSubmitting(false);
  };

  const processFormSubmission = async (formData) => {
    // Example: Send notification email, update external systems, etc.
    const response = await fetch('/api/process-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to process form submission');
    }

    return response.json();
  };

  return (
    <div className="advanced-form-container">
      <h1>Advanced Form with Custom Validation</h1>
      
      {submitMessage && (
        <div className={`alert ${submitMessage.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {submitMessage}
        </div>
      )}

      <FormDisplay
        formId="advanced-form-456"
        entityId="entity-789"
        customValidation={customValidation}
        onSaveSuccess={handleSaveSuccess}
        onSaveError={handleSaveError}
        readOnly={isSubmitting}
      />

      {isSubmitting && (
        <div className="processing-overlay">
          <div className="spinner"></div>
          <p>Processing your submission...</p>
        </div>
      )}
    </div>
  );
}

export default AdvancedFormExample;
