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

  // Add sample data
  const locatorData = [
    // Login Page
    {
      pagename: 'LoginPage',
      elementname: 'username',
      locatorstrategy: 'id',
      locatorvalue: 'user_input',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'LoginPage',
      elementname: 'password',
      locatorstrategy: 'id',
      locatorvalue: 'password_input',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'LoginPage',
      elementname: 'loginBtn',
      locatorstrategy: 'xpath',
      locatorvalue: "//button[@type='submit']",
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'LoginPage',
      elementname: 'rememberMe',
      locatorstrategy: 'css',
      locatorvalue: "input[type='checkbox']",
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'LoginPage',
      elementname: 'errorMessage',
      locatorstrategy: 'css',
      locatorvalue: '.error-message',
      timeout: 5000,
      iframe: '',
      parent: '',
    },
    // Dashboard Page
    {
      pagename: 'DashboardPage',
      elementname: 'dashboardHeader',
      locatorstrategy: 'xpath',
      locatorvalue: "//h1[text()='Dashboard']",
      timeout: 15000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'DashboardPage',
      elementname: 'userMenuBtn',
      locatorstrategy: 'css',
      locatorvalue: '.user-menu-btn',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'DashboardPage',
      elementname: 'logoutBtn',
      locatorstrategy: 'text',
      locatorvalue: 'Logout',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'DashboardPage',
      elementname: 'reportTypeDropdown',
      locatorstrategy: 'id',
      locatorvalue: 'report_type_select',
      timeout: 10000,
      iframe: '',
      parent: '',
    },
    {
      pagename: 'DashboardPage',
      elementname: 'reportTable',
      locatorstrategy: 'css',
      locatorvalue: 'table.reports-table',
      timeout: 15000,
      iframe: '',
      parent: '',
    },
    // Modal with iframe
    {
      pagename: 'ConfirmationModal',
      elementname: 'confirmButton',
      locatorstrategy: 'xpath',
      locatorvalue: "//button[text()='Confirm']",
      timeout: 10000,
      iframe: '#confirmModal',
      parent: '',
    },
    {
      pagename: 'ConfirmationModal',
      elementname: 'modalMessage',
      locatorstrategy: 'css',
      locatorvalue: '.modal-body-text',
      timeout: 10000,
      iframe: '#confirmModal',
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

  // Add headers
  worksheet.columns = [
    { header: 'ScenarioName', key: 'scenarioname', width: 30 },
    { header: 'ElementName', key: 'elementname', width: 20 },
    { header: 'TestData', key: 'testdata', width: 40 },
    { header: 'DataType', key: 'datatype', width: 15 },
  ];

  // Add sample data
  const testData = [
    // Successful login scenario
    {
      scenarioname: 'Successful login with valid credentials',
      elementname: 'username',
      testdata: 'testuser@example.com',
      datatype: 'string',
    },
    {
      scenarioname: 'Successful login with valid credentials',
      elementname: 'password',
      testdata: 'Password123!',
      datatype: 'string',
    },
    // Failed login scenario
    {
      scenarioname: 'Failed login with invalid credentials',
      elementname: 'username',
      testdata: 'invaliduser@example.com',
      datatype: 'string',
    },
    {
      scenarioname: 'Failed login with invalid credentials',
      elementname: 'password',
      testdata: 'wrongpassword',
      datatype: 'string',
    },
    // Login scenario
    {
      scenarioname: 'Successful login',
      elementname: 'username',
      testdata: 'testuser@example.com',
      datatype: 'string',
    },
    {
      scenarioname: 'Successful login',
      elementname: 'password',
      testdata: 'Password123!',
      datatype: 'string',
    },
    // Dashboard scenario
    {
      scenarioname: 'Navigate to dashboard and verify elements',
      elementname: 'none',
      testdata: 'N/A',
      datatype: 'string',
    },
    // Logout scenario
    {
      scenarioname: 'User can logout successfully',
      elementname: 'none',
      testdata: 'N/A',
      datatype: 'string',
    },
    // Report selection scenario
    {
      scenarioname: 'Verify table data with dropdown selection',
      elementname: 'reportTypeDropdown',
      testdata: 'Monthly',
      datatype: 'string',
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
