import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '..', 'data', 'testdata.xlsx');

(async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet('TestData') || workbook.worksheets[0];
  worksheet.eachRow((row, rowNumber) => {
    console.log(rowNumber, row.values);
  });
})();
