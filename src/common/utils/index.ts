export function tryJsonParse<T = any>(
  jsonString: string,
  defaultValue: T | null = null,
): T | null {
  try {
    // Check if the string is potentially valid JSON before parsing
    if (typeof jsonString === 'string' && jsonString.trim().length > 0) {
      return JSON.parse(jsonString) as T;
    }
    return defaultValue;
  } catch (error) {
    // Optionally log the error for debugging purposes
    // console.error('Failed to parse JSON string:', error);
    return defaultValue;
  }
}

export function tryJsonStringify(
  value: any,
  defaultValue: string = '',
): string {
  try {
    // Check if the value is valid before attempting to stringify
    if (value === undefined || typeof value === 'function') {
      // JSON.stringify returns undefined for undefined or functions directly
      // Handle these cases explicitly if needed, or let JSON.stringify handle them
      // Depending on desired behavior, you might return defaultValue here
    }
    return JSON.stringify(value);
  } catch (error) {
    // Handle errors, e.g., circular references
    // Optionally log the error for debugging purposes
    // console.error('Failed to stringify value:', error);
    return defaultValue;
  }
}
