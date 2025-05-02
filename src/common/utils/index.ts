/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-01 19:11:10
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-02 12:53:31
 * @FilePath: /shareholder_services/src/common/utils/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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

export const createVerificationId = (address: string) => {
  const verificationKey = `verified-address:${address.toLowerCase()}`;
  return verificationKey;
};
