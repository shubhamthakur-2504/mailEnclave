/**
 * Sanitizes error objects by removing sensitive data like API keys
 * Prevents accidental exposure of credentials in logs
 */
export function sanitizeError(err: any): any {
  if (!err) return err;

  // If it's a simple error, clone it
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      code: (err as any).code,
    };
  }

  // If it's an axios error with request details
  if (err?.request) {
    return {
      name: err.name || 'Error',
      message: err.message,
      code: err.code,
      status: err.response?.status,
      response: {
        status: err.response?.status,
        statusText: err.response?.statusText,
      },
    };
  }

  // For other objects, try to extract safe properties
  if (typeof err === 'object') {
    const safe: any = {};
    const allowedKeys = ['name', 'message', 'code', 'errno', 'syscall', 'status', 'statusCode'];

    for (const key of allowedKeys) {
      if (key in err) {
        safe[key] = err[key];
      }
    }

    // If we found any allowed keys, return the sanitized object
    if (Object.keys(safe).length > 0) {
      return safe;
    }

    // Otherwise, convert to string representation
    return String(err);
  }

  return err;
}
