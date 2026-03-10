import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import WebContextManager from '../utils/WebContextManager.js';
import LocatorReader from '../readers/LocatorReader.js';
import TestDataReader from '../readers/TestDataReader.js';
import ActionManager from '../actions/ActionManager.js';
import configManager from '../config/ConfigurationManager.js';
import logger from '../utils/Logger.js';

// Set default timeout
setDefaultTimeout(60 * 1000);

// Global test variables
let webContextManager;
let locatorReader;
let testDataReader;
let actionManager;
let currentScenarioName;

/**
 * Before Hook - Runs before each scenario
 * Initializes browser, loads locators and test data
 */
Before(async function (scenario) {
  try {
    currentScenarioName = scenario.pickle.name;
    logger.info(`========== Starting Scenario: ${currentScenarioName} ==========`);

    // Validate configuration
    configManager.validate();

    // Initialize web context (browser)
    webContextManager = new WebContextManager();
    await webContextManager.initialize();

    // Initialize action manager
    actionManager = new ActionManager(webContextManager.getPage());

    // Initialize and load locators
    locatorReader = new LocatorReader();
    await locatorReader.load();
    logger.info(`Loaded ${locatorReader.getLocatorCount()} locators`);

    // Initialize and load test data
    testDataReader = new TestDataReader();
    await testDataReader.load();
    logger.info(`Loaded ${testDataReader.getTestDataCount()} test data entries`);

    // Store in world for access in steps
    this.webContextManager = webContextManager;
    this.actionManager = actionManager;
    this.locatorReader = locatorReader;
    this.testDataReader = testDataReader;
    this.page = webContextManager.getPage();
    this.currentScenarioName = currentScenarioName;

  } catch (error) {
    logger.error(`Failed to initialize test setup: ${error.message}`, { error });
    throw error;
  }
});

/**
 * After Hook - Runs after each scenario
 * Closes browser and takes screenshots on failure
 */
After(async function (scenario) {
  try {
    if (scenario.result.status === 'FAILED') {
      // Take screenshot on failure
      const timestamp = new Date().getTime();
      const screenshotPath = `./reports/failure_${currentScenarioName}_${timestamp}.png`;
      await webContextManager.takeScreenshot(screenshotPath);
      logger.warn(`Screenshot taken on failure: ${screenshotPath}`);
    }

    logger.info(`========== Scenario Result: ${scenario.result.status} ==========`);

  } catch (error) {
    logger.error(`Error in after hook: ${error.message}`, { error });
  } finally {
    // Always close browser
    if (webContextManager) {
      await webContextManager.close();
    }
  }
});

/**
 * Generic step to navigate to a page from locator file
 * Usage: NAVIGATE "PAGENAME"
 */
Given(/^NAVIGATE "([^"]*)"$/, async function (pageName) {
  try {
    logger.info(`[Step] NAVIGATE "${pageName}"`);
    await actionManager.navigateAction.navigateToPage(pageName);
  } catch (error) {
    logger.error(`Failed to navigate to page ${pageName}: ${error.message}`);
    throw error;
  }
});

/**
 * Generic step to navigate to a URL
 * Usage: NAVIGATE TO "https://example.com" or NAVIGATE TO "/login"
 */
Given(/^NAVIGATE TO "([^"]*)"$/, async function (url) {
  try {
    logger.info(`[Step] NAVIGATE TO "${url}"`);
    await actionManager.navigateAction.navigateTo(url);
  } catch (error) {
    logger.error(`Failed to navigate to ${url}: ${error.message}`);
    throw error;
  }
});

/**
 * Generic step to fill an input field with test data
 * Usage: FILL "elementName" or FILL "elementName" WITH "value"
 */
When(/^FILL "([^"]*)"(?: WITH "([^"]*)")?$/, async function (elementName, explicitValue) {
  try {
    logger.info(`[Step] FILL "${elementName}"`);

    // Get locator for the element
    const locatorObj = this.locatorReader.getLocator('LoginPage', elementName); // Default page, can be enhanced

    let value = explicitValue;

    // If no explicit value, try to get from test data
    if (!value) {
      value = this.testDataReader.getTestData(this.currentScenarioName, elementName);
    }

    if (!value) {
      throw new Error(`No value found for element: ${elementName}. Provide value in feature file or test data.`);
    }

    await this.actionManager.fillAction.fill(locatorObj, value);

  } catch (error) {
    logger.error(`Failed to fill element ${elementName}: ${error.message}`);
    throw error;
  }
});

/**
 * Generic step to click an element
 * Usage: CLICK "elementName"
 */
When(/^CLICK "([^"]*)"$/, async function (elementName) {
  try {
    logger.info(`[Step] CLICK "${elementName}"`);

    // Get locator for the element
    const locatorObj = this.locatorReader.getLocator('LoginPage', elementName); // Default page, can be enhanced

    await this.actionManager.clickAction.click(locatorObj);

  } catch (error) {
    logger.error(`Failed to click element ${elementName}: ${error.message}`);
    throw error;
  }
});

/**
 * Generic step to select from a dropdown
 * Usage: SELECT "elementName" WITH "optionValue"
 */
When(/^SELECT "([^"]*)" WITH "([^"]*)"$/, async function (elementName, optionValue) {
  try {
    logger.info(`[Step] SELECT "${elementName}" WITH "${optionValue}"`);

    // Get locator for the element
    const locatorObj = this.locatorReader.getLocator('LoginPage', elementName); // Default page, can be enhanced

    await this.actionManager.selectAction.selectByValue(locatorObj, optionValue);

  } catch (error) {
    logger.error(`Failed to select from element ${elementName}: ${error.message}`);
    throw error;
  }
});

/**
 * Generic step to assert text is present
 * Usage: VERIFY TEXT "Some text is present"
 */
Then(/^VERIFY TEXT "([^"]*)"$/, async function (text) {
  try {
    logger.info(`[Step] VERIFY TEXT "${text}"`);

    await this.actionManager.assertAction.assertTextPresent(text);

  } catch (error) {
    logger.error(`Failed to verify text: ${error.message}`);
    throw error;
  }
});

/**
 * Generic step to assert element is visible
 * Usage: VERIFY ELEMENT "elementName" IS VISIBLE
 */
Then(/^VERIFY ELEMENT "([^"]*)" IS VISIBLE$/, async function (elementName) {
  try {
    logger.info(`[Step] VERIFY ELEMENT "${elementName}" IS VISIBLE`);

    // Get locator for the element - use DashboardPage for dashboard elements
    const pageName = elementName.includes('dashboard') ? 'DashboardPage' : 'LoginPage';
    const locatorObj = this.locatorReader.getLocator(pageName, elementName);

    await this.actionManager.assertAction.assertElementVisible(locatorObj);

  } catch (error) {
    logger.error(`Failed to verify element visibility: ${error.message}`);
    throw error;
  }
});

/**
 * Generic step to assert element exists
 * Usage: VERIFY ELEMENT "elementName" EXISTS
 */
Then(/^VERIFY ELEMENT "([^"]*)" EXISTS$/, async function (elementName) {
  try {
    logger.info(`[Step] VERIFY ELEMENT "${elementName}" EXISTS`);

    // Get locator for the element - use DashboardPage for dashboard elements
    const pageName = elementName.includes('dashboard') ? 'DashboardPage' : 'LoginPage';
    const locatorObj = this.locatorReader.getLocator(pageName, elementName);

    await this.actionManager.assertAction.assertElementExists(locatorObj);

  } catch (error) {
    logger.error(`Failed to verify element exists: ${error.message}`);
    throw error;
  }
});

/**
 * Wait for specific time
 * Usage: WAIT FOR "2" SECONDS
 */
When(/^WAIT FOR "(\d+)" SECONDS?$/, async function (seconds) {
  try {
    const ms = parseInt(seconds) * 1000;
    logger.info(`[Step] WAIT FOR ${seconds} seconds`);
    await this.page.waitForTimeout(ms);
  } catch (error) {
    logger.error(`Failed to wait: ${error.message}`);
    throw error;
  }
});

/**
 * Step to refresh the page
 * Usage: REFRESH THE PAGE
 */
When(/^REFRESH THE PAGE$/, async function () {
  try {
    logger.info(`[Step] REFRESH THE PAGE`);
    await this.actionManager.navigateAction.refresh();
  } catch (error) {
    logger.error(`Failed to refresh page: ${error.message}`);
    throw error;
  }
});

/**
 * Advanced step with locator and value
 * Usage: PERFORM "CLICK" ON PAGE "PAGENAME" ELEMENT "ELEMENTNAME"
 */
When(/^PERFORM "([^"]*)" ON PAGE "([^"]*)" ELEMENT "([^"]*)"(?: WITH "([^"]*)")?$/, async function (action, pageName, elementName, value) {
  try {
    logger.info(`[Step] PERFORM "${action}" ON "${pageName}" ELEMENT "${elementName}"`);

    // Get locator for the element
    const locatorObj = this.locatorReader.getLocator(pageName, elementName);

    // Execute the action
    await this.actionManager.executeAction(action, locatorObj, value);

  } catch (error) {
    logger.error(`Failed to perform action ${action} on ${pageName}.${elementName}: ${error.message}`);
    throw error;
  }
});

/**
 * Step to get element text and store in variable
 * Usage: GET TEXT FROM "elementName" AND STORE AS "variableName"
 */
When(/^GET TEXT FROM "([^"]*)" AND STORE AS "([^"]*)"$/, async function (elementName, variableName) {
  try {
    logger.info(`[Step] GET TEXT FROM "${elementName}" AND STORE AS "${variableName}"`);

    // Get locator for the element
    const locatorObj = this.locatorReader.getLocator('LoginPage', elementName); // Default page, can be enhanced

    const textContent = await this.actionManager.fillAction.getValue(locatorObj);
    this[variableName] = textContent;

    logger.info(`Stored text: ${textContent} as ${variableName}`);

  } catch (error) {
    logger.error(`Failed to get text: ${error.message}`);
    throw error;
  }
});
