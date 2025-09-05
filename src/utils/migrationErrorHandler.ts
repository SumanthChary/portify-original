// Comprehensive error handler for migration processes
export interface MigrationError {
  code: string;
  message: string;
  details?: any;
  userFriendlyMessage: string;
  recoverable: boolean;
}

export class MigrationErrorHandler {
  static handleError(error: any): MigrationError {
    // RLS policy violations
    if (error.message?.includes('row-level security policy')) {
      return {
        code: 'RLS_VIOLATION',
        message: error.message,
        userFriendlyMessage: 'Authentication required. Please log in and try again.',
        recoverable: true
      };
    }

    // Check constraint violations
    if (error.message?.includes('check constraint')) {
      if (error.message.includes('status_check')) {
        return {
          code: 'INVALID_STATUS',
          message: error.message,
          userFriendlyMessage: 'Invalid migration status. Please try again.',
          recoverable: true
        };
      }
      return {
        code: 'CONSTRAINT_VIOLATION',
        message: error.message,
        userFriendlyMessage: 'Invalid data provided. Please check your inputs.',
        recoverable: true
      };
    }

    // Network/API errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return {
        code: 'NETWORK_ERROR',
        message: error.message,
        userFriendlyMessage: 'Network error. Please check your connection and try again.',
        recoverable: true
      };
    }

    // Authentication errors
    if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
      return {
        code: 'AUTH_ERROR',
        message: error.message,
        userFriendlyMessage: 'Authentication failed. Please log in and try again.',
        recoverable: true
      };
    }

    // API key errors
    if (error.message?.includes('API key') || error.message?.includes('Invalid credentials')) {
      return {
        code: 'INVALID_CREDENTIALS',
        message: error.message,
        userFriendlyMessage: 'Invalid API key or credentials. Please check and try again.',
        recoverable: true
      };
    }

    // CORS errors
    if (error.message?.includes('CORS') || error.message?.includes('blocked by CORS')) {
      return {
        code: 'CORS_ERROR',
        message: error.message,
        userFriendlyMessage: 'Network configuration error. Our team has been notified.',
        recoverable: false
      };
    }

    // Database errors
    if (error.message?.includes('database') || error.message?.includes('relation')) {
      return {
        code: 'DATABASE_ERROR',
        message: error.message,
        userFriendlyMessage: 'Database error. Please try again later.',
        recoverable: false
      };
    }

    // Generic fallback
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      details: error,
      userFriendlyMessage: 'Something went wrong. Please try again.',
      recoverable: true
    };
  }

  static getRetryMessage(error: MigrationError): string {
    if (!error.recoverable) {
      return 'This error requires technical assistance. Please contact support.';
    }

    switch (error.code) {
      case 'RLS_VIOLATION':
      case 'AUTH_ERROR':
        return 'Please log in to your account and try again.';
      case 'INVALID_CREDENTIALS':
        return 'Please check your API key and credentials, then try again.';
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      case 'INVALID_STATUS':
        return 'Please refresh the page and start the migration again.';
      default:
        return 'Please wait a moment and try again.';
    }
  }

  static shouldRetry(error: MigrationError): boolean {
    return error.recoverable && !['INVALID_CREDENTIALS', 'AUTH_ERROR'].includes(error.code);
  }
}