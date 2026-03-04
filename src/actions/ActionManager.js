import ClickAction from './ClickAction.js';
import FillAction from './FillAction.js';
import SelectAction from './SelectAction.js';
import NavigateAction from './NavigateAction.js';
import AssertAction from './AssertAction.js';
import logger from '../utils/Logger.js';

/**
 * Action Manager - Central orchestrator for all action/assertion operations
 * Provides a unified interface to access all action classes
 */
class ActionManager {
  constructor(page) {
    this.page = page;
    this.clickAction = new ClickAction(page);
    this.fillAction = new FillAction(page);
    this.selectAction = new SelectAction(page);
    this.navigateAction = new NavigateAction(page);
    this.assertAction = new AssertAction(page);

    logger.info('ActionManager initialized with all action classes');
  }

  /**
   * Execute action based on action name from feature file
   * @param {string} actionName - Name of action (CLICK, FILL, SELECT, NAVIGATE, ASSERT, etc.)
   * @param {Object} locatorObj - Locator object from Excel
   * @param {*} value - Value to use for action (if applicable)
   * @returns {Promise<*>} Result of action execution
   * @throws {Error} If action fails or is not recognized
   */
  async executeAction(actionName, locatorObj, value = null) {
    try {
      const action = actionName.toUpperCase().trim();

      logger.debug(`Executing action: ${action} for ${locatorObj.pageName}.${locatorObj.elementName}`);

      // Click Actions
      if (action === 'CLICK') {
        return await this.clickAction.click(locatorObj);
      } else if (action === 'DOUBLE_CLICK' || action === 'DOUBLECLICK') {
        return await this.clickAction.doubleClick(locatorObj);
      } else if (action === 'RIGHT_CLICK' || action === 'RIGHTCLICK') {
        return await this.clickAction.rightClick(locatorObj);
      } else if (action === 'FORCE_CLICK' || action === 'FORCECLICK') {
        return await this.clickAction.forceClick(locatorObj);
      }

      // Fill/Input Actions
      else if (action === 'FILL') {
        if (!value) throw new Error('Value is required for FILL action');
        return await this.fillAction.fill(locatorObj, value);
      } else if (action === 'CLEAR') {
        return await this.fillAction.clear(locatorObj);
      } else if (action === 'TYPE') {
        if (!value) throw new Error('Value is required for TYPE action');
        return await this.fillAction.type(locatorObj, value);
      } else if (action === 'APPEND_TEXT' || action === 'APPENDTEXT') {
        if (!value) throw new Error('Value is required for APPEND_TEXT action');
        return await this.fillAction.appendText(locatorObj, value);
      } else if (action === 'GET_VALUE' || action === 'GETVALUE') {
        return await this.fillAction.getValue(locatorObj);
      }

      // Select/Dropdown Actions
      else if (action === 'SELECT' || action === 'SELECT_BY_VALUE' || action === 'SELECTBYVALUE') {
        if (!value) throw new Error('Value is required for SELECT action');
        return await this.selectAction.selectByValue(locatorObj, value);
      } else if (action === 'SELECT_BY_TEXT' || action === 'SELECTBYTEXT') {
        if (!value) throw new Error('Value is required for SELECT_BY_TEXT action');
        return await this.selectAction.selectByText(locatorObj, value);
      } else if (action === 'SELECT_BY_INDEX' || action === 'SELECTBYINDEX') {
        if (value === null || value === undefined) throw new Error('Index is required for SELECT_BY_INDEX action');
        return await this.selectAction.selectByIndex(locatorObj, parseInt(value));
      }

      // Navigation Actions
      else if (action === 'NAVIGATE') {
        if (!value) throw new Error('URL is required for NAVIGATE action');
        return await this.navigateAction.navigateTo(value);
      } else if (action === 'NAVIGATE_TO_PAGE' || action === 'NAVIGATETOPAGE') {
        return await this.navigateAction.navigateToPage(value);
      } else if (action === 'GO_BACK' || action === 'GOBACK') {
        return await this.navigateAction.goBack();
      } else if (action === 'GO_FORWARD' || action === 'GOFORWARD') {
        return await this.navigateAction.goForward();
      } else if (action === 'REFRESH') {
        return await this.navigateAction.refresh();
      }

      // Assertion Actions
      else if (action === 'ASSERT_TEXT_PRESENT' || action === 'ASSERTTEXTPRESENT') {
        if (!value) throw new Error('Text is required for ASSERT_TEXT_PRESENT action');
        return await this.assertAction.assertTextPresent(value);
      } else if (action === 'ASSERT_TEXT_NOT_PRESENT' || action === 'ASSERTTEXTNOTPRESENT') {
        if (!value) throw new Error('Text is required for ASSERT_TEXT_NOT_PRESENT action');
        return await this.assertAction.assertTextNotPresent(value);
      } else if (action === 'ASSERT_ELEMENT_VISIBLE' || action === 'ASSERTELEMENTVISIBLE') {
        return await this.assertAction.assertElementVisible(locatorObj);
      } else if (action === 'ASSERT_ELEMENT_NOT_VISIBLE' || action === 'ASSERTELEMENTNOTVISIBLE') {
        return await this.assertAction.assertElementNotVisible(locatorObj);
      } else if (action === 'ASSERT_ELEMENT_EXISTS' || action === 'ASSERTELEMENTEXISTS') {
        return await this.assertAction.assertElementExists(locatorObj);
      } else if (action === 'ASSERT_ELEMENT_NOT_EXISTS' || action === 'ASSERTELEMENTNOTEXISTS') {
        return await this.assertAction.assertElementNotExists(locatorObj);
      } else if (action === 'ASSERT_ELEMENT_TEXT' || action === 'ASSERTELEMENTTEXT') {
        if (!value) throw new Error('Expected text is required for ASSERT_ELEMENT_TEXT action');
        return await this.assertAction.assertElementText(locatorObj, value);
      } else if (action === 'ASSERT_ELEMENT_ENABLED' || action === 'ASSERTELEMENTENABLED') {
        return await this.assertAction.assertElementEnabled(locatorObj);
      } else if (action === 'ASSERT_URL_CONTAINS' || action === 'ASSERTURLCONTAINS') {
        if (!value) throw new Error('URL is required for ASSERT_URL_CONTAINS action');
        return await this.assertAction.assertUrlContains(value);
      } else {
        const error = `Unknown action: ${action}`;
        logger.error(error);
        throw new Error(error);
      }

    } catch (error) {
      logger.error(`Failed to execute action ${actionName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get action handler for a specific action type
   * @param {string} actionType - Type of action
   * @returns {Object} Action handler object
   */
  getActionHandler(actionType) {
    const type = actionType.toUpperCase();

    if (type.includes('CLICK')) return this.clickAction;
    if (type.includes('FILL') || type.includes('TYPE') || type.includes('CLEAR')) return this.fillAction;
    if (type.includes('SELECT')) return this.selectAction;
    if (type.includes('NAVIGATE') || type.includes('GO_') || type.includes('REFRESH')) return this.navigateAction;
    if (type.includes('ASSERT')) return this.assertAction;

    throw new Error(`No handler found for action type: ${actionType}`);
  }
}

export default ActionManager;
