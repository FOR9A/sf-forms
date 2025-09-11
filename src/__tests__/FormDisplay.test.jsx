import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormDisplay from '../components/FormDisplay.jsx';

// Mock data
const mockFormData = {
  id: 'test-form-1',
  name: 'Test Form',
  description: 'A test form',
  status: 'active',
  questions: [
    {
      id: 'q1',
      name: 'Test Question',
      text: 'What is your name?',
      type: 'text',
      required: true,
      is_user_visible: true,
      has_condition: false,
      label: { en: 'Name', ar: 'الاسم' },
      placeholder: { en: 'Enter your name', ar: 'أدخل اسمك' },
      options: [],
      conditionsTarget: [],
      answer: null
    }
  ]
};

describe('FormDisplay', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<FormDisplay formId="test-form" entityId="test-entity" />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  test('renders form when data is loaded', async () => {
    // Mock successful query
    const mockUseQuery = require('@apollo/client').useQuery;
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getFormWithAnswers: mockFormData },
      refetch: jest.fn()
    });

    render(<FormDisplay formId="test-form" entityId="test-entity" />);

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  test('handles form submission', async () => {
    const mockMutation = jest.fn().mockResolvedValue({
      data: { addUpdateFormAnswer: { success: true } }
    });
    
    require('@apollo/client').useMutation.mockReturnValue([
      mockMutation,
      { loading: false }
    ]);

    require('@apollo/client').useQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getFormWithAnswers: mockFormData },
      refetch: jest.fn()
    });

    render(<FormDisplay formId="test-form" entityId="test-entity" />);

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Enter your name');
      fireEvent.change(input, { target: { value: 'John Doe' } });
    });

    const submitButton = screen.getByText('save-form');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutation).toHaveBeenCalled();
    });
  });

  test('displays validation errors for required fields', async () => {
    require('@apollo/client').useQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getFormWithAnswers: mockFormData },
      refetch: jest.fn()
    });

    render(<FormDisplay formId="test-form" entityId="test-entity" />);

    await waitFor(() => {
      const submitButton = screen.getByText('save-form');
      fireEvent.click(submitButton);
    });

    // Should not submit and should show validation error
    expect(screen.getByText('field-required')).toBeInTheDocument();
  });

  test('applies custom CSS classes', async () => {
    const customClasses = {
      formContainer: 'custom-container',
      form: 'custom-form'
    };

    require('@apollo/client').useQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getFormWithAnswers: mockFormData },
      refetch: jest.fn()
    });

    const { container } = render(
      <FormDisplay 
        formId="test-form" 
        entityId="test-entity" 
        cssClasses={customClasses}
      />
    );

    await waitFor(() => {
      expect(container.querySelector('.custom-container')).toBeInTheDocument();
    });
  });

  test('calls onSaveSuccess callback', async () => {
    const onSaveSuccess = jest.fn();
    const mockMutation = jest.fn().mockResolvedValue({
      data: { addUpdateFormAnswer: { success: true } }
    });

    require('@apollo/client').useMutation.mockReturnValue([
      mockMutation,
      { loading: false }
    ]);

    require('@apollo/client').useQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getFormWithAnswers: mockFormData },
      refetch: jest.fn()
    });

    render(
      <FormDisplay 
        formId="test-form" 
        entityId="test-entity" 
        onSaveSuccess={onSaveSuccess}
      />
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Enter your name');
      fireEvent.change(input, { target: { value: 'John Doe' } });
    });

    const submitButton = screen.getByText('save-form');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSaveSuccess).toHaveBeenCalled();
    });
  });
});
