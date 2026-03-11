import ExcelJS from 'exceljs';

(async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./data/testdata.xlsx');
  const ws = workbook.getWorksheet('TestData') || workbook.worksheets[0];
  ws.eachRow((row, rowNumber) => {
    console.log(rowNumber, row.values);
  });
})();
