import BaseAction from './BaseAction.js';
import logger from '../utils/Logger.js';

/**
 * Select Action - Handles all select/dropdown interactions
 */
class SelectAction extends BaseAction {
  /**
   * Select option by value from a select element
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} value - Value to select
   * @returns {Promise<void>}
   * @throws {Error} If select fails
   */
  async selectByValue(locatorObj, value) {
    try {
      this._logAction('SELECT_BY_VALUE', locatorObj, { value });

      if (!value) {
        throw new Error('Value to select cannot be empty');
      }

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);

      // Check if it's a HTML select element
      const tagName = await locator.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'select') {
        await locator.selectOption(value);
      } else {
        // For custom dropdowns, click and select
        await locator.click();
        await this.page.waitForTimeout(200);
        
        // Look for option with matching text or value
        const optionLocator = this.page.locator(`text="${value}"`).first();
        await optionLocator.click();
      }

      logger.info(`Successfully selected '${value}' from ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'SELECT_BY_VALUE', locatorObj);
    }
  }

  /**
   * Select option by text from a select element
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} text - Text to select
   * @returns {Promise<void>}
   * @throws {Error} If select fails
   */
  async selectByText(locatorObj, text) {
    try {
      this._logAction('SELECT_BY_TEXT', locatorObj, { text });

      if (!text) {
        throw new Error('Text to select cannot be empty');
      }

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);

      // Check if it's a HTML select element
      const tagName = await locator.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'select') {
        // For native select, use selectOption with text/label
        await locator.selectOption({ label: text });
      } else {
        // For custom dropdowns
        await locator.click();
        await this.page.waitForTimeout(200);
        
        const optionLocator = this.page.locator(`text="${text}"`).first();
        await optionLocator.click();
      }

      logger.info(`Successfully selected option with text '${text}' from ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'SELECT_BY_TEXT', locatorObj);
    }
  }

  /**
   * Select option by index from a select element
   * @param {Object} locatorObj - Locator object from Excel
   * @param {number} index - Index of option to select (0-based)
   * @returns {Promise<void>}
   * @throws {Error} If select fails
   */
  async selectByIndex(locatorObj, index) {
    try {
      this._logAction('SELECT_BY_INDEX', locatorObj, { index });

      if (index < 0) {
        throw new Error('Index cannot be negative');
      }

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);

      // Get all options
      const options = await locator.locator('option').count();
      
      if (index >= options) {
        throw new Error(`Index ${index} exceeds available options (${options})`);
      }

      const tagName = await locator.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'select') {
        const optionValue = await locator.locator('option').nth(index).getAttribute('value');
        await locator.selectOption(optionValue);
      } else {
        // For custom dropdowns
        await locator.click();
        await this.page.waitForTimeout(200);
        
        const optionLocator = locator.locator('..').locator('[role="option"]').nth(index);
        await optionLocator.click();
      }

      logger.info(`Successfully selected option at index ${index} from ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'SELECT_BY_INDEX', locatorObj);
    }
  }

  /**
   * Get all options from a select element
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<Array>} Array of option values
   */
  async getAllOptions(locatorObj) {
    try {
      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);

      const tagName = await locator.evaluate(el => el.tagName.toLowerCase());
      
      let options = [];
      
      if (tagName === 'select') {
        options = await locator.locator('option').allTextContents();
      } else {
        // For custom dropdowns
        await locator.click();
        await this.page.waitForTimeout(200);
        
        const optionElements = await this.page.locator('[role="option"]').allTextContents();
        options = optionElements;
        
        // Close dropdown by pressing Escape
        await this.page.keyboard.press('Escape');
      }

      logger.info(`Retrieved ${options.length} options from ${locatorObj.pageName}.${locatorObj.elementName}`);
      return options;

    } catch (error) {
      logger.error(`Failed to get all options: ${error.message}`);
      return [];
    }
  }

  /**
   * Get selected option value
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<string>} Selected value
   */
  async getSelectedValue(locatorObj) {
    try {
      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);

      const tagName = await locator.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'select') {
        return await locator.inputValue();
      } else {
        // For custom dropdowns, get the displayed text
        return await locator.textContent();
      }

    } catch (error) {
      logger.warn(`Failed to get selected value: ${error.message}`);
      return null;
    }
  }

  /**
   * Get selected option text
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<string>} Selected text
   */
  async getSelectedText(locatorObj) {
    try {
      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);

      const tagName = await locator.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'select') {
        const selectedValue = await locator.inputValue();
        const selectedOption = locator.locator(`option[value="${selectedValue}"]`);
        return await selectedOption.textContent();
      } else {
        return await locator.textContent();
      }

    } catch (error) {
      logger.warn(`Failed to get selected text: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if option is available in select
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} optionValue - Option value to check
   * @returns {Promise<boolean>}
   */
  async isOptionAvailable(locatorObj, optionValue) {
    try {
      const options = await this.getAllOptions(locatorObj);
      return options.includes(optionValue);

    } catch (error) {
      logger.warn(`Failed to check if option is available: ${error.message}`);
      return false;
    }
  }

  /**
   * Select option from custom dropdown using specific selector
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} optionSelector - Selector for the option to click
   * @returns {Promise<void>}
   */
  async selectCustomOption(locatorObj, optionSelector) {
    try {
      this._logAction('SELECT_CUSTOM_OPTION', locatorObj, { optionSelector });

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);

      // Click the dropdown
      await locator.click();
      await this.page.waitForTimeout(200);

      // Click the specific option
      const optionLocator = this.page.locator(optionSelector);
      await optionLocator.click();

      logger.info(`Successfully selected custom option from ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'SELECT_CUSTOM_OPTION', locatorObj);
    }
  }

  /**
   * Multi-select option
   * @param {Object} locatorObj - Locator object from Excel
   * @param {Array<string>} values - Array of values to select
   * @returns {Promise<void>}
   */
  async selectMultiple(locatorObj, values) {
    try {
      this._logAction('SELECT_MULTIPLE', locatorObj, { valuesCount: values.length });

      if (!Array.isArray(values) || values.length === 0) {
        throw new Error('Values array cannot be empty');
      }

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);

      const tagName = await locator.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'select') {
        // Check if it has multiple attribute
        const isMultiple = await locator.evaluate(el => el.multiple);
        
        if (!isMultiple) {
          throw new Error('Select element does not support multiple selection');
        }

        // Select all values
        for (const value of values) {
          await locator.selectOption(value);
        }
      } else {
        // For custom dropdowns
        for (const value of values) {
          await locator.click();
          await this.page.waitForTimeout(200);
          
          const optionLocator = this.page.locator(`text="${value}"`).first();
          await optionLocator.click();
          await this.page.waitForTimeout(100);
        }
      }

      logger.info(`Successfully selected ${values.length} options from ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'SELECT_MULTIPLE', locatorObj);
    }
  }
}

export default SelectAction;
