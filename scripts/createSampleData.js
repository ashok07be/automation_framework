import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Script to create sample locators.xlsx and testdata.xlsx files
 * Run with: node scripts/createSampleData.js
 */

async function createLocatorsFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Locators');

  // Add headers
  worksheet.columns = [
    { header: 'PageName', key: 'pagename', width: 20 },
    { header: 'ElementName', key: 'elementname', width: 20 },
    { header: 'LocatorStrategy', key: 'locatorstrategy', width: 18 },
    { header: 'LocatorValue', key: 'locatorvalue', width: 40 },
    { header: 'Timeout', key: 'timeout', width: 10 },
    { header: 'iFrame', key: 'iframe', width: 20 },
    { header: 'parent', key: 'parent', width: 20 },
  ];

  // Add sample data for SauceDemo
  const locatorData = [
    // Login Page
    {
      pagename: 'LoginPage',
      elementname: 'username',
      locatorstrategy: 'id',
      locatorvalue: 'user-name',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'LoginPage',
      elementname: 'password',
      locatorstrategy: 'id',
      locatorvalue: 'password',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'LoginPage',
      elementname: 'loginBtn',
      locatorstrategy: 'id',
      locatorvalue: 'login-button',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'LoginPage',
      elementname: 'errorMessage',
      locatorstrategy: 'css',
      locatorvalue: '.error-message-container',
      timeout: 5000,
      iframe: '',
      parent: '',
    },
    // Dashboard Page (Inventory)
    {
      pagename: 'DashboardPage',
      elementname: 'dashboardHeader',
      locatorstrategy: 'css',
      locatorvalue: '.inventory_container',
      timeout: 15000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'DashboardPage',
      elementname: 'userMenuBtn',
      locatorstrategy: 'id',
      locatorvalue: 'react-burger-menu-btn',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'DashboardPage',
      elementname: 'logoutBtn',
      locatorstrategy: 'id',
      locatorvalue: 'logout_sidebar_link',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'DashboardPage',
      elementname: 'reportTypeDropdown',
      locatorstrategy: 'css',
      locatorvalue: '.product_sort_container select',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'DashboardPage',
      elementname: 'reportTable',
      locatorstrategy: 'css',
      locatorvalue: '.inventory_list',
      timeout: 15000,
      iframe: '',
      parent: '',
    },
  ];

  worksheet.addRows(locatorData);

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' },
  };

  await workbook.xlsx.writeFile('./data/locators.xlsx');
  console.log('✅ Created: ./data/locators.xlsx');
}

async function createTestDataFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('TestData');

  // Add headers - ScenarioName first, then element names
  worksheet.columns = [
    { header: 'ScenarioName', key: 'scenarioName', width: 30 },
    { header: 'username', key: 'username', width: 20 },
    { header: 'password', key: 'password', width: 20 },
    { header: 'reportTypeDropdown', key: 'reportTypeDropdown', width: 20 },
  ];

  // Add sample data - one row per scenario
  const testData = [
    {
      scenarioName: 'Successful login with valid credentials',
      username: 'standard_user',
      password: 'secret_sauce',
      reportTypeDropdown: '',
    },
    {
      scenarioName: 'Failed login with invalid credentials',
      username: 'invaliduser',
      password: 'wrongpassword',
      reportTypeDropdown: '',
    },
    {
      scenarioName: 'Verify table data with dropdown selection',
      username: '',
      password: '',
      reportTypeDropdown: 'Monthly',
    },
  ];

  worksheet.addRows(testData);

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' },
  };

  await workbook.xlsx.writeFile('./data/testdata.xlsx');
  console.log('✅ Created: ./data/testdata.xlsx');
}

async function main() {
  try {
    console.log('📝 Creating sample Excel files...\n');
    await createLocatorsFile();
    await createTestDataFile();
    console.log('\n✨ Sample files created successfully!');
    console.log('📋 Next step: Update these files with your actual data');
  } catch (error) {
    console.error('❌ Error creating files:', error.message);
    process.exit(1);
  }
}

main();
