import React from 'react';
import { FormDisplay } from '@your-org/dynamic-form';
import './custom-form-styles.css';

// Custom styling example
function CustomStyledFormExample() {
  // Custom CSS classes to override default styling
  const customCssClasses = {
    formContainer: 'custom-form-container',
    form: 'custom-form',
    formField: 'custom-form-field',
    inputField: 'custom-input-field',
    submitButton: 'custom-submit-button',
    errorMessage: 'custom-error-message',
    required: 'custom-required-asterisk'
  };

  // Custom theme configuration
  const themeConfig = {
    theme: 'corporate',
    colors: {
      'primary-color': '#2c3e50',
      'primary-color-dark': '#1a252f',
      'accent-color': '#e74c3c',
      'success-color': '#27ae60',
      'warning-color': '#f39c12'
    }
  };

  return (
    <div className="page-container">
      <h1>Custom Styled Form</h1>
      <FormDisplay
        formId="styled-form-123"
        entityId="entity-789"
        cssClasses={customCssClasses}
        themeConfig={themeConfig}
        onSaveSuccess={(data) => {
          console.log('Custom form saved:', data);
        }}
      />
    </div>
  );
}

export default CustomStyledFormExample;
