import ExcelJS from 'exceljs';
import logger from '../utils/Logger.js';
import configManager from '../config/ConfigurationManager.js';

/**
 * Structure of Test Data Excel file:
 * First column: ScenarioName
 * Other columns: Element names (dynamically)
 * Each row: One scenario with all its test data
 * 
 * Example:
 * | ScenarioName | username | password | email |
 * |---|---|---|---|
 * | Login Scenario | testuser | password123 | - |
 * | Register Scenario | - | - | newuser@example.com |
 */

class TestDataReader {
  constructor(filePath = null) {
    this.filePath = filePath || configManager.get('testDataPath');
    this.testData = new Map(); // Map<ScenarioName, Map<ElementName, TestDataObject>>
    this.headers = []; // Array of column headers (element names)
    this.loaded = false;
  }

  /**
   * Load test data from Excel file
   * @returns {Promise<void>}
   */
  async load() {
    try {
      logger.info(`Loading test data from file: ${this.filePath}`);
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(this.filePath);
      
      const worksheet = workbook.getWorksheet('TestData') || workbook.worksheets[0];
      
      if (!worksheet) {
        throw new Error('No worksheet found in test data file');
      }

      // Read header row
      const headerRow = worksheet.getRow(1);
      const headerValues = [];
      headerRow.eachCell((cell, colNumber) => {
        const headerValue = cell.value?.trim() || '';
        headerValues.push({ colNumber, value: headerValue });
      });

      // Validate that first column is ScenarioName
      if (headerValues.length === 0 || headerValues[0].value.toLowerCase() !== 'scenarioname') {
        throw new Error('First column must be "ScenarioName"');
      }

      // Store element names (all columns except first one)
      this.headers = headerValues.slice(1).map(h => h.value).filter(h => h !== '');

      if (this.headers.length === 0) {
        throw new Error('No element columns found. Please add element names as column headers.');
      }

      // Parse test data rows
      let rowCount = 0;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const scenarioName = row.getCell(1).value?.trim();

        if (scenarioName) {
          // Create map for this scenario
          const scenarioDataMap = new Map();

          // Read data for each element column
          headerValues.forEach((header, index) => {
            if (index === 0) return; // Skip ScenarioName column

            const elementName = header.value;
            const testData = row.getCell(header.colNumber).value;

            // Store test data if not empty
            if (testData !== null && testData !== undefined && testData !== '') {
              scenarioDataMap.set(elementName, {
                scenarioName,
                elementName,
                testData,
                dataType: typeof testData,
                rowNumber,
              });
            }
          });

          // Add to main test data map
          if (scenarioDataMap.size > 0) {
            this.testData.set(scenarioName, scenarioDataMap);
            rowCount++;
          }
        }
      });

      this.loaded = true;
      logger.info(`Successfully loaded ${rowCount} scenarios from ${this.filePath}`);
      logger.info(`Available element columns: ${this.headers.join(', ')}`);
      
    } catch (error) {
      logger.error(`Failed to load test data: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Get test data for a specific scenario and element
   * @param {string} scenarioName - Name of the scenario
   * @param {string} elementName - Name of the element
   * @returns {*} Test data value
   * @throws {Error} If test data not found
   */
  getTestData(scenarioName, elementName) {
    if (!this.loaded) {
      throw new Error('Test data not loaded. Call load() first.');
    }

    const scenarioData = this.testData.get(scenarioName);
    if (!scenarioData) {
      const error = `Scenario '${scenarioName}' not found in test data file`;
      logger.warn(error);
      return null;
    }

    const data = scenarioData.get(elementName);
    if (!data) {
      const error = `Element '${elementName}' not found for scenario '${scenarioName}'`;
      logger.warn(error);
      return null;
    }

    logger.debug(`Retrieved test data for ${scenarioName}.${elementName}`, { data });
    return data.testData;
  }

  /**
   * Get all test data for a scenario
   * @param {string} scenarioName - Name of the scenario
   * @returns {Map<string, *>} Map of element names to test data
   */
  getScenarioData(scenarioName) {
    if (!this.loaded) {
      throw new Error('Test data not loaded. Call load() first.');
    }

    const result = new Map();
    const scenarioData = this.testData.get(scenarioName);
    
    if (scenarioData) {
      for (const [key, value] of scenarioData) {
        result.set(key, value.testData);
      }
    }

    return result;
  }

  /**
   * Check if test data exists
   * @param {string} scenarioName - Name of the scenario
   * @param {string} elementName - Name of the element
   * @returns {boolean} True if test data exists
   */
  hasTestData(scenarioName, elementName) {
    return this.testData.has(scenarioName) && 
           this.testData.get(scenarioName).has(elementName);
  }

  /**
   * Get all available scenarios
   * @returns {Array<string>} Array of scenario names
   */
  getScenarios() {
    return Array.from(this.testData.keys());
  }

  /**
   * Get test data count (counts scenarios, not individual entries)
   * @returns {number} Total number of scenarios
   */
  getTestDataCount() {
    return this.testData.size;
  }
}

export default TestDataReader;
