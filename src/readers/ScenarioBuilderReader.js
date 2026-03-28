import ExcelJS from 'exceljs';
import logger from '../utils/Logger.js';
import configManager from '../config/ConfigurationManager.js';
import fs from 'fs';
import path from 'path';

/**
 * Scenario Builder Reader
 * Reads scenario builder Excel file and generates feature files dynamically
 *
 * Structure of Scenario Builder Excel file:
 * Columns: ScenarioName | Status | Func1 | Variant1 | Func2 | Variant2 | ...
 * Example:
 * | ScenarioName | Status | Func1 | Variant1 | Func2 | Variant2 |
 * |--------------|--------|-------|----------|-------|----------|
 * | Login Flow  | Run    | Login | Basic    |       |          |
 * | Full User Journey | Run | Login | Basic | Dashboard | Admin |
 *
 * Corresponding text files: Func1_Variant1.txt, Func2_Variant2.txt, etc.
 * These files contain Gherkin steps for each functionality variant.
 */

class ScenarioBuilderReader {
  constructor(filePath = null) {
    this.filePath = filePath;
    this.scenarios = new Map(); // Map<ScenarioName, ScenarioObject>
    this.variantsPath = null; // Will be set after config is loaded
    this.loaded = false;
  }

  /**
   * Load scenario builder data from Excel file
   * @returns {Promise<void>}
   */
  async load() {
    try {
      // Set defaults if not provided
      this.filePath = this.filePath || './data/scenario_builder.xlsx';
      this.variantsPath = this.variantsPath || './data/variants/';
      
      logger.info(`Loading scenario builder from file: ${this.filePath}`);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(this.filePath);

      const worksheet = workbook.getWorksheet('Scenarios') || workbook.worksheets[0];

      if (!worksheet) {
        throw new Error('No worksheet found in scenario builder file');
      }

      // Read header row
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers.push(cell.value?.trim().toLowerCase() || '');
      });

      // Validate required columns
      if (headers.length < 2 || headers[0] !== 'scenarioname' || headers[1] !== 'status') {
        throw new Error('First two columns must be "ScenarioName" and "Status"');
      }

      // Parse scenario rows
      let scenarioCount = 0;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const scenarioName = row.getCell(1).value?.trim();
        const status = row.getCell(2).value?.trim();

        if (scenarioName && status) {
          // Parse functionality-variant pairs
          const functionalities = [];
          for (let i = 2; i < headers.length; i += 2) {
            const funcName = headers[i];
            const variantName = headers[i + 1];

            if (funcName && variantName && funcName.startsWith('func') && variantName.startsWith('variant')) {
              const funcIndex = parseInt(funcName.replace('func', ''));
              const variantIndex = parseInt(variantName.replace('variant', ''));

              if (funcIndex === variantIndex) {
                const funcValue = row.getCell(i + 1).value?.trim();
                const variantValue = row.getCell(i + 2).value?.trim();

                if (funcValue && variantValue) {
                  functionalities.push({
                    function: funcValue,
                    variant: variantValue,
                    fileName: `${funcValue}_${variantValue}.txt`
                  });
                }
              }
            }
          }

          // Create scenario object
          const scenario = {
            scenarioName,
            status: status.toLowerCase(),
            functionalities,
            rowNumber
          };

          this.scenarios.set(scenarioName, scenario);
          scenarioCount++;
        }
      });

      this.loaded = true;
      logger.info(`Successfully loaded ${scenarioCount} scenarios from scenario builder`);

    } catch (error) {
      logger.error(`Failed to load scenario builder: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Get all scenarios with status 'run'
   * @returns {Array} Array of scenario objects to run
   */
  getScenariosToRun() {
    if (!this.loaded) {
      throw new Error('Scenario builder not loaded. Call load() first.');
    }

    const scenariosToRun = [];
    for (const [name, scenario] of this.scenarios) {
      if (scenario.status === 'run') {
        scenariosToRun.push(scenario);
      }
    }

    logger.info(`Found ${scenariosToRun.length} scenarios to run`);
    return scenariosToRun;
  }

  /**
   * Generate feature file content for a scenario
   * @param {Object} scenario - Scenario object
   * @returns {string} Feature file content
   */
  async generateFeatureContent(scenario) {
    let featureContent = `Feature: ${scenario.scenarioName}\n\n`;

    for (const func of scenario.functionalities) {
      const filePath = path.join(this.variantsPath, func.fileName);

      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          featureContent += `  # ${func.function} - ${func.variant}\n`;
          featureContent += content + '\n\n';
          logger.debug(`Added content from ${func.fileName}`);
        } else {
          logger.warn(`Variant file not found: ${filePath}`);
          featureContent += `  # WARNING: Variant file not found: ${func.fileName}\n\n`;
        }
      } catch (error) {
        logger.error(`Error reading variant file ${func.fileName}: ${error.message}`);
        featureContent += `  # ERROR: Could not read ${func.fileName}\n\n`;
      }
    }

    return featureContent;
  }

  /**
   * Generate and save feature file for a scenario
   * @param {Object} scenario - Scenario object
   * @param {string} outputDir - Directory to save feature file
   * @returns {string} Path to generated feature file
   */
  async generateFeatureFile(scenario, outputDir = './features/generated/') {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const featureContent = await this.generateFeatureContent(scenario);
    const fileName = `${scenario.scenarioName.replace(/[^a-zA-Z0-9]/g, '_')}.feature`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, featureContent, 'utf8');
    logger.info(`Generated feature file: ${filePath}`);

    return filePath;
  }
}

export default ScenarioBuilderReader;