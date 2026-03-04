import logger from './Logger.js';

/**
 * IFrame Handler - transparently handles elements inside iframes
 * without requiring separate function calls for iframe operations
 */
class IFrameHandler {
  /**
   * Get element locator considering iframe hierarchy
   * @param {Page} page - Playwright page object
   * @param {Object} locatorObj - Locator object containing iframe and element info
   * @returns {Locator} Playwright locator object
   * @throws {Error} If element not found
   */
  static async getElementLocator(page, locatorObj) {
    try {
      const {
        locatorStrategy,
        locatorValue,
        iframeLocator,
        parentLocator,
        elementName,
        pageName,
      } = locatorObj;

      let targetLocator = null;

      // If element is inside an iframe
      if (iframeLocator) {
        logger.debug(`Element '${elementName}' is inside iframe: ${iframeLocator}`);
        
        // Parse iframe locator
        const iframeStrategyAndValue = this._parseLocatorString(iframeLocator);
        const iframeFrameLocator = page.frameLocator(
          this._getPlaywrightSelector(
            iframeStrategyAndValue.strategy,
            iframeStrategyAndValue.value
          )
        );

        // If there's a parent element selector within the iframe
        if (parentLocator) {
          logger.debug(`Using parent locator inside iframe: ${parentLocator}`);
          const parentStrategyAndValue = this._parseLocatorString(parentLocator);
          const parentLocator_ = iframeFrameLocator.locator(
            this._getPlaywrightSelector(
              parentStrategyAndValue.strategy,
              parentStrategyAndValue.value
            )
          );

          // Get the actual element
          targetLocator = parentLocator_.locator(
            this._getPlaywrightSelector(locatorStrategy, locatorValue)
          );
        } else {
          // Get element directly from iframe
          targetLocator = iframeFrameLocator.locator(
            this._getPlaywrightSelector(locatorStrategy, locatorValue)
          );
        }
      } else {
        // Element is NOT inside an iframe - use direct page locator
        targetLocator = page.locator(
          this._getPlaywrightSelector(locatorStrategy, locatorValue)
        );
      }

      logger.debug(
        `Successfully created locator for ${pageName}.${elementName}`,
        { strategy: locatorStrategy, value: locatorValue }
      );

      return targetLocator;

    } catch (error) {
      logger.error(`Failed to get element locator: ${error.message}`, { 
        error,
        locatorObj 
      });
      throw error;
    }
  }

  /**
   * Wait for element to be visible and attached to DOM
   * @param {Locator} locator - Playwright locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  static async waitForElement(locator, timeout = 30000) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      logger.debug('Element is visible and ready for interaction');
    } catch (error) {
      logger.error(`Element not visible within timeout: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Check if element exists and is visible
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<boolean>} True if element is visible
   */
  static async isElementVisible(locator) {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element exists (attached to DOM)
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<boolean>} True if element exists
   */
  static async elementExists(locator) {
    try {
      return await locator.count() > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get element count
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<number>} Number of matching elements
   */
  static async getElementCount(locator) {
    try {
      return await locator.count();
    } catch (error) {
      logger.warn(`Failed to get element count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Parse locator string in format "strategy#value"
   * Supports: id#, css., xpath=//, class#, text=, role=
   * @param {string} locatorString - Locator string
   * @returns {Object} Object with strategy and value
   * @private
   */
  static _parseLocatorString(locatorString) {
    if (locatorString.includes('id#')) {
      return {
        strategy: 'id',
        value: locatorString.replace('id#', ''),
      };
    } else if (locatorString.startsWith('css.')) {
      return {
        strategy: 'css',
        value: locatorString.replace('css.', ''),
      };
    } else if (locatorString.startsWith('xpath=')) {
      return {
        strategy: 'xpath',
        value: locatorString.replace('xpath=', ''),
      };
    } else if (locatorString.includes('class#')) {
      return {
        strategy: 'class',
        value: locatorString.replace('class#', ''),
      };
    } else if (locatorString.startsWith('text=')) {
      return {
        strategy: 'text',
        value: locatorString.replace('text=', ''),
      };
    } else if (locatorString.startsWith('role=')) {
      return {
        strategy: 'role',
        value: locatorString.replace('role=', ''),
      };
    }

    // Default to CSS if no prefix
    return { strategy: 'css', value: locatorString };
  }

  /**
   * Convert locator strategy to Playwright selector
   * @param {string} strategy - Locator strategy (id, css, xpath, class, text, role, getByRole, getByText, getByLabel, getByPlaceholder)
   * @param {string} value - Locator value
   * @returns {string} Playwright selector string
   * @private
   */
  static _getPlaywrightSelector(strategy, value) {
    const normalizedStrategy = strategy.toLowerCase().trim();

    switch (normalizedStrategy) {
      case 'id':
        return `#${value}`;
      
      case 'css':
      case 'cssselector':
        return value;
      
      case 'xpath':
        return value; // XPath selectors work directly in Playwright
      
      case 'class':
        return `.${value}`;
      
      case 'text':
      case 'getbytext':
        return `text=${value}`;
      
      case 'role':
      case 'getbyrole':
        return `role=${value}`;
      
      case 'label':
      case 'getbylabel':
        return `text=${value}`; // Can be improved with proper role-based selection
      
      case 'placeholder':
      case 'getbyplaceholder':
        return `[placeholder="${value}"]`;
      
      case 'testid':
      case 'getbytestid':
        return `[data-testid="${value}"]`;
      
      default:
        logger.warn(`Unknown locator strategy: ${strategy}, defaulting to CSS selector`);
        return value;
    }
  }

  /**
   * Scroll element into view
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<void>}
   */
  static async scrollIntoView(locator) {
    try {
      await locator.scrollIntoViewIfNeeded();
      logger.debug('Element scrolled into view');
    } catch (error) {
      logger.warn(`Failed to scroll element: ${error.message}`);
    }
  }

  /**
   * Get element's bounding box
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<Object>} Bounding box object {x, y, width, height}
   */
  static async getBoundingBox(locator) {
    try {
      return await locator.boundingBox();
    } catch (error) {
      logger.warn(`Failed to get bounding box: ${error.message}`);
      return null;
    }
  }

  /**
   * Get element's attribute value
   * @param {Locator} locator - Playwright locator
   * @param {string} attributeName - Attribute name
   * @returns {Promise<string>} Attribute value
   */
  static async getAttribute(locator, attributeName) {
    try {
      return await locator.getAttribute(attributeName);
    } catch (error) {
      logger.warn(`Failed to get attribute '${attributeName}': ${error.message}`);
      return null;
    }
  }

  /**
   * Get element's text content
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<string>} Text content
   */
  static async getTextContent(locator) {
    try {
      return await locator.textContent();
    } catch (error) {
      logger.warn(`Failed to get text content: ${error.message}`);
      return null;
    }
  }

  /**
   * Get element's inner text
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<string>} Inner text
   */
  static async getInnerText(locator) {
    try {
      return await locator.innerText();
    } catch (error) {
      logger.warn(`Failed to get inner text: ${error.message}`);
      return null;
    }
  }

  /**
   * Get element's input value
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<string>} Input value
   */
  static async getInputValue(locator) {
    try {
      return await locator.inputValue();
    } catch (error) {
      logger.warn(`Failed to get input value: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if element is enabled
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<boolean>} True if element is enabled
   */
  static async isElementEnabled(locator) {
    try {
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is disabled
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<boolean>} True if element is disabled
   */
  static async isElementDisabled(locator) {
    try {
      return !(await locator.isEnabled());
    } catch {
      return true;
    }
  }

  /**
   * Check checkbox or radio button
   * @param {Locator} locator - Playwright locator
   * @returns {Promise<boolean>} True if element is checked
   */
  static async isElementChecked(locator) {
    try {
      return await locator.isChecked();
    } catch {
      return false;
    }
  }
}

export default IFrameHandler;
