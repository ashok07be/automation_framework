import BaseAction from './BaseAction.js';
import logger from '../utils/Logger.js';

/**
 * Click Action - Handles all click interactions
 */
class ClickAction extends BaseAction {
  /**
   * Click on an element
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<void>}
   * @throws {Error} If click fails
   */
  async click(locatorObj) {
    try {
      this._logAction('CLICK', locatorObj);

      const locator = await this.getElementLocator(locatorObj);
      
      // Wait for element to be ready
      await this.waitForElement(locator, locatorObj.timeout);

      // Scroll into view to ensure visibility
      await this.scrollIntoView(locator);

      // Small delay to allow any animations
      await this.page.waitForTimeout(100);

      // Click the element
      await locator.click({ force: false });

      logger.info(`Successfully clicked ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'CLICK', locatorObj);
    }
  }

  /**
   * Double click on an element
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<void>}
   * @throws {Error} If double click fails
   */
  async doubleClick(locatorObj) {
    try {
      this._logAction('DOUBLE_CLICK', locatorObj);

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);
      await this.page.waitForTimeout(100);

      await locator.dblclick();

      logger.info(`Successfully double clicked ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'DOUBLE_CLICK', locatorObj);
    }
  }

  /**
   * Right click (context menu) on an element
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<void>}
   * @throws {Error} If right click fails
   */
  async rightClick(locatorObj) {
    try {
      this._logAction('RIGHT_CLICK', locatorObj);

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);

      await locator.click({ button: 'right' });

      logger.info(`Successfully right clicked ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'RIGHT_CLICK', locatorObj);
    }
  }

  /**
   * Click with modifiers (Shift, Ctrl, Alt, Meta)
   * @param {Object} locatorObj - Locator object from Excel
   * @param {Object} modifiers - Modifiers object {shift, control, alt, meta}
   * @returns {Promise<void>}
   * @throws {Error} If click fails
   */
  async clickWithModifiers(locatorObj, modifiers = {}) {
    try {
      this._logAction('CLICK_WITH_MODIFIERS', locatorObj, { modifiers });

      const locator = await this.getElementLocator(locatorObj);
      
      await this.waitForElement(locator, locatorObj.timeout);
      await this.scrollIntoView(locator);
      await this.page.waitForTimeout(100);

      // Build modifier array
      const modifierArray = [];
      if (modifiers.shift) modifierArray.push('Shift');
      if (modifiers.control || modifiers.ctrl) modifierArray.push('Control');
      if (modifiers.alt) modifierArray.push('Alt');
      if (modifiers.meta) modifierArray.push('Meta');

      await locator.click({ 
        modifiers: modifierArray.length > 0 ? modifierArray : undefined,
        force: false
      });

      logger.info(`Successfully clicked with modifiers ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'CLICK_WITH_MODIFIERS', locatorObj);
    }
  }

  /**
   * Force click (bypasses visibility checks)
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<void>}
   * @throws {Error} If click fails
   */
  async forceClick(locatorObj) {
    try {
      this._logAction('FORCE_CLICK', locatorObj);

      const locator = await this.getElementLocator(locatorObj);

      await locator.click({ force: true });

      logger.info(`Successfully force clicked ${locatorObj.pageName}.${locatorObj.elementName}`);

    } catch (error) {
      this._handleError(error, 'FORCE_CLICK', locatorObj);
    }
  }

  /**
   * Check if element is clickable
   * @param {Object} locatorObj - Locator object from Excel
   * @returns {Promise<boolean>}
   */
  async isClickable(locatorObj) {
    try {
      const locator = await this.getElementLocator(locatorObj);
      
      const exists = await this.elementExists(locator);
      if (!exists) {
        logger.warn(`Element ${locatorObj.pageName}.${locatorObj.elementName} does not exist`);
        return false;
      }

      const isVisible = await this.isElementVisible(locator);
      const isEnabled = await this.page.evaluate(
        el => !el.disabled,
        await locator.elementHandle()
      ).catch(() => true);

      return isVisible && isEnabled;

    } catch (error) {
      logger.warn(`Failed to check if element is clickable: ${error.message}`);
      return false;
    }
  }
}

export default ClickAction;
