import logger from '../utils/Logger.js';
import IFrameHandler from '../utils/IFrameHandler.js';

/**
 * Base Action class - Provides common methods for all actions
 */
class BaseAction {
  constructor(page) {
    this.page = page;
  }

  /**
   * Get element locator from locator object
   * Handles iframe navigation transparently
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<Locator>} Playwright locator
   */
  async getElementLocator(locatorObj) {
    return await IFrameHandler.getElementLocator(this.page, locatorObj);
  }

  /**
   * Wait for element with timeout
   * @param {Locator} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForElement(locator, timeout) {
    await IFrameHandler.waitForElement(locator, timeout);
  }

  /**
   * Check if element is visible
   * @param {Locator} locator - Element locator
   * @returns {Promise<boolean>}
   */
  async isElementVisible(locator) {
    return await IFrameHandler.isElementVisible(locator);
  }

  /**
   * Check if element exists
   * @param {Locator} locator - Element locator
   * @returns {Promise<boolean>}
   */
  async elementExists(locator) {
    return await IFrameHandler.elementExists(locator);
  }

  /**
   * Scroll element into view
   * @param {Locator} locator - Element locator
   * @returns {Promise<void>}
   */
  async scrollIntoView(locator) {
    await IFrameHandler.scrollIntoView(locator);
  }

  /**
   * Get element count
   * @param {Locator} locator - Element locator
   * @returns {Promise<number>}
   */
  async getElementCount(locator) {
    return await IFrameHandler.getElementCount(locator);
  }

  /**
   * Log action execution
   * @param {string} action - Action name
   * @param {Object} locatorObj - Locator object
   * @param {*} additionalInfo - Additional information
   * @protected
   */
  _logAction(action, locatorObj, additionalInfo = null) {
    const message = `[${action}] ${locatorObj.pageName}.${locatorObj.elementName}`;
    const meta = { 
      page: locatorObj.pageName,
      element: locatorObj.elementName,
      strategy: locatorObj.locatorStrategy,
      ...additionalInfo 
    };
    logger.info(message, meta);
  }

  /**
   * Handle action error
   * @param {Error} error - The error
   * @param {string} action - Action name
   * @param {Object} locatorObj - Locator object
   * @protected
   */
  _handleError(error, action, locatorObj) {
    const message = `[${action}] Failed for ${locatorObj.pageName}.${locatorObj.elementName}`;
    logger.error(message, { 
      error: error.message,
      page: locatorObj.pageName,
      element: locatorObj.elementName
    });
    throw error;
  }
}

export default BaseAction;
