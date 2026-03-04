import BaseAction from './BaseAction.js';
import logger from '../utils/Logger.js';

/**
 * Fill Action - Handles all text input interactions
 */
class FillAction extends BaseAction {
  /**
   * Fill text in an input field
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} value - Value to fill
   * @returns {Promise<void>}
   * @throws {Error} If fill fails
   */
  async fill(locatorObj, value) {
    try {
      this._logAction('FILL', locatorObj, { value: value.substring(0, 50) }); // Log only first 50 chars for security

      if (!value) {
        throw new Error('Value to fill cannot be empty');
      }

      const locator = await this.getElementLocator(locatorObj);
      
      // Wait for element to be ready
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);

      // Clear existing value first
      await locator.clear();

      // Wait a moment for clear operation
      await this.page.waitForTimeout(100);

      // Fill the value
      await locator.fill(value);

      // Verify the value was filled (optional but recommended)
      const filledValue = await locator.inputValue();
      if (filledValue !== value) {
        logger.warn(`Filled value doesn't match expected value for ${locatorObj.pageName}.${locatorObj.elementName}`);
      }

      logger.info(`Successfully filled ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'FILL', locatorObj);
    }
  }

  /**
   * Append text to an input field (without clearing existing value)
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} value - Value to append
   * @returns {Promise<void>}
   * @throws {Error} If append fails
   */
  async appendText(locatorObj, value) {
    try {
      this._logAction('APPEND_TEXT', locatorObj, { value: value.substring(0, 50) });

      if (!value) {
        throw new Error('Value to append cannot be empty');
      }

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);

      // Type the value without clearing
      await locator.type(value);

      logger.info(`Successfully appended text to ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'APPEND_TEXT', locatorObj);
    }
  }

  /**
   * Clear an input field
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<void>}
   * @throws {Error} If clear fails
   */
  async clear(locatorObj) {
    try {
      this._logAction('CLEAR', locatorObj);

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);

      // Triple click to select all and then delete
      await locator.click({ clickCount: 3 });
      await this.page.waitForTimeout(50);
      await locator.fill('');

      logger.info(`Successfully cleared ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'CLEAR', locatorObj);
    }
  }

  /**
   * Type text character by character (slower, better for some scenarios)
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} value - Value to type
   * @param {number} delay - Delay between characters in ms
   * @returns {Promise<void>}
   * @throws {Error} If type fails
   */
  async type(locatorObj, value, delay = 50) {
    try {
      this._logAction('TYPE', locatorObj, { value: value.substring(0, 50), delay });

      if (!value) {
        throw new Error('Value to type cannot be empty');
      }

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);
      
      // Clear first
      await locator.clear();
      await this.page.waitForTimeout(100);

      // Type with delay
      await locator.type(value, { delay });

      logger.info(`Successfully typed text in ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'TYPE', locatorObj);
    }
  }

  /**
   * Get current value of an input field
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<string>} The current value
   */
  async getValue(locatorObj) {
    try {
      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);

      return await locator.inputValue();

    } catch (error) {
      logger.warn(`Failed to get value for ${locatorObj.pageName}.${locatorObj.elementName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if input field has a value
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<boolean>}
   */
  async hasValue(locatorObj) {
    try {
      const value = await this.getValue(locatorObj);
      return value && value.trim().length > 0;

    } catch {
      return false;
    }
  }

  /**
   * Set input value using JavaScript (sometimes more reliable)
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} value - Value to set
   * @returns {Promise<void>}
   */
  async setValueViaJS(locatorObj, value) {
    try {
      this._logAction('SET_VALUE_VIA_JS', locatorObj, { value: value.substring(0, 50) });

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);

      // Set value using JavaScript
      await this.page.evaluate(({ selector, newValue }) => {
        const element = document.querySelector(selector);
        if (element) {
          element.value = newValue;
          // Trigger input and change events
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, { selector: locatorObj.locatorValue, newValue: value });

      logger.info(`Successfully set value via JS for ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'SET_VALUE_VIA_JS', locatorObj);
    }
  }

  /**
   * Verify input field value
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} expectedValue - Expected value
   * @returns {Promise<boolean>}
   */
  async verifyValue(locatorObj, expectedValue) {
    try {
      const actualValue = await this.getValue(locatorObj);
      const isMatch = actualValue === expectedValue;

      if (!isMatch) {
        logger.warn(`Value mismatch for ${locatorObj.pageName}.${locatorObj.elementName}`, {
          expected: expectedValue,
          actual: actualValue
        });
      }

      return isMatch;

    } catch (error) {
      logger.error(`Failed to verify value: ${error.message}`);
      return false;
    }
  }
}

export default FillAction;
