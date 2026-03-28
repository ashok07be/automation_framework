#!/usr/bin/env node

import ScenarioBuilderReader from '../src/readers/ScenarioBuilderReader.js';
import logger from '../src/utils/Logger.js';
import configManager from '../src/config/ConfigurationManager.js';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Scenario Generator Script
 * Reads scenario builder Excel and generates/runs feature files dynamically
 */

class ScenarioGenerator {
  constructor() {
    this.scenarioBuilder = new ScenarioBuilderReader();
    this.generatedFeatures = [];
  }

  /**
   * Initialize configuration
   */
  async initialize() {
    await configManager.load();
    logger.info('Scenario Generator initialized');
  }

  /**
   * Generate feature files for all scenarios marked as 'run'
   */
  async generateScenarios() {
    try {
      await this.scenarioBuilder.load();
      const scenariosToRun = this.scenarioBuilder.getScenariosToRun();

      if (scenariosToRun.length === 0) {
        logger.info('No scenarios marked for execution');
        return;
      }

      const outputDir = './features/generated/';

      for (const scenario of scenariosToRun) {
        logger.info(`Generating feature for scenario: ${scenario.scenarioName}`);
        const featurePath = await this.scenarioBuilder.generateFeatureFile(scenario, outputDir);
        this.generatedFeatures.push(featurePath);
      }

      logger.info(`Generated ${this.generatedFeatures.length} feature files`);

    } catch (error) {
      logger.error(`Failed to generate scenarios: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Run the generated feature files
   */
  async runScenarios() {
    if (this.generatedFeatures.length === 0) {
      logger.warn('No feature files to run');
      return;
    }

    try {
      logger.info('Starting execution of generated scenarios');

      for (const featurePath of this.generatedFeatures) {
        const featureName = path.basename(featurePath, '.feature');
        logger.info(`Running feature: ${featureName}`);

        try {
          // Run the specific feature file
          execSync(`npx cucumber-js --config cucumber.js ${featurePath}`, {
            stdio: 'inherit',
            cwd: process.cwd()
          });
          logger.info(`Successfully executed feature: ${featureName}`);
        } catch (error) {
          logger.error(`Failed to execute feature ${featureName}: ${error.message}`);
          // Continue with next feature instead of stopping
        }
      }

      logger.info('Completed execution of all generated scenarios');

    } catch (error) {
      logger.error(`Failed to run scenarios: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Generate reports after running scenarios
   */
  async generateReports() {
    try {
      logger.info('Generating test reports');
      execSync('npm run test:generate-report', { stdio: 'inherit' });
      logger.info('Reports generated successfully');
    } catch (error) {
      logger.error(`Failed to generate reports: ${error.message}`);
    }
  }

  /**
   * Open reports in browser
   */
  async openReports() {
    try {
      logger.info('Opening test reports');
      execSync('npm run open:report', { stdio: 'inherit' });
    } catch (error) {
      logger.error(`Failed to open reports: ${error.message}`);
    }
  }

  /**
   * Main execution method
   */
  async execute() {
    try {
      console.log('Starting scenario generation...');
      await this.initialize();
      console.log('Initialization complete');
      await this.generateScenarios();
      console.log('Scenario generation complete');
      await this.runScenarios();
      console.log('Scenario execution complete');
      await this.generateReports();
      console.log('Report generation complete');
      await this.openReports();
      console.log('Reports opened');

      logger.info('Scenario generation and execution completed successfully');

    } catch (error) {
      logger.error(`Scenario execution failed: ${error.message}`, { error });
      console.error('Error:', error.message);
      process.exit(1);
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const generator = new ScenarioGenerator();
  const args = process.argv.slice(2);
  
  if (args.includes('--generate-only')) {
    // Only generate scenarios
    generator.initialize()
      .then(() => generator.generateScenarios())
      .then(() => console.log('Feature files generated successfully'))
      .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  } else {
    // Full execution
    generator.execute();
  }
}

export default ScenarioGenerator;