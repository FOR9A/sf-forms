// Example integration for Project B - Healthcare Application
import React, { useState } from 'react';
import { FormDisplay } from '@your-org/dynamic-form';
import { usePatientContext } from '../contexts/PatientContext';

function UserProfileForm({ patientId }) {
  const { updatePatientProfile } = usePatientContext();
  const [isUpdating, setIsUpdating] = useState(false);

  // Project B specific styling (healthcare theme)
  const healthcareStyles = {
    formContainer: 'healthcare-form-container',
    form: 'healthcare-form',
    inputField: 'healthcare-input',
    submitButton: 'healthcare-submit-btn',
    errorMessage: 'healthcare-error',
    required: 'healthcare-required'
  };

  // Project B theme (green/blue medical theme)
  const healthcareTheme = {
    theme: 'healthcare',
    colors: {
      'primary-color': '#059669',
      'primary-color-dark': '#047857',
      'accent-color': '#3b82f6'
    }
  };

  // Healthcare specific validation
  const healthcareValidation = {
    'medical-id': (answerData) => {
      const medicalIdRegex = /^[A-Z]{2}\d{8}$/;
      if (answerData.value && !medicalIdRegex.test(answerData.value)) {
        return 'Medical ID must be in format: XX12345678';
      }
      return null;
    },
    'date-of-birth': (answerData) => {
      if (answerData.value) {
        const birthDate = new Date(answerData.value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 0 || age > 150) {
          return 'Please enter a valid date of birth';
        }
      }
      return null;
    },
    'emergency-contact-phone': (answerData) => {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (answerData.value && !phoneRegex.test(answerData.value)) {
        return 'Please enter a valid emergency contact phone number';
      }
      return null;
    },
    'insurance-policy': (answerData) => {
      if (answerData.value && answerData.value.length < 5) {
        return 'Insurance policy number must be at least 5 characters';
      }
      return null;
    }
  };

  const handleHealthcareFormSuccess = async (data) => {
    setIsUpdating(true);
    
    try {
      // Project B specific success handling
      console.log('Patient profile updated:', data);
      
      // Update patient profile in healthcare system
      await updatePatientProfile(patientId, data);
      
      // Log medical record update
      await fetch('/api/medical-records/log-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          updateType: 'profile_form',
          timestamp: new Date().toISOString(),
          formData: data
        })
      });

      // Show healthcare success notification
      showHealthcareAlert('success', 'Patient profile updated successfully');
      
    } catch (error) {
      console.error('Healthcare form error:', error);
      showHealthcareAlert('error', 'Failed to update patient profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleHealthcareFormError = (error) => {
    console.error('Healthcare form submission error:', error);
    showHealthcareAlert('error', 'Failed to save patient information. Please try again.');
  };

  return (
    <div className="healthcare-page">
      <div className="healthcare-header">
        <h1>Patient Profile Information</h1>
        <p>Please provide accurate medical and contact information</p>
        <div className="privacy-notice">
          <small>🔒 All information is encrypted and HIPAA compliant</small>
        </div>
      </div>

      <FormDisplay
        formId="patient-profile-form"
        entityId={patientId}
        cssClasses={healthcareStyles}
        themeConfig={healthcareTheme}
        customValidation={healthcareValidation}
        onSaveSuccess={handleHealthcareFormSuccess}
        onSaveError={handleHealthcareFormError}
        readOnly={isUpdating}
      />

      {isUpdating && (
        <div className="healthcare-processing">
          <div className="medical-spinner"></div>
          <p>Updating patient records...</p>
        </div>
      )}
    </div>
  );
}

// Helper function for healthcare notifications
function showHealthcareAlert(type, message) {
  // Implementation specific to Project B's healthcare notification system
  window.dispatchEvent(new CustomEvent('healthcare-alert', {
    detail: { 
      type, 
      message,
      timestamp: new Date().toISOString(),
      requiresAcknowledgment: type === 'error'
    }
  }));
}

export default UserProfileForm;
