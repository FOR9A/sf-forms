import React from 'react';
import { FormDisplay } from '@your-org/dynamic-form';

// Basic usage example
function BasicFormExample() {
  const handleSaveSuccess = (data) => {
    console.log('Form saved successfully:', data);
    // Handle success (e.g., show notification, redirect)
  };

  const handleSaveError = (error) => {
    console.error('Form save failed:', error);
    // Handle error (e.g., show error message)
  };

  return (
    <div>
      <h1>Basic Form Example</h1>
      <FormDisplay
        formId="example-form-123"
        entityId="entity-456"
        onSaveSuccess={handleSaveSuccess}
        onSaveError={handleSaveError}
      />
    </div>
  );
}

export default BasicFormExample;
