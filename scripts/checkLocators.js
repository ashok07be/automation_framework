import ExcelJS from 'exceljs';

(async()=>{
  const wb=new ExcelJS.Workbook();
  await wb.xlsx.readFile('./data/locators.xlsx');
  const ws=wb.getWorksheet('Locators')||wb.worksheets[0];
  const existing=new Set();
  ws.eachRow((row,rowNumber)=>{
    if(rowNumber===1) return;
    const page=row.getCell(2).value;
    const element=row.getCell(3).value;
    existing.add(`${page}|${element}`);
  });
  console.log('Existing keys:');
  existing.forEach(k=>console.log(k));
})();
