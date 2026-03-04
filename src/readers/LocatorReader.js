import ExcelJS from 'exceljs';
import logger from '../utils/Logger.js';
import configManager from '../config/ConfigurationManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Structure of Locator Excel file:
 * Columns: PageName | ElementName | LocatorStrategy | LocatorValue | Timeout | Optional(iframe) | Optional(parent) 
 * Example:
 * LoginPage | username | id | user_input | 10000 | | 
 * LoginPage | loginBtn | xpath | //button[@type='submit'] | 10000 | |
 * DashboardPage | notification | css | .notification | 15000 | frame#notif |
 */

class LocatorReader {
  constructor(filePath = null) {
    this.filePath = filePath || configManager.get('locatorFilePath');
    this.locators = new Map(); // Map<PageName, Map<ElementName, LocatorObject>>
    this.loaded = false;
  }

  /**
   * Load locators from Excel file
   * @returns {Promise<void>}
   */
  async load() {
    try {
      logger.info(`Loading locators from file: ${this.filePath}`);
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(this.filePath);
      
      const worksheet = workbook.getWorksheet('Locators') || workbook.worksheets[0];
      
      if (!worksheet) {
        throw new Error('No worksheet found in locator file');
      }

      // Read header row to map columns
      const headerRow = worksheet.getRow(1);
      const headers = {};
      headerRow.eachCell((cell, colNumber) => {
        headers[cell.value?.toLowerCase() || ''] = colNumber;
      });

      // Validate required columns
      const requiredColumns = ['pagename', 'elementname', 'locatorstrategy', 'locatorvalue'];
      const missingColumns = requiredColumns.filter(col => !headers[col]);
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Parse locator rows
      let rowCount = 0;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const pageName = row.getCell(headers['pagename']).value?.trim();
        const elementName = row.getCell(headers['elementname']).value?.trim();
        const locatorStrategy = row.getCell(headers['locatorstrategy']).value?.trim();
        const locatorValue = row.getCell(headers['locatorvalue']).value?.trim();
        const timeout = row.getCell(headers['timeout'])?.value || configManager.get('defaultTimeout');
        const iframeLocator = row.getCell(headers['iframe'])?.value?.trim() || null;
        const parentLocator = row.getCell(headers['parent'])?.value?.trim() || null;

        if (pageName && elementName && locatorStrategy && locatorValue) {
          const locatorObj = {
            pageName,
            elementName,
            locatorStrategy: locatorStrategy.toLowerCase(),
            locatorValue,
            timeout: parseInt(timeout) || configManager.get('defaultTimeout'),
            iframeLocator,
            parentLocator,
            rowNumber, // For debugging
          };

          if (!this.locators.has(pageName)) {
            this.locators.set(pageName, new Map());
          }

          this.locators.get(pageName).set(elementName, locatorObj);
          rowCount++;
        }
      });

      this.loaded = true;
      logger.info(`Successfully loaded ${rowCount} locators from ${this.filePath}`);
      
    } catch (error) {
      logger.error(`Failed to load locators: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Get locator object for a specific page and element
   * @param {string} pageName - Name of the page
   * @param {string} elementName - Name of the element
   * @returns {Object} Locator object with all properties
   * @throws {Error} If locator not found
   */
  getLocator(pageName, elementName) {
    if (!this.loaded) {
      throw new Error('Locators not loaded. Call load() first.');
    }

    const pageLocators = this.locators.get(pageName);
    if (!pageLocators) {
      const error = `Page '${pageName}' not found in locator file`;
      logger.error(error);
      throw new Error(error);
    }

    const locator = pageLocators.get(elementName);
    if (!locator) {
      const error = `Element '${elementName}' not found for page '${pageName}'`;
      logger.error(error);
      throw new Error(error);
    }

    logger.debug(`Retrieved locator for ${pageName}.${elementName}`, { locator });
    return locator;
  }

  /**
   * Get all locators for a page
   * @param {string} pageName - Name of the page
   * @returns {Map<string, Object>} Map of element names to locator objects
   */
  getPageLocators(pageName) {
    if (!this.loaded) {
      throw new Error('Locators not loaded. Call load() first.');
    }

    return this.locators.get(pageName) || new Map();
  }

  /**
   * Get all available pages
   * @returns {Array<string>} Array of page names
   */
  getPages() {
    return Array.from(this.locators.keys());
  }

  /**
   * Check if a locator exists
   * @param {string} pageName - Name of the page
   * @param {string} elementName - Name of the element
   * @returns {boolean} True if locator exists
   */
  hasLocator(pageName, elementName) {
    return this.locators.has(pageName) && 
           this.locators.get(pageName).has(elementName);
  }

  /**
   * Get locators count
   * @returns {number} Total number of locators
   */
  getLocatorCount() {
    let count = 0;
    for (const pageMap of this.locators.values()) {
      count += pageMap.size;
    }
    return count;
  }
}

export default LocatorReader;
