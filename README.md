# Dynamic Form Package

A comprehensive React component library for creating dynamic forms with conditional logic, multiple question types, and multi-language support. Built for Next.js applications with GraphQL integration.

## Features

- **Multiple Question Types**: Text, textarea, email, number, select, radio, checkbox, file upload, date, time, country, city
- **Conditional Logic**: Show/hide questions based on other question responses
- **Multi-language Support**: Built-in support for Arabic and English with extensible localization
- **File Upload**: Integrated file upload with progress tracking
- **Validation**: Built-in validation with custom validation support
- **Theming**: Customizable themes and CSS classes
- **TypeScript Support**: Full TypeScript definitions included
- **Responsive Design**: Mobile-friendly responsive layout
- **RTL Support**: Right-to-left language support

## Installation

```bash
npm install @your-org/dynamic-form
```

## Prerequisites

This package requires the following peer dependencies:

```bash
npm install react react-dom @apollo/client next next-translate next-auth
```

## Basic Usage

```jsx
import React from 'react';
import { FormDisplayWrapper } from '@for9a/sf-forms';

function MyForm() {
  return (
    <FormDisplayWrapper
      formId="your-form-id"
      entityId="your-entity-id"
      graphqlEndpoint="http://127.0.0.1:8000/graphql"
      onSaveSuccess={(data) => console.log('Form saved:', data)}
      onSaveError={(error) => console.error('Save error:', error)}
    />
  );
}

export default MyForm;
```

## Advanced Usage

### Custom Styling

```jsx
import { FormDisplay } from '@your-org/dynamic-form';

const customCssClasses = {
  formContainer: 'my-form-container',
  inputField: 'my-input-field',
  submitButton: 'my-submit-button',
  errorMessage: 'my-error-message'
};

function MyStyledForm() {
  return (
    <FormDisplay
      formId="form-123"
      entityId="entity-456"
      cssClasses={customCssClasses}
    />
  );
}
```

### Custom Theme

```jsx
import { FormDisplay } from '@your-org/dynamic-form';

const themeConfig = {
  theme: 'custom',
  colors: {
    'primary-color': '#007bff',
    'primary-color-dark': '#0056b3',
    'accent-color': '#28a745'
  }
};

function ThemedForm() {
  return (
    <FormDisplay
      formId="form-123"
      entityId="entity-456"
      themeConfig={themeConfig}
    />
  );
}
```

### Custom Validation

```jsx
import { FormDisplay } from '@your-org/dynamic-form';

const customValidation = {
  'question-id-1': (answerData, allAnswers) => {
    if (answerData.value && answerData.value.length < 5) {
      return 'Must be at least 5 characters long';
    }
    return null;
  },
  'email-question-id': (answerData) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (answerData.value && !emailRegex.test(answerData.value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }
};

function ValidatedForm() {
  return (
    <FormDisplay
      formId="form-123"
      entityId="entity-456"
      customValidation={customValidation}
    />
  );
}
```

### Read-Only Mode

```jsx
import { FormDisplay } from '@your-org/dynamic-form';

function ReadOnlyForm() {
  return (
    <FormDisplay
      formId="form-123"
      entityId="entity-456"
      readOnly={true}
    />
  );
}
```

## API Reference

### FormDisplay Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `formId` | string | - | The ID of the form to display |
| `entityId` | string | - | The entity ID for form answers |
| `cssClasses` | CSSClasses | {} | Custom CSS class names |
| `themeConfig` | ThemeConfig | {} | Theme configuration |
| `onSaveSuccess` | function | - | Callback when form saves successfully |
| `onSaveError` | function | - | Callback when form save fails |
| `customValidation` | CustomValidation | {} | Custom validation functions |
| `readOnly` | boolean | false | Whether form is read-only |

### Question Types

The package supports the following question types:

- `text` - Single line text input
- `textarea` - Multi-line text input
- `email` - Email input with validation
- `number` - Numeric input
- `select` - Dropdown selection
- `radio` - Radio button selection
- `checkbox` - Multiple checkbox selection
- `file` - File upload
- `date` - Date picker
- `time` - Time picker
- `country` - Country selection
- `city` - City selection (dependent on country)
- `header` - Display header text
- `subheader` - Display subheader text
- `paragraph` - Display paragraph text

### Conditional Logic

Questions can be shown or hidden based on other question responses using conditions:

```json
{
  "conditionsTarget": [
    {
      "source_question_id": "question-1",
      "comparator": "equals",
      "value": "yes",
      "action": "show"
    }
  ]
}
```

**Supported Comparators:**
- `equals` - Exact match
- `not_equals` - Not equal
- `contains` - Contains substring
- `not_contains` - Does not contain substring
- `greater_than` - Greater than (numeric)
- `less_than` - Less than (numeric)
- `is_empty` - Field is empty
- `is_not_empty` - Field is not empty

**Actions:**
- `show` - Show question when condition is met
- `hide` - Hide question when condition is met

## GraphQL Integration

The package expects specific GraphQL queries and mutations. Make sure your GraphQL schema supports:

### Required Query

```graphql
query GetFormWithAnswers($form_id: ID!, $entity_id: ID, $preview: Boolean) {
  getFormWithAnswers(form_id: $form_id, entity_id: $entity_id, preview: $preview) {
    id
    name
    description
    status
    questions {
      id
      name
      text
      type
      required
      is_user_visible
      has_condition
      label { en ar }
      placeholder { en ar }
      error_message { en ar }
      settings
      options {
        id
        key
        value
        label { en ar }
      }
      conditionsTarget {
        id
        source_question_id
        comparator
        value
        action
      }
      answer {
        id
        value_text
        value_number
        value_date
        value_entity_id
        file_path
        selected_options {
          id
          key
          value
          label { en ar }
        }
      }
    }
  }
}
```

### Required Mutation

```graphql
mutation AddUpdateFormAnswer($input: FormAnswerInput!, $id: ID) {
  addUpdateFormAnswer(input: $input, id: $id) {
    success
    message
    answer_id
  }
}
```

## Styling

The package includes default styles that can be customized. You can:

1. **Override CSS classes** using the `cssClasses` prop
2. **Use CSS custom properties** for theming
3. **Import and modify** the default SCSS file

### CSS Custom Properties

```css
:root {
  --primary-color: #007bff;
  --primary-color-dark: #0056b3;
  --accent-color: #28a745;
}
```

### Default CSS Classes

- `.form-container` - Main form container
- `.form` - Form wrapper
- `.form-rows` - Form rows container
- `.form-row` - Individual form row
- `.form-field` - Form field wrapper
- `.input-field` - Input field styling
- `.input-error` - Error state styling
- `.error-message` - Error message styling
- `.btn-primary` - Submit button styling

## Localization

The package supports multiple languages through the `next-translate` integration. Make sure to configure your translation files with the required keys:

```json
{
  "loading": "Loading...",
  "saving": "Saving...",
  "saved-successfully": "Saved successfully",
  "save-error": "Error saving form",
  "save-form": "Save Form",
  "field-required": "This field is required",
  "loading-cities": "Loading cities...",
  "no-form-data": "No form data available",
  "error-loading-form": "Error loading form"
}
```

## Helper Functions

The package exports several utility functions:

```jsx
import {
  getCountryList,
  getCityList,
  validateEmail,
  validateRequired,
  formatDate,
  processFormData,
  getLocalizedText
} from '@your-org/dynamic-form';
```

## TypeScript Support

Full TypeScript definitions are included. Import types as needed:

```typescript
import {
  FormDisplayProps,
  Question,
  FormAnswers,
  ValidationErrors,
  CSSClasses,
  ThemeConfig
} from '@your-org/dynamic-form';
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please use the GitHub issue tracker or contact the development team.
