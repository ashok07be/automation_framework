import ExcelJS from 'exceljs';

async function updateLocators() {
  // load workbook and grab all rows
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./data/locators.xlsx');
  const ws = workbook.getWorksheet('Locators') || workbook.worksheets[0];

  // read existing rows into map for deduplication
  const locatorMap = new Map(); // key -> array of values
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const page = row.getCell(1).value;
    const element = row.getCell(2).value;
    const strategy = row.getCell(3).value;
    const value = row.getCell(4).value;
    const timeout = row.getCell(5).value;
    const iframe = row.getCell(6).value;
    const parent = row.getCell(7).value;
    const key = `${page}|${element}`;
    if (!locatorMap.has(key)) {
      locatorMap.set(key, [page, element, strategy, value, timeout, iframe, parent]);
    }
  });

  const rowsToAdd = [
    ['DashboardPage','productItem','css','.inventory_item:first-child',10000,'',''],
    ['DashboardPage','addToCartBtn','css','.btn_inventory',10000,'',''],
    ['DashboardPage','cartLink','id','shopping_cart_container',10000,'',''],
    ['CartPage','checkoutBtn','id','checkout',10000,'',''],
    ['CheckoutPage','firstName','id','first-name',10000,'',''],
    ['CheckoutPage','lastName','id','last-name',10000,'',''],
    ['CheckoutPage','postalCode','id','postal-code',10000,'',''],
    ['CheckoutPage','continueBtn','id','continue',10000,'',''],
    ['CheckoutPage','finishBtn','id','finish',10000,'','']
  ];

  // add any missing rows
  let added = 0;
  rowsToAdd.forEach(r => {
    const key = `${r[0]}|${r[1]}`;
    if (!locatorMap.has(key)) {
      locatorMap.set(key, r);
      added++;
    }
  });

  // rebuild worksheet: clear and rewrite header + unique rows
  const header = ws.getRow(1).values; // keep original header row
  // remove all rows except header
  ws.spliceRows(2, ws.rowCount - 1);

  // append unique rows from map
  locatorMap.forEach(vals => {
    ws.addRow(vals);
  });

  if (added > 0) {
    await workbook.xlsx.writeFile('./data/locators.xlsx');
    console.log(`Added ${added} locator rows (duplicates removed)`);
  } else {
    await workbook.xlsx.writeFile('./data/locators.xlsx');
    console.log('No new locators needed; sheet cleaned of duplicates');
  }
}

async function updateTestData() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./data/testdata.xlsx');
  const ws = workbook.getWorksheet('TestData') || workbook.worksheets[0];

  // find header columns
  const headerRow = ws.getRow(1);
  const headers = {};
  headerRow.eachCell((cell, col) => {
    headers[cell.value] = col;
  });

  // scenarios to ensure test data for
  const scenariosToAdd = [
    'End-to-end purchase flow',
    'Access dashboard after successful login'
  ];

  scenariosToAdd.forEach((scenarioName) => {
    let existsScenario = false;
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (row.getCell(1).value === scenarioName) {
        existsScenario = true;
      }
    });

    if (!existsScenario) {
      const row = [];
      row[1] = scenarioName;
      row[headers['username']] = 'standard_user';
      row[headers['password']] = 'secret_sauce';
      ws.addRow(row);
      console.log(`Added test data row for scenario '${scenarioName}'`);
    } else {
      console.log(`Scenario test data already present for '${scenarioName}'`);
    }
  });

  await workbook.xlsx.writeFile('./data/testdata.xlsx');
}

(async () => {
  await updateLocators();
  await updateTestData();
})();
