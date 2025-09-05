import React, { useReducer, useContext, useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { SessionContext } from '../../session';
import { contactUs } from '../../actions';
import { Button, Colors } from '../Styling';
import { Input, Alert, TextArea } from '../Form';
import { H3 } from '../Heading';
import { Div } from '../Sections';
import SafeReCAPTCHA from '../SafeReCAPTCHA';

// Custom hook for debounce (without external dependencies)
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for error handling
const useErrorHandler = (translations) => {
  const getErrorMessage = useCallback((error, context = 'general') => {
    // Mapping common errors to user-friendly messages
    const errorMessages = {
      network: translations?.error_handler?.network || 'Connection error. Check your internet and try again.',
      timeout: translations?.error_handler?.timeout || 'Request took too long. Please try again.',
      validation: translations?.error_handler?.validation || 'Please review the entered data.',
      server: translations?.error_handler?.server || 'Server error. Try again in a few moments.',
      captcha: translations?.error_handler?.captcha || 'Verification error. Please complete the captcha.',
      general: translations?.error_handler?.general || 'An unexpected error occurred. Please try again.'
    };

    // Detect error type
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
      return errorMessages.network;
    }
    if (error?.code === 'TIMEOUT_ERROR' || error?.message?.includes('timeout')) {
      return errorMessages.timeout;
    }
    if (error?.code === 'VALIDATION_ERROR') {
      return errorMessages.validation;
    }
    if (error?.status >= 500) {
      return errorMessages.server;
    }
    if (error?.message?.includes('captcha')) {
      return errorMessages.captcha;
    }

    // Custom or generic message
    return error?.message || errorMessages[context] || errorMessages.general;
  }, [translations]);

  const logError = useCallback((error, context) => {
    // Log for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 DynamicForm Error');
      console.error('Context:', context);
      console.error('Error:', error);
      console.error('Stack:', error?.stack);
      console.groupEnd();
    }
  }, []);

  return { getErrorMessage, logError };
};

// Custom hook for field validation
const useFieldValidation = (translations) => {
  const validators = useMemo(() => ({
    first_name: (value) => {
      console.log('value_name:::', value);
      // Extract value from event if it's an event object
      const actualValue = value && typeof value === 'object' && value.target ? value.target.value : value;
      const stringValue = String(actualValue || '');
      if (!stringValue.trim()) return translations?.validation_messages?.first_name?.required || 'First name is required';
      if (stringValue.trim().length < 2) return translations?.validation_messages?.first_name?.min_length || 'First name must be at least 2 characters';
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(stringValue)) return translations?.validation_messages?.first_name?.invalid_format || 'First name can only contain letters';
      return '';
    },
    last_name: (value) => {
      console.log('value_lastName:::', value);
      // Extract value from event if it's an event object
      const actualValue = value && typeof value === 'object' && value.target ? value.target.value : value;
      const stringValue = String(actualValue || '');
      if (!stringValue.trim()) return translations?.validation_messages?.last_name?.required || 'Last name is required';
      if (stringValue.trim().length < 2) return translations?.validation_messages?.last_name?.min_length || 'Last name must be at least 2 characters';
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(stringValue)) return translations?.validation_messages?.last_name?.invalid_format || 'Last name can only contain letters';
      return '';
    },
    email: (value) => {
      // Extract value from event if it's an event object
      const actualValue = value && typeof value === 'object' && value.target ? value.target.value : value;
      const stringValue = String(actualValue || '');
      if (!stringValue.trim()) return translations?.validation_messages?.email?.required || 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue.trim())) return translations?.validation_messages?.email?.invalid_format || 'Please enter a valid email address';
      return '';
    }
  }), [translations]);

  const validateField = useCallback((name, value) => {
    return validators[name]?.(value) || '';
  }, [validators]);

  const validateForm = useCallback((formData) => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    return errors;
  }, [validateField]);

  return { validateField, validateForm };
};

// Reducer for form state
const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        }
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: true
        }
      };
    case 'SET_ALL_TOUCHED':
      const allTouched = Object.keys(state.formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      return {
        ...state,
        touched: allTouched
      };
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload
      };
    case 'SET_ALERT':
      return {
        ...state,
        alert: action.payload
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors
      };
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.error
        }
      };
    case 'RESET_FORM':
        const resetFormData = {};
        Object.keys(state.formData).forEach(field => {
          resetFormData[field] = '';
        });
        return {
          ...state,
          formData: resetFormData,
          errors: {},
          touched: {},
          status: 'idle',
          alert: { msg: '', type: '' }
        };
    default:
      return state;
  }
};

// Function to create dynamic initial state
const createInitialFormState = (fields) => {
  const formData = {};
  fields.forEach(field => {
    formData[field] = '';
  });
  
  return {
    formData,
    errors: {},
    touched: {},
    status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
    alert: { msg: '', type: '' }
  };
};

/**
 * DynamicForm - Reusable and configurable form component
 * @param {Object} props - Component properties
 * @param {string} props.title - Form title (default: "Contact Us")
 * @param {string} props.submitButtonText - Submit button text (default: "Send")
 * @param {Array} props.fields - Array of field names to render dynamically
 * @param {Object} props.placeholders - Placeholder texts for fields
 * @param {Object} props.fieldLabels - Label texts for fields
 * @param {Object} props.fieldTypes - Input types for fields
 * @param {boolean} props.validateOnChange - Enable real-time validation
 * @param {Function} props.onSubmit - Custom submit handler
 * @param {Function} props.onSuccess - Callback executed on successful submission
 * @param {Function} props.onError - Callback executed on error
 * @param {string} props.className - Additional CSS class
 * 
 * @example
 * <DynamicForm 
 *   title="Contact Us"
 *   fields={['first_name', 'last_name', 'email', 'phone']}
 *   fieldLabels={{
 *     first_name: "First Name *",
 *     last_name: "Last Name *",
 *     email: "Email *",
 *     phone: "Phone"
 *   }}
 *   fieldTypes={{
 *     first_name: "text",
 *     last_name: "text",
 *     email: "email",
 *     phone: "tel"
 *   }}
 *   validateOnChange={true}
 *   onSuccess={(response) => console.log('Sent:', response)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 */
const DynamicForm = ({
  lang = 'us', // Language parameter
  title, // Optional override for title
  submitButtonText, // Optional override for submit button text
  loadingText, // Optional override for loading text
  successMessage, // Optional override for success message
  errorMessage, // Optional override for error message
  validationError, // Optional override for validation error
  validateOnChange = true, // New parameter to control real-time validation
  onSubmit = null, // Custom submit handler
  fields = ['first_name', 'last_name', 'email'], // Dynamic fields configuration
  fieldTypes = {
    first_name: "text",
    last_name: "text",
    email: "email"
  },
  onSuccess,
  onError,
  className = ""
}) => {
  // GraphQL query to get translations
  const data = useStaticQuery(graphql`
    {
      allDynamicFormYaml {
        edges {
          node {
            title
            submit_button_text
            loading_text
            success_message
            error_message
            validation_error
            status_messages {
              loading
              success
              error
            }
            placeholders {
              first_name
              last_name
              email
            }
            field_labels {
              first_name
              last_name
              email
            }
            validation_messages {
              first_name {
                required
                min_length
                invalid_format
              }
              last_name {
                required
                min_length
                invalid_format
              }
              email {
                required
                invalid_format
              }
            }
            error_handler {
              network
              timeout
              validation
              server
              captcha
              general
            }
            accessibility {
              form_description
              submit_loading_aria
              submit_default_aria
              submit_help_text
            }
            trust_indicators {
              secure
              no_commitment
              quick_response
            }
            fields {
              lang
            }
          }
        }
      }
    }
  `);

  // Get translations for the specified language
  let translations = data.allDynamicFormYaml.edges.find(
    ({ node }) => node.fields.lang === lang
  );
  if (translations) translations = translations.node;
  const { session } = useContext(SessionContext);
  const captcha = useRef(null);
  
  // Use useReducer for form state with dynamic fields
  const initialFormState = useMemo(() => createInitialFormState(fields), [fields]);
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const { formData, errors, touched, status, alert } = state;
  
  // Custom hooks
  const { validateField, validateForm } = useFieldValidation(translations);
  const { getErrorMessage, logError } = useErrorHandler(translations);

  // Use translations as fallback for props
  const finalTitle = title || translations?.title || "Contact Us";
  const finalSubmitButtonText = submitButtonText || translations?.submit_button_text || "Send";
  const finalLoadingText = loadingText || translations?.loading_text || "Sending...";
  const finalSuccessMessage = successMessage || translations?.success_message || "Message sent successfully! We'll get in touch with you soon.";
  const finalErrorMessage = errorMessage || translations?.error_message || "Error sending message. Please try again.";
  const finalValidationError = validationError || translations?.validation_error || "Please correct the errors in the form";
  
  // Debounce only for optional visual feedback (not validation)
  const debouncedFormData = useDebounce(formData, 300); // 300ms para feedback visual
  
  // Funciones de manejo optimizadas con useCallback
  const handleFieldChange = useCallback((fieldName) => (inputValue, isValid) => {
     console.log('inputValue:::', inputValue, 'isValid:::', isValid);
     dispatch({ type: 'SET_FIELD', field: fieldName, value: inputValue });
    
    // Real-time validation only if validateOnChange is true and field has been touched
    if (validateOnChange && touched[fieldName]) {
      const error = validateField(fieldName, inputValue);
      dispatch({ type: 'SET_ERROR', field: fieldName, error });
    }
  }, [validateOnChange, touched, validateField]);
  
  const handleFieldBlur = useCallback((fieldName) => (value, isValid) => {
     dispatch({ type: 'SET_TOUCHED', field: fieldName });
    
    // Siempre validar en blur, independientemente de validateOnChange
    const error = validateField(fieldName, value);
    dispatch({ type: 'SET_ERROR', field: fieldName, error });
  }, [validateField]);
  
  // Memoizar handlers para evitar re-renders innecesarios
  const createFieldHandler = useCallback((fieldName) => handleFieldChange(fieldName), [handleFieldChange]);
  const createBlurHandler = useCallback((fieldName) => handleFieldBlur(fieldName), [handleFieldBlur]);
  
  // Function to check if a field has an error
  const hasFieldError = useCallback((fieldName) => {
    return touched[fieldName] && errors[fieldName];
  }, [touched, errors]);
  
  // Function to render fields dynamically
  const renderField = useCallback((fieldName) => {
    const fieldType = fieldTypes[fieldName] || 'text';
    const fieldLabel = translations?.field_labels?.[fieldName] || fieldName;
    const fieldPlaceholder = translations?.placeholders?.[fieldName] || '';
    const isEmailField = fieldName === 'email';
    
    return (
      <Div key={fieldName} display="flex" flexDirection="column" gap="8px" width={isEmailField ? "100%" : "auto"}>
        <label 
          htmlFor={fieldName}
          style={{
            fontSize: '1rem',
            fontWeight: '500',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {fieldLabel}
        </label>
        <Input
          id={fieldName}
          type={fieldType}
          name={fieldName}
          value={formData[fieldName] || ''}
          onChange={createFieldHandler(fieldName)}
          onBlur={createBlurHandler(fieldName)}
          placeholder={fieldPlaceholder}
          required
          aria-required="true"
          aria-invalid={hasFieldError(fieldName) ? 'true' : 'false'}
          aria-describedby={hasFieldError(fieldName) ? `${fieldName}_error` : `${fieldName}_help`}
          style={{
            height: '48px',
            padding: '0 16px',
            border: `2px solid ${hasFieldError(fieldName) ? Colors.red : '#e5e7eb'}`,
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'border-color 0.2s ease',
            background: 'white',
            fontFamily: 'var(--font-sans)',
            width: 'auto'
          }}
        />
        {/* Texto de ayuda invisible */}
        <div 
          id={`${fieldName}_help`} 
          style={{ 
            position: 'absolute', 
            left: '-10000px', 
            width: '1px', 
            height: '1px', 
            overflow: 'hidden' 
          }}
        >
          Required field. {fieldPlaceholder}
        </div>
        {/* Error message */}
        {hasFieldError(fieldName) && (
          <div 
            id={`${fieldName}_error`} 
            role="alert" 
            aria-live="polite"
            style={{
              color: Colors.red,
              fontSize: '0.875rem',
              marginTop: '4px',
              fontFamily: 'var(--font-sans)'
            }}
          >
            {errors[fieldName]}
          </div>
        )}
      </Div>
    );
  }, [formData, errors, createFieldHandler, createBlurHandler, hasFieldError, fieldTypes, translations]);
  
  /**
   * Handles form submission with modern async patterns
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (status === 'loading') return;
    
    // Mark all fields as touched
    dispatch({ type: 'SET_ALL_TOUCHED' });
    
    // Complete validation on submit (modern pattern)
    const validationErrors = {};
    const fieldsToValidate = ['first_name', 'last_name', 'email'];
    
    fieldsToValidate.forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        validationErrors[fieldName] = error;
      }
    });
    
    // If there are errors, stop submission and show feedback
     if (Object.keys(validationErrors).length > 0) {
       dispatch({ type: 'SET_ERRORS', errors: validationErrors });
       dispatch({ type: 'SET_STATUS', payload: 'error' });
       dispatch({ 
         type: 'SET_ALERT', 
         payload: { 
           type: 'error', 
           message: 'Por favor corrige los errores antes de enviar' 
         } 
       });
       
       // Enfocar el primer campo con error para mejor UX
       const firstErrorField = Object.keys(validationErrors)[0];
       const errorElement = document.getElementById(firstErrorField);
       if (errorElement) {
         errorElement.focus();
         errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
       return;
     }
     
     // Clear previous errors if validation passes
     dispatch({ type: 'SET_ERRORS', errors: {} });
     dispatch({ type: 'SET_STATUS', payload: 'loading' });
     dispatch({ type: 'SET_ALERT', payload: { type: '', message: '' } });
    
    try {
      // Use custom onSubmit if provided, otherwise use default contactUs
      const submitFunction = onSubmit || ((data, session) => contactUs(data, session));
      const response = await submitFunction(formData, session);
      
      // Check if response indicates an error
      if (response && (response.error !== false && response.error !== undefined)) {
        throw new Error(response.error || 'Submission failed');
      }
      
      dispatch({ type: 'SET_STATUS', payload: 'success' });
      dispatch({ 
        type: 'SET_ALERT', 
        payload: { type: 'success', message: finalSuccessMessage }
      });
      
      // Clear form on success
      dispatch({ type: 'RESET_FORM' });
      
      // Success callback
      if (onSuccess) onSuccess(response);
      
    } catch (error) {
      // Log del error para debugging
      logError(error, 'form_submission');
      
      // Obtener mensaje de error amigable
      const friendlyMessage = getErrorMessage(error, 'general');
      
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      dispatch({ 
        type: 'SET_ALERT', 
        payload: { type: 'error', message: friendlyMessage }
      });
      
      // Error callback
      if (onError) onError(error);
    }
  }, [formData, validateField, session, logError, getErrorMessage]);
  
  // Success state
  if (status === 'success') {
    return (
      <Div 
        maxWidth="600px" 
        margin="0 auto" 
        padding="40px 20px"
        textAlign="center"
        className={className}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Div 
          background="white" 
          borderRadius="16px" 
          padding="64px 32px" 
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          border="1px solid rgba(16, 185, 129, 0.2)"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Div fontSize="4rem" margin="0 0 24px 0">✅</Div>
          <H3 
            type="h2" 
            fontSize="1.5rem" 
            fontWeight="bold" 
            color="#111827" 
            margin="0 0 16px 0"
            fontFamily="var(--font-sans)"
          >
            ¡Gracias!
          </H3>
          <Div 
            color="#6b7280" 
            fontSize="1.125rem" 
            lineHeight="1.6"
            fontFamily="var(--font-sans)"
          >
            {successMessage}
          </Div>
        </Div>
      </Div>
    );
  }

  return (
    <Div maxWidth="600px" flexDirection="column" margin="0 auto" padding="20px" className={className}>
      {/* Header */}
      <Div textAlign="center" margin="0 0 48px 0" display="flex" flexDirection="column" alignItems="center">
        <Div 
          display="inline-block" 
          background="#f3f4f6" 
          color="#374151" 
          padding="8px 16px" 
          borderRadius="20px" 
          fontSize="14px" 
          fontWeight="500" 
          margin="0 0 16px 0"
          fontFamily="var(--font-sans)"
        >
          Contact
        </Div>
        <H3 
          type="h1" 
          fontSize="2.5rem" 
          fontWeight="bold" 
          color="#111827" 
          margin="0 0 16px 0" 
          lineHeight="1.2"
          fontFamily="var(--font-sans)"
        >
          {finalTitle}
        </H3>
        <Div 
          fontSize="1.125rem" 
          color="#6b7280" 
          lineHeight="1.6"
          fontFamily="var(--font-sans)"
        >
          Fill out the form and we'll get in touch with you soon
        </Div>
      </Div>

      {/* Form Card */}
      <Div 
        background="rgba(255, 255, 255, 0.9)" 
        backdropFilter="blur(10px)" 
        borderRadius="16px" 
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
        border="1px solid rgba(255, 255, 255, 0.2)"
      >
        <Div padding="32px">
          <form 
            onSubmit={handleSubmit} 
            noValidate
            role="form"
            aria-labelledby="contact-form-title"
            aria-describedby="contact-form-description"
          >
            {/* Invisible description for screen readers */}
            <div 
              id="contact-form-description" 
              style={{ 
                position: 'absolute', 
                left: '-10000px', 
                width: '1px', 
                height: '1px', 
                overflow: 'hidden' 
              }}
            >
              {translations?.accessibility?.form_description || "Contact form with three required fields: first name, last name and email address"}
            </div>
            
            {/* Status message */}
            {alert.msg && (
              <Alert 
                type={alert.type} 
                margin="0 0 32px 0"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                {alert.msg}
              </Alert>
            )}
            
            {/* Dynamic Fields */}
            <Div 
              display="grid" 
              gridTemplateColumns="1fr" 
              gridTemplateColumns_tablet={fields.length > 1 && fields.includes('first_name') && fields.includes('last_name') ? '1fr 1fr' : '1fr'}
              gap="24px" 
              margin="0 0 32px 0"
            >
              {fields.map(fieldName => {
                // Render name fields in grid, email separately
                if (fieldName === 'first_name' || fieldName === 'last_name') {
                  return renderField(fieldName);
                }
                return null;
              })}
            </Div>
            
            {/* Email field separately if included - full width */}
            {fields.includes('email') && (
              <Div margin="0 0 32px 0" width="100%">
                {renderField('email')}
              </Div>
            )}
            
            {/* Other fields that are not name or email */}
            {fields.filter(field => !['first_name', 'last_name', 'email'].includes(field)).map(fieldName => (
              <Div key={fieldName} margin="0 0 32px 0">
                {renderField(fieldName)}
              </Div>
            ))}

            {/* reCAPTCHA */}
            <Div width="fit-content" margin="0 auto 24px auto">
              <SafeReCAPTCHA ref={captcha} size="invisible" />
            </Div>

            {/* Submit Button */}
            <Div paddingTop="16px" display="flex" flexDirection="column">
              <Button
                type="submit"
                disabled={status === 'loading'}
                aria-describedby="submit-button-help"
                aria-label={status === 'loading' ? (translations?.accessibility?.submit_loading_aria || 'Sending contact form, please wait') : (translations?.accessibility?.submit_default_aria || 'Send contact form')}
                style={{
                  width: '100%',
                  height: '56px',
                  background: status === 'loading' ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                {status === 'loading' ? finalLoadingText : finalSubmitButtonText}
              </Button>
              {/* Invisible help text for button */}
              <div 
                id="submit-button-help" 
                style={{ 
                  position: 'absolute', 
                  left: '-10000px', 
                  width: '1px', 
                  height: '1px', 
                  overflow: 'hidden' 
                }}
              >
                {translations?.accessibility?.submit_help_text || "Click to send your contact message. All fields marked with asterisk are required."}
              </div>
            </Div>

            {/* Trust Indicators */}
            <Div 
              paddingTop="24px" 
              borderTop="1px solid rgba(229, 231, 235, 0.5)" 
              marginTop="24px"
            >
              <Div 
                display="flex" 
                flexWrap="wrap" 
                justifyContent="center" 
                alignItems="center" 
                gap="24px" 
                fontSize="0.875rem" 
                color="#6b7280"
                fontFamily="var(--font-sans)"
              >
                <Div display="flex" alignItems="center" gap="8px">
                  <span style={{ color: '#10b981' }}>🛡️</span>
                  <span style={{ fontFamily: 'var(--font-sans)' }}>{translations?.trust_indicators?.secure_confidential || "Secure and Confidential"}</span>
                </Div>
                <Div display="flex" alignItems="center" gap="8px">
                  <span style={{ color: '#10b981' }}>✅</span>
                  <span style={{ fontFamily: 'var(--font-sans)' }}>{translations?.trust_indicators?.no_commitment || "No Commitment"}</span>
                </Div>
                <Div display="flex" alignItems="center" gap="8px">
                  <span style={{ color: '#10b981' }}>📈</span>
                  <span style={{ fontFamily: 'var(--font-sans)' }}>{translations?.trust_indicators?.quick_response || "Quick Response"}</span>
                </Div>
              </Div>
            </Div>
          </form>
        </Div>
      </Div>
    </Div>
  );
};

export default DynamicForm;