import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const reportPath = path.resolve(process.cwd(), 'playwright-report', 'index.html');
const cucumberPath = path.resolve(process.cwd(), 'reports', 'cucumber-report.html');

function openFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Report file not found: ${filePath}`);
  }

  const normalizedPath = filePath.replace(/"/g, '\\"');
  const platform = process.platform;

  let cmd;
  if (platform === 'win32') {
    cmd = `start "" "${normalizedPath}"`;
  } else if (platform === 'darwin') {
    cmd = `open "${normalizedPath}"`;
  } else {
    cmd = `xdg-open "${normalizedPath}"`;
  }

  exec(cmd, (error) => {
    if (error) {
      console.error(`Failed to open report with command '${cmd}':`, error.message);
      process.exit(1);
    }
  });
}

async function main() {
  try {
    if (fs.existsSync(reportPath)) {
      console.log(`Opening Playwright report: ${reportPath}`);
      openFile(reportPath);
      return;
    }

    if (fs.existsSync(cucumberPath)) {
      console.log(`Opening Cucumber report: ${cucumberPath}`);
      openFile(cucumberPath);
      return;
    }

    throw new Error('No report file found. Expected either playwright-report/index.html or reports/cucumber-report.html.');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();