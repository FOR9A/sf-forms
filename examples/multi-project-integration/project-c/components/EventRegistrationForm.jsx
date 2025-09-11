// Example integration for Project C - Event Management Application
import React, { useState, useEffect } from 'react';
import { FormDisplay } from '@your-org/dynamic-form';
import { useEventContext } from '../contexts/EventContext';
import { useNotification } from '../hooks/useNotification';

function EventRegistrationForm({ eventId, userId }) {
  const { getEventDetails, registerUserForEvent } = useEventContext();
  const { showNotification } = useNotification();
  const [eventDetails, setEventDetails] = useState(null);
  const [registrationStep, setRegistrationStep] = useState('form');

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      const details = await getEventDetails(eventId);
      setEventDetails(details);
    } catch (error) {
      console.error('Failed to load event details:', error);
    }
  };

  // Project C specific styling (event/conference theme)
  const eventStyles = {
    formContainer: 'event-form-container',
    form: 'event-form',
    inputField: 'event-input',
    submitButton: 'event-register-btn',
    errorMessage: 'event-error',
    formField: 'event-form-field'
  };

  // Project C theme (purple/gold event theme)
  const eventTheme = {
    theme: 'events',
    colors: {
      'primary-color': '#7c3aed',
      'primary-color-dark': '#6d28d9',
      'accent-color': '#f59e0b'
    }
  };

  // Event specific validation
  const eventValidation = {
    'dietary-requirements': (answerData, allAnswers) => {
      // If "Other" is selected, require specification
      const otherSelected = answerData.selectedOptions?.includes('other');
      const otherSpecification = allAnswers['dietary-other-specification']?.value;
      
      if (otherSelected && !otherSpecification?.trim()) {
        return 'Please specify your dietary requirements';
      }
      return null;
    },
    'emergency-contact': (answerData) => {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (answerData.value && !phoneRegex.test(answerData.value)) {
        return 'Please enter a valid emergency contact number';
      }
      return null;
    },
    'experience-level': (answerData, allAnswers) => {
      // Validate experience level matches event requirements
      if (eventDetails?.requiresExperience && answerData.selectedOption === 'beginner') {
        return 'This event requires intermediate or advanced experience level';
      }
      return null;
    },
    'workshop-preferences': (answerData) => {
      // Limit workshop selections based on event capacity
      if (answerData.selectedOptions?.length > 3) {
        return 'Please select maximum 3 workshop preferences';
      }
      return null;
    }
  };

  const handleEventRegistrationSuccess = async (data) => {
    setRegistrationStep('processing');
    
    try {
      // Project C specific success handling
      console.log('Event registration form completed:', data);
      
      // Register user for the event
      const registrationResult = await registerUserForEvent({
        eventId,
        userId,
        formData: data,
        registrationDate: new Date().toISOString()
      });

      // Send confirmation email
      await fetch('/api/events/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          userId,
          registrationId: registrationResult.id,
          formData: data
        })
      });

      // Update registration step
      setRegistrationStep('success');
      
      // Show success notification
      showNotification({
        type: 'success',
        title: 'Registration Successful!',
        message: `You have been registered for ${eventDetails?.name}. Check your email for confirmation.`,
        duration: 5000
      });

    } catch (error) {
      console.error('Event registration error:', error);
      setRegistrationStep('error');
      
      showNotification({
        type: 'error',
        title: 'Registration Failed',
        message: 'Unable to complete your registration. Please try again.',
        duration: 8000
      });
    }
  };

  const handleEventRegistrationError = (error) => {
    console.error('Event form submission error:', error);
    showNotification({
      type: 'error',
      title: 'Form Error',
      message: 'Please check your information and try again.',
      duration: 5000
    });
  };

  if (!eventDetails) {
    return <div className="event-loading">Loading event details...</div>;
  }

  if (registrationStep === 'success') {
    return (
      <div className="event-success-page">
        <div className="success-icon">✅</div>
        <h1>Registration Successful!</h1>
        <p>You have been registered for <strong>{eventDetails.name}</strong></p>
        <p>Event Date: {new Date(eventDetails.date).toLocaleDateString()}</p>
        <p>Location: {eventDetails.location}</p>
        <div className="next-steps">
          <h3>Next Steps:</h3>
          <ul>
            <li>Check your email for confirmation details</li>
            <li>Add the event to your calendar</li>
            <li>Join our event community chat</li>
          </ul>
        </div>
      </div>
    );
  }

  if (registrationStep === 'error') {
    return (
      <div className="event-error-page">
        <div className="error-icon">❌</div>
        <h1>Registration Failed</h1>
        <p>We encountered an issue processing your registration.</p>
        <button 
          onClick={() => setRegistrationStep('form')}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="event-page">
      <div className="event-header">
        <h1>Register for {eventDetails.name}</h1>
        <div className="event-info">
          <p><strong>Date:</strong> {new Date(eventDetails.date).toLocaleDateString()}</p>
          <p><strong>Location:</strong> {eventDetails.location}</p>
          <p><strong>Capacity:</strong> {eventDetails.availableSpots} spots remaining</p>
        </div>
      </div>

      <FormDisplay
        formId="event-registration-form"
        entityId={`${eventId}-${userId}`}
        cssClasses={eventStyles}
        themeConfig={eventTheme}
        customValidation={eventValidation}
        onSaveSuccess={handleEventRegistrationSuccess}
        onSaveError={handleEventRegistrationError}
        readOnly={registrationStep === 'processing'}
      />

      {registrationStep === 'processing' && (
        <div className="event-processing">
          <div className="event-spinner"></div>
          <p>Processing your registration...</p>
          <small>Please do not close this window</small>
        </div>
      )}
    </div>
  );
}

export default EventRegistrationForm;
