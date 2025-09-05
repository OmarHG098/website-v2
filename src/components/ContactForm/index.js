import React, { useReducer, useContext, useRef, useCallback, useMemo, useState, useEffect } from 'react';
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
const useErrorHandler = () => {
  const getErrorMessage = useCallback((error, context = 'general') => {
    // Mapping common errors to user-friendly messages
    const errorMessages = {
      network: 'Connection error. Check your internet and try again.',
      timeout: 'Request took too long. Please try again.',
      validation: 'Please review the entered data.',
      server: 'Server error. Try again in a few moments.',
      captcha: 'Verification error. Please complete the captcha.',
      general: 'An unexpected error occurred. Please try again.'
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
  }, []);

  const logError = useCallback((error, context) => {
    // Log for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ContactForm Error');
      console.error('Context:', context);
      console.error('Error:', error);
      console.error('Stack:', error?.stack);
      console.groupEnd();
    }
  }, []);

  return { getErrorMessage, logError };
};

// Custom hook for field validation
const useFieldValidation = () => {
  const validators = useMemo(() => ({
    first_name: (value) => {
      console.log('value_name:::', value);
      // Extract value from event if it's an event object
      const actualValue = value && typeof value === 'object' && value.target ? value.target.value : value;
      const stringValue = String(actualValue || '');
      if (!stringValue.trim()) return 'First name is required';
      if (stringValue.trim().length < 2) return 'First name must be at least 2 characters';
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(stringValue)) return 'First name can only contain letters';
      return '';
    },
    last_name: (value) => {
      console.log('value_lastName:::', value);
      // Extraer el valor del evento si es un objeto evento
      const actualValue = value && typeof value === 'object' && value.target ? value.target.value : value;
      const stringValue = String(actualValue || '');
      if (!stringValue.trim()) return 'Last name is required';
      if (stringValue.trim().length < 2) return 'Last name must be at least 2 characters';
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(stringValue)) return 'Last name can only contain letters';
      return '';
    },
    email: (value) => {
      // Extraer el valor del evento si es un objeto evento
      const actualValue = value && typeof value === 'object' && value.target ? value.target.value : value;
      const stringValue = String(actualValue || '');
      if (!stringValue.trim()) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue.trim())) return 'Please enter a valid email address';
      return '';
    }
  }), []);

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

// Reducer para el estado del formulario
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
        status: action.status
      };
    case 'SET_ALERT':
      return {
        ...state,
        alert: action.alert
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
      return {
        ...state,
        formData: {
          first_name: '',
          last_name: '',
          email: ''
        },
        errors: {},
        touched: {},
        status: 'idle',
        alert: { msg: '', type: '' }
      };
    default:
      return state;
  }
};

// Estado inicial del formulario
const initialFormState = {
  formData: {
    first_name: '',
    last_name: '',
    email: ''
  },
  errors: {},
  touched: {},
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  alert: { msg: '', type: '' }
};

/**
 * ContactForm - Reusable and semantic contact form component
 * 
 * Features:
 * - Semantic: Uses appropriate HTML elements (<form>, <fieldset>, <legend>)
 * - Accessible: Full screen reader support with ARIA labels
 * - Enhanced validation: Real-time validation with field states
 * - Loading states: Visual feedback during submission
 * - Customizable: Props to customize texts and behavior
 * - Responsive: Adaptive design for different screen sizes
 * - reCAPTCHA: Integrated spam protection
 * 
 * @param {Object} props - Component properties
 * @param {string} props.title - Form title (default: "Contact Us")
 * @param {string} props.submitButtonText - Submit button text (default: "Send")
 * @param {Object} props.placeholders - Placeholder texts for fields
 * @param {Function} props.onSuccess - Callback executed on successful submission
 * @param {Function} props.onError - Callback executed on error
 * @param {string} props.className - Additional CSS class
 * 
 * @example
 * <ContactForm 
 *   title="Need help?"
 *   submitButtonText="Send inquiry"
 *   placeholders={{
 *     firstName: "Your name",
 *     lastName: "Your last name",
 *     email: "your@email.com",
 *     message: "Tell us how we can help you..."
 *   }}
 *   onSuccess={(response) => console.log('Sent:', response)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 */
const ContactForm = ({
  title = "Contáctanos",
  submitButtonText = "Enviar",
  loadingText = "Enviando...",
  successMessage = "¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.",
  errorMessage = "Error al enviar el mensaje. Por favor intenta de nuevo.",
  validationError = "Por favor corrige los errores en el formulario",
  statusMessages = {
    loading: "Enviando formulario, por favor espera",
    success: "Formulario enviado exitosamente",
    error: "Error al enviar el formulario"
  },
  placeholders = {
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico"
  },
  onSuccess,
  onError,
  className = ""
}) => {
  const { session } = useContext(SessionContext);
  const captcha = useRef(null);
  
  // Usar useReducer para el estado del formulario
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const { formData, errors, touched, status, alert } = state;
  
  // Custom hooks
  const { validateField, validateForm } = useFieldValidation();
  const { getErrorMessage, logError } = useErrorHandler();
  
  // Debounce solo para feedback visual opcional (no validación)
  const debouncedFormData = useDebounce(formData, 300); // 300ms para feedback visual
  
  // Funciones de manejo optimizadas con useCallback
  const handleFieldChange = useCallback((fieldName) => (inputValue, isValid) => {
     console.log('inputValue:::', inputValue, 'isValid:::', isValid);
     dispatch({ type: 'SET_FIELD', field: fieldName, value: inputValue });
    
    // Validación en tiempo real solo si el campo ha sido tocado
    if (touched[fieldName]) {
      const error = validateField(fieldName, inputValue);
      dispatch({ type: 'SET_ERROR', field: fieldName, error });
    }
  }, [touched, validateField]);
  
  const handleFieldBlur = useCallback((fieldName) => (value, isValid) => {
     dispatch({ type: 'SET_TOUCHED', field: fieldName });
    
    const error = validateField(fieldName, value);
    dispatch({ type: 'SET_ERROR', field: fieldName, error });
  }, [validateField]);
  
  // Memoizar handlers para evitar re-renders innecesarios
  const createFieldHandler = useCallback((fieldName) => handleFieldChange(fieldName), [handleFieldChange]);
  const createBlurHandler = useCallback((fieldName) => handleFieldBlur(fieldName), [handleFieldBlur]);
  
  // Función para verificar si un campo tiene error
  const hasFieldError = useCallback((fieldName) => {
    return touched[fieldName] && errors[fieldName];
  }, [touched, errors]);
  
  /**
   * Handles form submission with modern async patterns
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (status === 'loading') return;
    
    // Mark all fields as touched
    dispatch({ type: 'SET_ALL_TOUCHED' });
    
    // Validación completa en submit (patrón moderno)
    const validationErrors = {};
    const fieldsToValidate = ['first_name', 'last_name', 'email'];
    
    fieldsToValidate.forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        validationErrors[fieldName] = error;
      }
    });
    
    // Si hay errores, detener el envío y mostrar feedback
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
     
     // Limpiar errores previos si la validación pasa
     dispatch({ type: 'SET_ERRORS', errors: {} });
     dispatch({ type: 'SET_STATUS', payload: 'loading' });
     dispatch({ type: 'SET_ALERT', payload: { type: '', message: '' } });
    
    try {
      const response = await contactUs(formData, session);
      
      dispatch({ type: 'SET_STATUS', status: 'success' });
      dispatch({ 
        type: 'SET_ALERT', 
        alert: { msg: successMessage, type: 'success' }
      });
      
      // Clear form
      dispatch({ type: 'RESET_FORM' });
      
      // Success callback
      if (onSuccess) onSuccess(response);
      
    } catch (error) {
      // Log del error para debugging
      logError(error, 'form_submission');
      
      // Obtener mensaje de error amigable
      const friendlyMessage = getErrorMessage(error, 'general');
      
      dispatch({ type: 'SET_STATUS', status: 'error' });
      dispatch({ 
        type: 'SET_ALERT', 
        alert: { msg: friendlyMessage, type: 'error' }
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
          Contacto
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
          {title}
        </H3>
        <Div 
          fontSize="1.125rem" 
          color="#6b7280" 
          lineHeight="1.6"
          fontFamily="var(--font-sans)"
        >
          Completa el formulario y nos pondremos en contacto contigo pronto
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
            {/* Descripción invisible para lectores de pantalla */}
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
              Formulario de contacto con tres campos requeridos: nombre, apellido y correo electrónico
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
            
            {/* Name Fields Grid */}
            <Div 
              display="grid" 
              gridTemplateColumns="1fr" 
              gridTemplateColumns_tablet="1fr 1fr" 
              gap="24px" 
              margin="0 0 32px 0"
            >
              {/* First Name */}
              <Div display="flex" flexDirection="column" gap="8px">
                <label 
                  htmlFor="first_name"
                  style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  Nombre *
                </label>
                <Input
                  id="first_name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={createFieldHandler('first_name')}
                  onBlur={createBlurHandler('first_name')}
                  placeholder="Ingresa tu nombre"
                  required
                  aria-required="true"
                  aria-invalid={hasFieldError('first_name') ? 'true' : 'false'}
                  aria-describedby={hasFieldError('first_name') ? 'first_name_error' : 'first_name_help'}
                  style={{
                    height: '48px',
                    padding: '0 16px',
                    border: `2px solid ${hasFieldError('first_name') ? Colors.red : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s ease',
                    background: 'white',
                    fontFamily: 'var(--font-sans)'
                  }}
                />
                {/* Texto de ayuda invisible */}
                <div 
                  id="first_name_help" 
                  style={{ 
                    position: 'absolute', 
                    left: '-10000px', 
                    width: '1px', 
                    height: '1px', 
                    overflow: 'hidden' 
                  }}
                >
                  Campo requerido. Ingresa tu nombre de pila
                </div>
                {/* Error message */}
                {hasFieldError('first_name') && (
                  <div 
                    id="first_name_error" 
                    role="alert" 
                    aria-live="polite"
                    style={{
                      color: Colors.red,
                      fontSize: '0.875rem',
                      marginTop: '4px',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    {errors.first_name}
                  </div>
                )}
              </Div>

              {/* Last Name */}
              <Div display="flex" flexDirection="column" gap="8px">
                <label 
                  htmlFor="last_name"
                  style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  Apellido *
                </label>
                <Input
                  id="last_name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={createFieldHandler('last_name')}
                  onBlur={createBlurHandler('last_name')}
                  placeholder="Ingresa tu apellido"
                  required
                  aria-required="true"
                  aria-invalid={hasFieldError('last_name') ? 'true' : 'false'}
                  aria-describedby={hasFieldError('last_name') ? 'last_name_error' : 'last_name_help'}
                  style={{
                    height: '48px',
                    padding: '0 16px',
                    border: `2px solid ${hasFieldError('last_name') ? Colors.red : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s ease',
                    background: 'white',
                    fontFamily: 'var(--font-sans)'
                  }}
                />
                {/* Texto de ayuda invisible */}
                <div 
                  id="last_name_help" 
                  style={{ 
                    position: 'absolute', 
                    left: '-10000px', 
                    width: '1px', 
                    height: '1px', 
                    overflow: 'hidden' 
                  }}
                >
                  Campo requerido. Ingresa tu apellido
                </div>
                {/* Error message */}
                {hasFieldError('last_name') && (
                  <div 
                    id="last_name_error" 
                    role="alert" 
                    aria-live="polite"
                    style={{
                      color: Colors.red,
                      fontSize: '0.875rem',
                      marginTop: '4px',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    {errors.last_name}
                  </div>
                )}
              </Div>
            </Div>

            {/* Email */}
            <Div display="flex" flexDirection="column" gap="8px" margin="0 0 32px 0">
              <label 
                htmlFor="email"
                style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                Correo Electrónico *
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={createFieldHandler('email')}
                onBlur={createBlurHandler('email')}
                placeholder="tu.email@ejemplo.com"
                required
                aria-required="true"
                aria-invalid={hasFieldError('email') ? 'true' : 'false'}
                aria-describedby={hasFieldError('email') ? 'email_error' : 'email_help'}
                style={{
                  height: '48px',
                  padding: '0 16px',
                  border: `2px solid ${hasFieldError('email') ? Colors.red : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s ease',
                  background: 'white',
                  fontFamily: 'var(--font-sans)'
                }}
              />
              {/* Texto de ayuda invisible */}
              <div 
                id="email_help" 
                style={{ 
                  position: 'absolute', 
                  left: '-10000px', 
                  width: '1px', 
                  height: '1px', 
                  overflow: 'hidden' 
                }}
              >
                Campo requerido. Ingresa una dirección de correo electrónico válida
              </div>
              {/* Error message */}
              {hasFieldError('email') && (
                <div 
                  id="email_error" 
                  role="alert" 
                  aria-live="polite"
                  style={{
                    color: Colors.red,
                    fontSize: '0.875rem',
                    marginTop: '4px',
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  {errors.email}
                </div>
              )}
            </Div>

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
                aria-label={status === 'loading' ? 'Enviando formulario de contacto, por favor espera' : 'Enviar formulario de contacto'}
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
                {status === 'loading' ? loadingText : submitButtonText}
              </Button>
              {/* Texto de ayuda invisible para el botón */}
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
                Haz clic para enviar tu mensaje de contacto. Todos los campos marcados con asterisco son obligatorios.
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
                  <span style={{ fontFamily: 'var(--font-sans)' }}>Seguro y Confidencial</span>
                </Div>
                <Div display="flex" alignItems="center" gap="8px">
                  <span style={{ color: '#10b981' }}>✅</span>
                  <span style={{ fontFamily: 'var(--font-sans)' }}>Sin Compromiso</span>
                </Div>
                <Div display="flex" alignItems="center" gap="8px">
                  <span style={{ color: '#10b981' }}>📈</span>
                  <span style={{ fontFamily: 'var(--font-sans)' }}>Respuesta Rápida</span>
                </Div>
              </Div>
            </Div>
          </form>
        </Div>
      </Div>
    </Div>
  );
};

export default ContactForm;