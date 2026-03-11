import ExcelJS from 'exceljs';

(async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./data/locators.xlsx');
  const ws = workbook.getWorksheet('Locators') || workbook.worksheets[0];
  ws.eachRow((row, rowNumber) => {
    console.log(rowNumber, row.values);
  });
})();
