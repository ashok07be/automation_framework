import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '..', 'data', 'locators.xlsx');

(async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet('Locators') || workbook.worksheets[0];
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    const values = row.values;
    console.log(rowNumber, values);
  });
})();
