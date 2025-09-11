// Example integration for Project A - E-commerce Application
import React from 'react';
import { FormDisplay } from '@your-org/dynamic-form';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

function ProductRegistrationForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { productId } = router.query;

  // Project A specific styling
  const ecommerceStyles = {
    formContainer: 'ecommerce-form-container',
    form: 'ecommerce-form',
    inputField: 'ecommerce-input',
    submitButton: 'ecommerce-submit-btn',
    errorMessage: 'ecommerce-error'
  };

  // Project A theme (blue/orange theme)
  const ecommerceTheme = {
    theme: 'ecommerce',
    colors: {
      'primary-color': '#1e40af',
      'primary-color-dark': '#1e3a8a',
      'accent-color': '#f97316'
    }
  };

  // Project A specific validation
  const ecommerceValidation = {
    'product-name': (answerData) => {
      if (answerData.value && answerData.value.length < 3) {
        return 'Product name must be at least 3 characters';
      }
      return null;
    },
    'product-price': (answerData) => {
      const price = parseFloat(answerData.value);
      if (isNaN(price) || price <= 0) {
        return 'Please enter a valid price greater than 0';
      }
      return null;
    }
  };

  const handleProductFormSuccess = async (data) => {
    // Project A specific success handling
    console.log('Product form saved:', data);
    
    // Update product status in e-commerce system
    await fetch('/api/products/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        status: 'form_completed',
        formData: data
      })
    });

    // Redirect to product dashboard
    router.push(`/products/${productId}/dashboard`);
  };

  const handleProductFormError = (error) => {
    console.error('Product form error:', error);
    // Show e-commerce specific error notification
    showEcommerceNotification('error', 'Failed to save product information');
  };

  return (
    <div className="ecommerce-page">
      <div className="ecommerce-header">
        <h1>Product Registration</h1>
        <p>Complete your product information to list on our marketplace</p>
      </div>

      <FormDisplay
        formId="product-registration-form"
        entityId={productId}
        cssClasses={ecommerceStyles}
        themeConfig={ecommerceTheme}
        customValidation={ecommerceValidation}
        onSaveSuccess={handleProductFormSuccess}
        onSaveError={handleProductFormError}
      />
    </div>
  );
}

// Helper function for e-commerce notifications
function showEcommerceNotification(type, message) {
  // Implementation specific to Project A's notification system
  window.dispatchEvent(new CustomEvent('ecommerce-notification', {
    detail: { type, message }
  }));
}

export default ProductRegistrationForm;
