import ExcelJS from 'exceljs';
import logger from '../utils/Logger.js';
import configManager from '../config/ConfigurationManager.js';

/**
 * Structure of Test Data Excel file:
 * Columns: ScenarioName | ElementName | TestData | DataType(optional)
 * Example:
 * LoginScenario | username | testuser@example.com | string
 * LoginScenario | password | password123 | string
 * RegisterScenario | email | newuser@example.com | string
 */

class TestDataReader {
  constructor(filePath = null) {
    this.filePath = filePath || configManager.get('testDataPath');
    this.testData = new Map(); // Map<ScenarioName, Map<ElementName, TestDataObject>>
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
      const headers = {};
      headerRow.eachCell((cell, colNumber) => {
        headers[cell.value?.toLowerCase() || ''] = colNumber;
      });

      // Validate required columns
      const requiredColumns = ['scenarioname', 'elementname', 'testdata'];
      const missingColumns = requiredColumns.filter(col => !headers[col]);
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Parse test data rows
      let rowCount = 0;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const scenarioName = row.getCell(headers['scenarioname']).value?.trim();
        const elementName = row.getCell(headers['elementname']).value?.trim();
        const testData = row.getCell(headers['testdata']).value;
        const dataType = row.getCell(headers['datatype'])?.value?.trim() || typeof testData;

        if (scenarioName && elementName && testData !== null && testData !== undefined) {
          const dataObj = {
            scenarioName,
            elementName,
            testData,
            dataType,
            rowNumber,
          };

          if (!this.testData.has(scenarioName)) {
            this.testData.set(scenarioName, new Map());
          }

          this.testData.get(scenarioName).set(elementName, dataObj);
          rowCount++;
        }
      });

      this.loaded = true;
      logger.info(`Successfully loaded ${rowCount} test data entries from ${this.filePath}`);
      
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
   * Get test data count
   * @returns {number} Total number of test data entries
   */
  getTestDataCount() {
    let count = 0;
    for (const scenarioMap of this.testData.values()) {
      count += scenarioMap.size;
    }
    return count;
  }
}

export default TestDataReader;
