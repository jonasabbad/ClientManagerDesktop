// ============================================================
// Validation Utilities — Updated for two-level services and decoupled Glovo
// ============================================================

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates client input fields.
 */
export function validateClientInput(input: {
  full_name?: string;
  phone?: string;
  cin?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.full_name || input.full_name.trim().length === 0) {
    errors.push({ field: 'full_name', message: 'Full name is required.' });
  } else if (input.full_name.trim().length > 200) {
    errors.push({ field: 'full_name', message: 'Full name must be less than 200 characters.' });
  }

  if (input.phone && input.phone.trim().length > 20) {
    errors.push({ field: 'phone', message: 'Phone number must be less than 20 characters.' });
  }

  if (input.cin && input.cin.trim().length > 20) {
    errors.push({ field: 'cin', message: 'CIN must be less than 20 characters.' });
  }

  return errors;
}

/**
 * Validates service code input.
 */
export function validateServiceCodeInput(input: {
  code?: string;
  client_id?: number;
  subcategory_id?: number;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.code || input.code.trim().length === 0) {
    errors.push({ field: 'code', message: 'Service code is required.' });
  } else if (input.code.trim().length > 100) {
    errors.push({ field: 'code', message: 'Service code must be less than 100 characters.' });
  }

  if (!input.client_id) {
    errors.push({ field: 'client_id', message: 'Client ID is required.' });
  }

  if (!input.subcategory_id && !(input as any).category_id) {
    errors.push({ field: 'subcategory_id', message: 'Subcategory is required.' });
  }

  return errors;
}

/**
 * Validates Glovo Rider input.
 */
export function validateGlovoInput(input: {
  rider_name?: string;
  rider_id?: string;
  phone?: string;
  email?: string;
  city?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.rider_id || input.rider_id.trim().length === 0) {
    errors.push({ field: 'rider_id', message: 'Glovo Rider ID is required.' });
  } else if (input.rider_id.trim().length > 50) {
    errors.push({ field: 'rider_id', message: 'Rider ID must be less than 50 characters.' });
  }

  if (!input.rider_name || input.rider_name.trim().length === 0) {
    errors.push({ field: 'rider_name', message: 'Rider name is required.' });
  } else if (input.rider_name.trim().length > 200) {
    errors.push({ field: 'rider_name', message: 'Rider name must be less than 200 characters.' });
  }

  if (input.phone && input.phone.trim().length > 20) {
    errors.push({ field: 'phone', message: 'Phone number must be less than 20 characters.' });
  }

  if (input.email && input.email.trim().length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
      errors.push({ field: 'email', message: 'Invalid email format.' });
    }
  }

  return errors;
}

/**
 * Validates service category input.
 */
export function validateServiceInput(input: {
  name?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required.' });
  } else if (input.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Name must be less than 100 characters.' });
  }

  return errors;
}

/**
 * Sanitize a string to prevent XSS (strip HTML tags).
 */
export function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}
