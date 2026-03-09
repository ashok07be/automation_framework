import { chromium, firefox, webkit } from 'playwright';
import logger from './Logger.js';
import configManager from '../config/ConfigurationManager.js';

class WebContextManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Initialize browser and context
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      const browserType = configManager.get('browser', 'chromium');
      const browserLaunchOptions = {
        headless: !configManager.get('headed'),
        slowMo: configManager.get('slowMo', 0),
        channel: 'chrome',
      };

      if (configManager.get('debug')) {
        browserLaunchOptions.devtools = true;
      }

      logger.info(`Launching browser: ${browserType}`, { options: browserLaunchOptions });

      // Launch browser
      switch (browserType.toLowerCase()) {
        case 'firefox':
          this.browser = await firefox.launch(browserLaunchOptions);
          break;
        case 'webkit':
          this.browser = await webkit.launch(browserLaunchOptions);
          break;
        case 'chromium':
        default:
          this.browser = await chromium.launch(browserLaunchOptions);
      }

      // Create context with viewport and timeout settings
      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
      });

      // Set timeouts at context level
      this.context.setDefaultNavigationTimeout(configManager.get('navigationTimeout'));
      this.context.setDefaultTimeout(configManager.get('defaultTimeout'));

      // Create a new page
      this.page = await this.context.newPage();

      logger.info('Browser and context initialized successfully');

    } catch (error) {
      logger.error(`Failed to initialize browser: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Get the current page
   * @returns {Page} Playwright page object
   */
  getPage() {
    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }
    return this.page;
  }

  /**
   * Get the browser context
   * @returns {BrowserContext} Playwright context object
   */
  getContext() {
    if (!this.context) {
      throw new Error('Context not initialized. Call initialize() first.');
    }
    return this.context;
  }

  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   * @returns {Promise<void>}
   */
  async navigateTo(url) {
    try {
      logger.info(`Navigating to: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle' });
      logger.info(`Successfully navigated to: ${url}`);
    } catch (error) {
      logger.error(`Failed to navigate to ${url}: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Close the browser
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      logger.info('Browser closed successfully');
    } catch (error) {
      logger.error(`Failed to close browser: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Take a screenshot
   * @param {string} filename - Filename for the screenshot
   * @returns {Promise<Buffer>}
   */
  async takeScreenshot(filename) {
    try {
      const screenshot = await this.page.screenshot({ path: filename, fullPage: true });
      logger.info(`Screenshot taken: ${filename}`);
      return screenshot;
    } catch (error) {
      logger.error(`Failed to take screenshot: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getPageTitle() {
    return await this.page.title();
  }

  /**
   * Get page URL
   * @returns {string} Current page URL
   */
  getPageUrl() {
    return this.page.url();
  }

  /**
   * Wait for navigation
   * @returns {Promise<Response>}
   */
  async waitForNavigation() {
    return await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }

  /**
   * Execute JavaScript in the page context
   * @param {string} script - JavaScript code to execute
   * @param {*} args - Arguments to pass to the script
   * @returns {Promise<*>} Result of the script
   */
  async executeScript(script, args = null) {
    try {
      const result = await this.page.evaluate(script, args);
      return result;
    } catch (error) {
      logger.error(`Failed to execute script: ${error.message}`, { error });
      throw error;
    }
  }
}

export default WebContextManager;
