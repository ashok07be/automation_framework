import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import WebContextManager from '../utils/WebContextManager.js';
import LocatorReader from '../readers/LocatorReader.js';
import TestDataReader from '../readers/TestDataReader.js';
import ActionManager from '../actions/ActionManager.js';
import configManager from '../config/ConfigurationManager.js';
import logger from '../utils/Logger.js';
import { runCucumber } from '@cucumber/cucumber/api';
import path from 'path';
import fs from 'fs';

// Set default timeout
setDefaultTimeout(60 * 1000);

// Global test variables
let webContextManager;
let locatorReader;
let testDataReader;
let actionManager;
let currentScenarioName;

/**
 * Determine page name for a given element.  The default used to be hardcoded
 * to LoginPage for most actions; this helper lets us route to other pages
 * (DashboardPage, CartPage, CheckoutPage) based on element naming conventions.
 */
function getPageName(elementName) {
  const lower = elementName.toLowerCase();
  // high‑level page categories based on element naming conventions
  if (lower.includes('dashboard') || lower.includes('productitem') || lower.includes('cartlink') || lower.includes('addtocart')) {
    return 'DashboardPage';
  }
  if (lower.includes('checkoutbtn')) {
    return 'CartPage';
  }
  if (
    ['firstname', 'lastname', 'postalcode', 'continuebtn', 'finishbtn'].some(e => lower.includes(e))
  ) {
    return 'CheckoutPage';
  }
  // initial or landing screen elements
  if (lower.includes('getstarted') || lower.includes('courses')) {
    return 'InitialPage';
  }
  // login button on course page
  if (lower === 'loginbtn') {
    return 'CoursePage';
  }
  // fallback
  return 'LoginPage';
}

/**
 * Resolve locator with a fallback across all pages.  Helps avoid failures when
 * the automatic page inference is slightly off (e.g. element defined on
 * InitialPage but called before mapping updated).
 */
function resolveLocator(reader, elementName) {
  const pageName = getPageName(elementName);
  try {
    return reader.getLocator(pageName, elementName);
  } catch (err) {
    // scan other pages for the element
    for (const page of reader.getPages()) {
      if (reader.hasLocator(page, elementName)) {
        logger.warn(`Element '${elementName}' not found on ${pageName}, using locator from ${page}`);
        return reader.getLocator(page, elementName);
      }
    }
    throw err;
  }
} 

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

    // Get locator for the element (with resolver fallback)
    const locatorObj = resolveLocator(this.locatorReader, elementName);

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

    // Get locator for the element (with resolver fallback)
    const locatorObj = resolveLocator(this.locatorReader, elementName);

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

    // Get locator for the element (use resolver helper)
    const locatorObj = resolveLocator(this.locatorReader, elementName); // Default page, can be enhanced

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
 * Step to click a button that opens a new window (e.g., PDF viewer) and switch context
 * Usage: OPEN PDF FROM "elementName"
 */
When(/^OPEN PDF FROM "([^\"]*)"$/, async function (elementName) {
  try {
    logger.info(`[Step] OPEN PDF FROM "${elementName}"`);

    // Wait for the new page to open
    const newPagePromise = this.webContextManager.getContext().waitForEvent('page');

    const locatorObj = resolveLocator(this.locatorReader, elementName);
    await this.actionManager.clickAction.click(locatorObj);

    const newPage = await newPagePromise;
    await newPage.waitForLoadState('load');

    logger.info(`New window opened: ${newPage.url()}`);

    // Keep reference to the original page so we can return to it later
    this.webContextManager.previousPage = this.page;

    // Switch framework context to the new page
    this.webContextManager.page = newPage;
    this.page = newPage;
    this.actionManager = new ActionManager(newPage);

  } catch (error) {
    logger.error(`Failed to open PDF window: ${error.message}`);
    throw error;
  }
});

/**
 * Step to verify the current page URL contains a given string (useful for PDFs)
 * Usage: VERIFY PDF URL CONTAINS "expected"
 */
Then(/^VERIFY PDF URL CONTAINS "([^\"]*)"$/, async function (expected) {
  try {
    logger.info(`[Step] VERIFY PDF URL CONTAINS "${expected}"`);
    const url = this.page.url();
    expect(url).toContain(expected);
  } catch (error) {
    logger.error(`Failed to verify PDF URL: ${error.message}`);
    throw error;
  }
});

/**
 * Step to close the current PDF window and return to the previous page
 * Usage: CLOSE PDF AND GO BACK
 */
When(/^CLOSE PDF AND GO BACK$/, async function () {
  try {
    logger.info(`[Step] CLOSE PDF AND GO BACK`);

    const previousPage = this.webContextManager.previousPage;
    if (!previousPage) {
      throw new Error('No previous page stored. make sure you called OPEN PDF FROM first.');
    }

    // Close the current page (PDF)
    await this.page.close();

    // Restore context to the original page
    this.webContextManager.page = previousPage;
    this.page = previousPage;
    this.actionManager = new ActionManager(previousPage);

    // Clear stored reference
    this.webContextManager.previousPage = null;

  } catch (error) {
    logger.error(`Failed to close PDF and go back: ${error.message}`);
    throw error;
  }
});

/**
 * Step to execute another feature file or TXT file with steps and return control
 * Usage: EXECUTE FEATURE "filename" (supports .feature or .txt)
 */
When(/^EXECUTE FEATURE "([^"]*)"$/, async function (featureFile) {
  try {
    logger.info(`[Step] EXECUTE FEATURE "${featureFile}"`);

    const filePath = path.join(process.cwd(), 'features', featureFile);
    const isTxt = featureFile.endsWith('.txt');
    const isFeature = featureFile.endsWith('.feature');

    if (isFeature) {
      // Run as full feature file (separate context)
      const config = {
        paths: [filePath],
        import: ['src/steps/**/*.js'],
        format: ['progress'],
        formatOptions: { snippetInterface: 'async-await' },
        require: ['src/steps/stepDefinitions.js'],
        worldParameters: {},
      };

      const { success } = await runCucumber(config);
      if (!success) {
        throw new Error(`Child feature "${featureFile}" failed to execute successfully`);
      }
    } else if (isTxt) {
      // Parse and execute TXT file steps in current context
      await executeTxtSteps.call(this, filePath);
    } else {
      throw new Error(`Unsupported file type for "${featureFile}". Use .feature or .txt`);
    }

    logger.info(`Successfully executed: ${featureFile}`);

  } catch (error) {
    logger.error(`Failed to execute ${featureFile}: ${error.message}`);
    throw error;
  }
});

/**
 * Helper to execute steps from a TXT file in the current context
 * TXT format: Each line is a step like "FILL email" or "CLICK loginBtn"
 */
async function executeTxtSteps(txtFilePath) {
  const content = fs.readFileSync(txtFilePath, 'utf8');
  const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));

  for (const line of lines) {
    const parts = line.split(/\s+/);
    const action = parts[0].toUpperCase();
    const element = parts[1];
    const value = parts.slice(2).join(' ') || null;

    logger.info(`Executing TXT step: ${action} ${element} ${value || ''}`);

    // Resolve locator
    const locatorObj = resolveLocator(this.locatorReader, element);

    // Get value from test data if not provided
    let finalValue = value;
    if (!finalValue) {
      finalValue = this.testDataReader.getTestData(this.currentScenarioName, element);
    }

    // Execute the action
    await this.actionManager.executeAction(action, locatorObj, finalValue);
  }
}

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
