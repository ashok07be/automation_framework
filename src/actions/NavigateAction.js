import BaseAction from './BaseAction.js';
import logger from '../utils/Logger.js';
import configManager from '../config/ConfigurationManager.js';

/**
 * Navigate Action - Handles all page navigation
 */
class NavigateAction extends BaseAction {
  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   * @returns {Promise<void>}
   * @throws {Error} If navigation fails
   */
  async navigateTo(url) {
    try {
      if (!url) {
        throw new Error('URL cannot be empty');
      }

      logger.info(`Navigating to URL: ${url}`);

      // Handle relative URLs
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = configManager.get('baseUrl') + url;
      }

      await this.page.goto(fullUrl, { 
        waitUntil: 'networkidle',
        timeout: configManager.get('navigationTimeout')
      });

      logger.info(`Successfully navigated to: ${fullUrl}`);

    } catch (error) {
      logger.error(`Failed to navigate to ${url}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Navigate using a page locator from feature file
   * @param {string} pageName - Page name from locator file
   * @returns {Promise<void>}
   * @throws {Error} If page URL not found
   */
  async navigateToPage(pageName) {
    try {
      logger.info(`[NAVIGATE] ${pageName}`);

      // This would typically map page names to URLs
      // You can enhance this by reading from a config file
      const pageUrls = {
        'LGNPGE': '/login',
        'DASHBOARD': '/dashboard',
        'HOME': '/',
      };

      const url = pageUrls[pageName];
      if (!url) {
        throw new Error(`Page '${pageName}' not mapped to any URL`);
      }

      await this.navigateTo(url);

    } catch (error) {
      logger.error(`[NAVIGATE] Failed for page ${pageName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Go back in browser history
   * @returns {Promise<void>}
   */
  async goBack() {
    try {
      logger.info('Going back in browser history');
      await this.page.goBack({ 
        waitUntil: 'networkidle',
        timeout: configManager.get('navigationTimeout')
      });
      logger.info('Successfully went back');

    } catch (error) {
      logger.error(`Failed to go back: ${error.message}`);
      throw error;
    }
  }

  /**
   * Go forward in browser history
   * @returns {Promise<void>}
   */
  async goForward() {
    try {
      logger.info('Going forward in browser history');
      await this.page.goForward({ 
        waitUntil: 'networkidle',
        timeout: configManager.get('navigationTimeout')
      });
      logger.info('Successfully went forward');

    } catch (error) {
      logger.error(`Failed to go forward: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh the page
   * @returns {Promise<void>}
   */
  async refresh() {
    try {
      logger.info('Refreshing the page');
      await this.page.reload({ 
        waitUntil: 'networkidle',
        timeout: configManager.get('navigationTimeout')
      });
      logger.info('Successfully refreshed the page');

    } catch (error) {
      logger.error(`Failed to refresh page: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current page URL
   * @returns {string} Current URL
   */
  getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getPageTitle() {
    return await this.page.title();
  }

  /**
   * Wait for URL to change
   * @param {string} expectedUrl - Expected URL (can be partial)
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForUrlChange(expectedUrl = null, timeout = null) {
    try {
      logger.info(`Waiting for URL change${expectedUrl ? ` to contain '${expectedUrl}'` : ''}`);

      await this.page.waitForURL(
        expectedUrl ? `**/${expectedUrl}**` : '**',
        { timeout: timeout || configManager.get('navigationTimeout') }
      );

      logger.info('URL changed successfully');

    } catch (error) {
      logger.error(`Failed to wait for URL change: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for page to load completely
   * @returns {Promise<void>}
   */
  async waitForPageLoad() {
    try {
      logger.info('Waiting for page to load completely');
      
      // Wait for network to be idle
      await this.page.waitForLoadState('networkidle');
      
      logger.info('Page loaded successfully');

    } catch (error) {
      logger.error(`Failed to wait for page load: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if page is on a specific URL
   * @param {string} expectedUrl - Expected URL (partial match)
   * @returns {Promise<boolean>}
   */
  async isOnPage(expectedUrl) {
    try {
      const currentUrl = this.getCurrentUrl();
      return currentUrl.includes(expectedUrl);

    } catch (error) {
      logger.warn(`Failed to check current page: ${error.message}`);
      return false;
    }
  }

  /**
   * Navigate with custom wait condition
   * @param {string} url - URL to navigate to
   * @param {string} waitSelector - Selector to wait for after navigation
   * @returns {Promise<void>}
   */
  async navigateAndWaitForElement(url, waitSelector) {
    try {
      logger.info(`Navigating to ${url} and waiting for selector: ${waitSelector}`);

      await this.navigateTo(url);
      await this.page.waitForSelector(waitSelector, { 
        timeout: configManager.get('navigationTimeout')
      });

      logger.info('Navigation complete and element found');

    } catch (error) {
      logger.error(`Failed to navigate and wait for element: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get page context (useful for multipage scenarios)
   * @returns {Object} Page context info
   */
  async getPageContext() {
    return {
      url: this.getCurrentUrl(),
      title: await this.getPageTitle(),
    };
  }
}

export default NavigateAction;
