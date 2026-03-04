import BaseAction from './BaseAction.js';
import logger from '../utils/Logger.js';

/**
 * Assert Action - Handles all assertion/verification operations
 */
class AssertAction extends BaseAction {
  /**
   * Assert that text is present on page
   * @param {string} text - Text to find
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertTextPresent(text) {
    try {
      logger.info(`[ASSERT] Checking if text is present: '${text}'`);

      const locator = this.page.locator(`text=${text}`);
      const count = await locator.count();

      if (count === 0) {
        const error = `Text '${text}' not found on page`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Text '${text}' found on page (${count} occurrence(s))`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert that text is NOT present on page
   * @param {string} text - Text to verify not found
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertTextNotPresent(text) {
    try {
      logger.info(`[ASSERT] Checking if text is NOT present: '${text}'`);

      const locator = this.page.locator(`text=${text}`);
      const count = await locator.count();

      if (count > 0) {
        const error = `Text '${text}' was found on page but should not be`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Text '${text}' is not present on page`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert that an element is visible
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementVisible(locatorObj) {
    try {
      logger.info(`[ASSERT] Checking if element is visible: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      const isVisible = await this.isElementVisible(locator);

      if (!isVisible) {
        const error = `Element ${locatorObj.pageName}.${locatorObj.elementName} is not visible`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element ${locatorObj.pageName}.${locatorObj.elementName} is visible`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert that an element is NOT visible
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementNotVisible(locatorObj) {
    try {
      logger.info(`[ASSERT] Checking if element is NOT visible: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      const isVisible = await this.isElementVisible(locator);

      if (isVisible) {
        const error = `Element ${locatorObj.pageName}.${locatorObj.elementName} is visible but should not be`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element ${locatorObj.pageName}.${locatorObj.elementName} is not visible`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert that an element exists in DOM
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementExists(locatorObj) {
    try {
      logger.info(`[ASSERT] Checking if element exists: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      const exists = await this.elementExists(locator);

      if (!exists) {
        const error = `Element ${locatorObj.pageName}.${locatorObj.elementName} does not exist in DOM`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element ${locatorObj.pageName}.${locatorObj.elementName} exists in DOM`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert that an element does NOT exist in DOM
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementNotExists(locatorObj) {
    try {
      logger.info(`[ASSERT] Checking if element does NOT exist: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      const exists = await this.elementExists(locator);

      if (exists) {
        const error = `Element ${locatorObj.pageName}.${locatorObj.elementName} exists in DOM but should not`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element ${locatorObj.pageName}.${locatorObj.elementName} does not exist in DOM`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert element text content
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} expectedText - Expected text content
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementText(locatorObj, expectedText) {
    try {
      logger.info(`[ASSERT] Checking element text: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      await this.waitForElement(locator, locatorObj.timeout);

      const actualText = await locator.textContent();

      if (actualText?.trim() !== expectedText?.trim()) {
        const error = `Text mismatch. Expected: '${expectedText}', Actual: '${actualText}'`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element text matches expected value: '${expectedText}'`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert element contains text
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} expectedText - Text that should be contained
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementContainsText(locatorObj, expectedText) {
    try {
      logger.info(`[ASSERT] Checking if element contains text: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      await this.waitForElement(locator, locatorObj.timeout);

      const actualText = await locator.textContent();

      if (!actualText?.includes(expectedText)) {
        const error = `Element does not contain text '${expectedText}'. Actual: '${actualText}'`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element contains expected text: '${expectedText}'`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert element attribute value
   * @param {Object} locatorObj - Locator object from Excel
   * @param {string} attributeName - Attribute name
   * @param {string} expectedValue - Expected attribute value
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementAttribute(locatorObj, attributeName, expectedValue) {
    try {
      logger.info(`[ASSERT] Checking element attribute: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      await this.waitForElement(locator, locatorObj.timeout);

      const actualValue = await locator.getAttribute(attributeName);

      if (actualValue !== expectedValue) {
        const error = `Attribute '${attributeName}' mismatch. Expected: '${expectedValue}', Actual: '${actualValue}'`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element attribute '${attributeName}' matches expected value: '${expectedValue}'`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert element is enabled
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementEnabled(locatorObj) {
    try {
      logger.info(`[ASSERT] Checking if element is enabled: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      const isEnabled = await locator.isEnabled();

      if (!isEnabled) {
        const error = `Element ${locatorObj.pageName}.${locatorObj.elementName} is not enabled`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element ${locatorObj.pageName}.${locatorObj.elementName} is enabled`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert element is disabled
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementDisabled(locatorObj) {
    try {
      logger.info(`[ASSERT] Checking if element is disabled: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      const isEnabled = await locator.isEnabled();

      if (isEnabled) {
        const error = `Element ${locatorObj.pageName}.${locatorObj.elementName} is enabled but should be disabled`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element ${locatorObj.pageName}.${locatorObj.elementName} is disabled`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert URL contains text
   * @param {string} expectedUrl - URL to check for
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertUrlContains(expectedUrl) {
    try {
      logger.info(`[ASSERT] Checking if URL contains: '${expectedUrl}'`);

      const currentUrl = this.page.url();

      if (!currentUrl.includes(expectedUrl)) {
        const error = `URL does not contain '${expectedUrl}'. Current: '${currentUrl}'`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`URL contains expected text: '${expectedUrl}'`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert page title
   * @param {string} expectedTitle - Expected page title
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertPageTitle(expectedTitle) {
    try {
      logger.info(`[ASSERT] Checking page title`);

      const actualTitle = await this.page.title();

      if (actualTitle !== expectedTitle) {
        const error = `Title mismatch. Expected: '${expectedTitle}', Actual: '${actualTitle}'`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Page title matches expected value: '${expectedTitle}'`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert element count
   * @param {Object} locatorObj - Locator object from Excel
   * @param {number} expectedCount - Expected number of elements
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementCount(locatorObj, expectedCount) {
    try {
      logger.info(`[ASSERT] Checking element count for ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      const actualCount = await this.getElementCount(locator);

      if (actualCount !== expectedCount) {
        const error = `Element count mismatch. Expected: ${expectedCount}, Actual: ${actualCount}`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element count matches expected value: ${expectedCount}`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert checkbox is checked
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementChecked(locatorObj) {
    try {
      logger.info(`[ASSERT] Checking if element is checked: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      const isChecked = await locator.isChecked();

      if (!isChecked) {
        const error = `Element ${locatorObj.pageName}.${locatorObj.elementName} is not checked`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element ${locatorObj.pageName}.${locatorObj.elementName} is checked`);
      return true;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Assert checkbox is not checked
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<boolean>}
   * @throws {Error} If assertion fails
   */
  async assertElementNotChecked(locatorObj) {
    try {
      logger.info(`[ASSERT] Checking if element is not checked: ${locatorObj.pageName}.${locatorObj.elementName}`);

      const locator = await this.getElementLocator(locatorObj);
      const isChecked = await locator.isChecked();

      if (isChecked) {
        const error = `Element ${locatorObj.pageName}.${locatorObj.elementName} is checked but should not be`;
        logger.error(error);
        throw new Error(error);
      }

      logger.info(`Element ${locatorObj.pageName}.${locatorObj.elementName} is not checked`);
      return true;

    } catch (error) {
      throw error;
    }
  }
}

export default AssertAction;
