// Validation rules
export const validationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const digitsOnly = value.replace(/\D/g, '');
    if (!phoneRegex.test(value) || digitsOnly.length < 10) {
      return 'Please enter a valid phone number (at least 10 digits)';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },

  min: (min) => (value) => {
    if (!value) return null;
    if (parseFloat(value) < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },

  max: (max) => (value) => {
    if (!value) return null;
    if (parseFloat(value) > max) {
      return `Must be no more than ${max}`;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number';
    }
    return null;
  },

  match: (fieldName, compareValue) => (value) => {
    if (!value) return null;
    if (value !== compareValue) {
      return `${fieldName} do not match`;
    }
    return null;
  },

  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    return null;
  },

  dateAfter: (compareDate, label = 'start date') => (value) => {
    if (!value || !compareDate) return null;
    const date = new Date(value);
    const compare = new Date(compareDate);
    if (date <= compare) {
      return `Date must be after ${label}`;
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  number: (value) => {
    if (!value) return null;
    if (isNaN(value)) {
      return 'Please enter a valid number';
    }
    return null;
  },

  integer: (value) => {
    if (!value) return null;
    if (!Number.isInteger(parseFloat(value))) {
      return 'Please enter a whole number';
    }
    return null;
  },

  alphanumeric: (value) => {
    if (!value) return null;
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(value)) {
      return 'Only letters and numbers are allowed';
    }
    return null;
  },
};

// Validate single field
export const validateField = (value, rules) => {
  if (!Array.isArray(rules)) {
    rules = [rules];
  }

  for (const rule of rules) {
    const error = rule(value);
    if (error) {
      return error;
    }
  }

  return null;
};

// Validate entire form
export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationSchema).forEach((fieldName) => {
    const rules = validationSchema[fieldName];
    const value = formData[fieldName];
    const error = validateField(value, rules);

    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Example validation schemas
export const loginSchema = {
  email: [validationRules.required, validationRules.email],
  password: [validationRules.required],
};

export const signupSchema = {
  name: [validationRules.required, validationRules.minLength(2)],
  email: [validationRules.required, validationRules.email],
  phone: [validationRules.required, validationRules.phone],
  password: [validationRules.required, validationRules.password],
};

export const bookingSchema = {
  customerName: [validationRules.required, validationRules.minLength(2)],
  email: [validationRules.required, validationRules.email],
  phone: [validationRules.required, validationRules.phone],
  resort: [validationRules.required],
  checkIn: [validationRules.required, validationRules.date],
  checkOut: [validationRules.required, validationRules.date],
  adults: [validationRules.required, validationRules.min(1)],
};

export const resortSchema = {
  name: [validationRules.required, validationRules.minLength(3)],
  location: [validationRules.required],
  description: [validationRules.required, validationRules.minLength(10)],
  starRating: [validationRules.required, validationRules.min(1), validationRules.max(5)],
};

export const roomSchema = {
  resort: [validationRules.required],
  roomType: [validationRules.required],
  description: [validationRules.required, validationRules.minLength(10)],
  occupancy: [validationRules.required, validationRules.min(1)],
  price: [validationRules.required, validationRules.min(0)],
};

export const invoiceSchema = {
  booking: [validationRules.required],
  totalAmount: [validationRules.required, validationRules.min(0)],
  dueDate: [validationRules.required, validationRules.date],
};

export const paymentSchema = {
  invoice: [validationRules.required],
  amount: [validationRules.required, validationRules.min(0)],
  method: [validationRules.required],
};

export const userSchema = {
  name: [validationRules.required, validationRules.minLength(2)],
  email: [validationRules.required, validationRules.email],
  phone: [validationRules.required, validationRules.phone],
  role: [validationRules.required],
};