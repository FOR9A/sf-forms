# Multi-Project Integration Examples

This directory contains examples of how to integrate the `@your-org/dynamic-form` package across different types of projects. Each example demonstrates project-specific customizations, styling, validation, and business logic integration.

## Project Examples

### Project A - E-commerce Application
**File:** `project-a/pages/form.jsx`

**Use Case:** Product registration form for marketplace vendors

**Key Features:**
- E-commerce specific styling (blue/orange theme)
- Product validation (name length, price validation)
- Integration with product management system
- Automatic product status updates
- Marketplace-specific notifications

**Customizations:**
- Custom CSS classes for e-commerce branding
- Product-specific validation rules
- Integration with product dashboard
- E-commerce notification system

### Project B - Healthcare Application
**File:** `project-b/components/UserProfileForm.jsx`

**Use Case:** Patient profile management in healthcare system

**Key Features:**
- Healthcare specific styling (green/blue medical theme)
- Medical ID validation
- HIPAA compliance considerations
- Emergency contact validation
- Insurance policy validation

**Customizations:**
- Medical-themed UI components
- Healthcare-specific validation (medical IDs, dates)
- Integration with patient management system
- Medical record logging
- HIPAA-compliant notifications

### Project C - Event Management Application
**File:** `project-c/components/EventRegistrationForm.jsx`

**Use Case:** Event registration with complex business logic

**Key Features:**
- Event specific styling (purple/gold theme)
- Multi-step registration process
- Capacity management
- Workshop preference limitations
- Experience level validation

**Customizations:**
- Event-themed UI with registration steps
- Complex validation based on event requirements
- Integration with event management system
- Email confirmation system
- Registration success/error handling

## Common Integration Patterns

### 1. Custom Styling
Each project demonstrates how to override default styles:

```jsx
const customStyles = {
  formContainer: 'project-specific-container',
  inputField: 'project-specific-input',
  submitButton: 'project-specific-button'
};
```

### 2. Theme Configuration
Projects can define their own color schemes:

```jsx
const projectTheme = {
  theme: 'project-name',
  colors: {
    'primary-color': '#custom-color',
    'primary-color-dark': '#custom-dark-color',
    'accent-color': '#custom-accent'
  }
};
```

### 3. Custom Validation
Each project implements domain-specific validation:

```jsx
const customValidation = {
  'field-id': (answerData, allAnswers) => {
    // Project-specific validation logic
    return validationMessage || null;
  }
};
```

### 4. Success/Error Handling
Projects integrate with their own notification and workflow systems:

```jsx
const handleSuccess = async (data) => {
  // Project-specific success handling
  await updateProjectSystem(data);
  showProjectNotification('success', 'Form saved!');
  redirectToNextStep();
};
```

## Integration Checklist

When integrating the dynamic form package into a new project:

### 1. Installation
```bash
npm install @your-org/dynamic-form
```

### 2. Peer Dependencies
Ensure all required peer dependencies are installed:
```bash
npm install react react-dom @apollo/client next next-translate next-auth
```

### 3. GraphQL Setup
- Configure GraphQL endpoint
- Ensure required queries/mutations are available
- Set up authentication headers

### 4. Styling Integration
- [ ] Create project-specific CSS classes
- [ ] Define theme colors
- [ ] Test responsive design
- [ ] Verify accessibility

### 5. Validation Setup
- [ ] Identify domain-specific validation rules
- [ ] Implement custom validation functions
- [ ] Test edge cases
- [ ] Localize error messages

### 6. Business Logic Integration
- [ ] Define success handling workflow
- [ ] Implement error handling
- [ ] Set up notifications
- [ ] Configure redirects/next steps

### 7. Testing
- [ ] Unit tests for custom validation
- [ ] Integration tests with project systems
- [ ] End-to-end form submission tests
- [ ] Cross-browser testing

## Best Practices

### 1. Separation of Concerns
- Keep form logic separate from business logic
- Use callbacks for project-specific operations
- Maintain clean component interfaces

### 2. Error Handling
- Implement comprehensive error handling
- Provide meaningful error messages
- Log errors for debugging
- Graceful degradation

### 3. Performance
- Use React.memo for expensive components
- Implement proper loading states
- Optimize re-renders
- Consider form field debouncing

### 4. Accessibility
- Ensure proper ARIA labels
- Test with screen readers
- Maintain keyboard navigation
- Use semantic HTML

### 5. Security
- Validate data on both client and server
- Sanitize user inputs
- Implement proper authentication
- Follow security best practices

## Troubleshooting

### Common Issues

1. **Styling not applied**
   - Check CSS class names match
   - Verify CSS specificity
   - Ensure styles are imported

2. **Validation not working**
   - Check validation function syntax
   - Verify field IDs match
   - Test validation logic independently

3. **GraphQL errors**
   - Verify endpoint configuration
   - Check authentication tokens
   - Validate query/mutation schemas

4. **Theme not applied**
   - Check CSS custom properties
   - Verify theme configuration
   - Test in different browsers

### Getting Help

- Check the main README.md for general documentation
- Review TypeScript definitions for API reference
- Look at basic examples for simple use cases
- Contact the development team for specific issues

## Contributing

When adding new project examples:

1. Create a new project directory
2. Include a complete working example
3. Document specific use cases and customizations
4. Add to this README with project description
5. Test integration thoroughly
