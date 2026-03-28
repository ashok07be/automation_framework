#!/usr/bin/env node

import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

/**
 * Create sample scenario builder Excel file
 */

async function createSampleScenarioBuilder() {
  const filePath = './data/scenario_builder.xlsx';

  // Ensure data directory exists
  const dataDir = path.dirname(filePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Scenarios');

  // Add headers
  worksheet.getCell('A1').value = 'ScenarioName';
  worksheet.getCell('B1').value = 'Status';
  worksheet.getCell('C1').value = 'Func1';
  worksheet.getCell('D1').value = 'Variant1';
  worksheet.getCell('E1').value = 'Func2';
  worksheet.getCell('F1').value = 'Variant2';

  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }
  };

  // Add sample scenarios
  const scenarios = [
    {
      scenarioName: 'Basic Login Flow',
      status: 'Run',
      func1: 'Login',
      variant1: 'Basic',
      func2: '',
      variant2: ''
    },
    {
      scenarioName: 'Login and Dashboard',
      status: 'Run',
      func1: 'Login',
      variant1: 'Basic',
      func2: 'Dashboard',
      variant2: 'Basic'
    },
    {
      scenarioName: 'Invalid Login Test',
      status: 'Skip',
      func1: 'Login',
      variant1: 'Invalid',
      func2: '',
      variant2: ''
    }
  ];

  scenarios.forEach((scenario, index) => {
    const row = index + 2;
    worksheet.getCell(`A${row}`).value = scenario.scenarioName;
    worksheet.getCell(`B${row}`).value = scenario.status;
    worksheet.getCell(`C${row}`).value = scenario.func1;
    worksheet.getCell(`D${row}`).value = scenario.variant1;
    worksheet.getCell(`E${row}`).value = scenario.func2;
    worksheet.getCell(`F${row}`).value = scenario.variant2;
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 20;
  });

  // Save the file
  await workbook.xlsx.writeFile(filePath);
  console.log(`Sample scenario builder created at: ${filePath}`);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleScenarioBuilder().catch(console.error);
}

export { createSampleScenarioBuilder };