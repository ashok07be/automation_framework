import ExcelJS from 'exceljs';

(async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./data/locators.xlsx');
  const ws = workbook.getWorksheet('Locators') || workbook.worksheets[0];
  let changed = false;
  ws.eachRow((row,rowNumber) => {
    if(rowNumber === 1) return;
    const page = row.getCell(1).value;
    const element = row.getCell(2).value;
    if(page === 'DashboardPage' && element === 'addToCartBtn'){
      console.log('Old value',row.getCell(4).value);
      row.getCell(4).value = '.inventory_item:first-child .btn_inventory';
      changed = true;
    }
  });
  if(changed){
    await workbook.xlsx.writeFile('./data/locators.xlsx');
    console.log('Updated addToCartBtn locator');
  } else {
    console.log('addToCartBtn locator not found or unchanged');
  }
})();
