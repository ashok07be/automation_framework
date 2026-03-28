import dotenv from 'dotenv';
import logger from '../utils/Logger.js';

dotenv.config();

class ConfigurationManager {
  constructor() {
    this.config = {
      baseUrl: process.env.BASE_URL || 'https://example.com',
      browser: process.env.BROWSER || 'chromium',
      headed: process.env.HEADED === 'true',
      slowMo: parseInt(process.env.SLOWMO || '0'),
      debug: process.env.DEBUG === 'true',
      environment: process.env.ENVIRONMENT || 'local',
      
      // Timeouts
      defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
      actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '15000'),
      navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'),
      
      // File paths
      locatorFilePath: process.env.LOCATOR_FILE_PATH || './data/locators.xlsx',
      testDataPath: process.env.TEST_DATA_PATH || './data/testdata.xlsx',
      scenarioBuilderPath: process.env.SCENARIO_BUILDER_PATH || './data/scenario_builder.xlsx',
      variantsPath: process.env.VARIANTS_PATH || './data/variants/',
      
      // Logging
      logLevel: process.env.LOG_LEVEL || 'info',
      logDir: process.env.LOG_DIR || './logs',
    };

    // Note: Logging is done after logger is properly initialized
  }

  /**
   * Load configuration (for async initialization)
   * @returns {Promise<void>}
   */
  async load() {
    // Configuration is already loaded in constructor
    // This method can be used for future async loading
    logger.info('Configuration loaded', { config: this.config });
  }

  /**
   * Get all configurations
   * @returns {Object} All configurations
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Validate required configurations
   * @throws {Error} If required configuration is missing
   */
  validate() {
    const required = ['baseUrl', 'locatorFilePath', 'testDataPath'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      const error = `Missing required configurations: ${missing.join(', ')}`;
      logger.error(error);
      throw new Error(error);
    }
    
    logger.info('Configuration validation passed');
  }
}

export default new ConfigurationManager();
