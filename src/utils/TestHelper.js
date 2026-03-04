import logger from './Logger.js';

/**
 * Test Helper Utility - Common helper methods for tests
 */
class TestHelper {
  /**
   * Generate unique string
   * @param {string} prefix - Prefix for the unique string
   * @returns {string} Unique string
   */
  static generateUnique(prefix = 'test') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current date in specific format
   * @param {string} format - Date format (e.g., 'YYYY-MM-DD', 'MM/DD/YYYY')
   * @returns {string} Formatted date
   */
  static getCurrentDate(format = 'YYYY-MM-DD') {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Add days to current date
   * @param {number} days - Number of days to add
   * @param {string} format - Date format
   * @returns {string} Formatted date
   */
  static getDateAfterDays(days, format = 'YYYY-MM-DD') {
    const date = new Date();
    date.setDate(date.getDate() + days);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Generate random email
   * @param {string} domain - Email domain (default: example.com)
   * @returns {string} Random email
   */
  static generateRandomEmail(domain = 'example.com') {
    const randomString = Math.random().toString(36).substr(2, 9);
    return `user_${randomString}@${domain}`;
  }

  /**
   * Generate random password
   * @param {number} length - Password length (default: 12)
   * @returns {string} Random password
   */
  static generateRandomPassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delayMs - Initial delay in milliseconds
   * @returns {Promise<*>} Result of function
   */
  static async retry(fn, maxRetries = 3, delayMs = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;

        const delay = delayMs * Math.pow(2, i); // Exponential backoff
        logger.warn(`Retry attempt ${i + 1}/${maxRetries}, waiting ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }

  /**
   * Compare two objects
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} True if objects are equal
   */
  static deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  /**
   * Parse URL parameters
   * @param {string} url - URL to parse
   * @returns {Object} Parsed parameters
   */
  static parseUrlParams(url) {
    const params = {};
    const queryString = url.split('?')[1];

    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    }

    return params;
  }

  /**
   * Sanitize input for security
   * @param {string} input - Input to sanitize
   * @returns {string} Sanitized input
   */
  static sanitizeInput(input) {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/['"`]/g, ''); // Remove quotes
  }

  /**
   * Mask sensitive data for logging
   * @param {string} data - Data to mask
   * @param {number} visibleChars - Number of visible characters
   * @returns {string} Masked data
   */
  static maskSensitiveData(data, visibleChars = 4) {
    if (!data || data.length <= visibleChars) return data;
    const visible = data.substring(0, visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    return visible + masked;
  }
}

export default TestHelper;
