# Advanced Framework Guide

## 📚 Table of Contents
1. [Extending the Framework](#extending)
2. [Custom Actions](#custom-actions)
3. [Advanced Selectors](#advanced-selectors)
4. [Complex Scenarios](#complex-scenarios)
5. [Performance Optimization](#performance)
6. [CI/CD Integration](#cicd)

## <a name="extending"></a> 1. Extending the Framework

### Creating Custom Action Classes

Create a new action class extending `BaseAction`:

```javascript
// src/actions/CustomAction.js
import BaseAction from './BaseAction.js';
import logger from '../utils/Logger.js';

class CustomAction extends BaseAction {
  async customInteraction(locatorObj, params) {
    try {
      this._logAction('CUSTOM_INTERACTION', locatorObj, params);
      
      const locator = await this.getElementLocator(locatorObj);
      await this.waitForElement(locator, locatorObj.timeout);
      
      // Your custom logic here
      
    } catch (error) {
      this._handleError(error, 'CUSTOM_INTERACTION', locatorObj);
    }
  }
}

export default CustomAction;
```

### Adding Custom Step Definitions

Add new steps to `src/steps/stepDefinitions.js`:

```javascript
When(/^CUSTOM STEP "([^"]*)"$/, async function (param) {
  try {
    logger.info(`[Step] CUSTOM STEP "${param}"`);
    // Your step implementation
  } catch (error) {
    logger.error(`Step failed: ${error.message}`);
    throw error;
  }
});
```

## <a name="custom-actions"></a> 2. Custom Actions

### Example: Drag and Drop Action

```javascript
async dragAndDrop(sourceLocatorObj, targetLocatorObj) {
  try {
    const sourceLocator = await this.getElementLocator(sourceLocatorObj);
    const targetLocator = await this.getElementLocator(targetLocatorObj);
    
    await this.waitForElement(sourceLocator, sourceLocatorObj.timeout);
    await this.waitForElement(targetLocator, targetLocatorObj.timeout);
    
    await sourceLocator.dragTo(targetLocator);
    
    logger.info('Drag and drop completed');
  } catch (error) {
    logger.error(`Drag and drop failed: ${error.message}`);
    throw error;
  }
}
```

### Example: File Upload Action

```javascript
async uploadFile(locatorObj, filePath) {
  try {
    const locator = await this.getElementLocator(locatorObj);
    await locator.setInputFiles(filePath);
    logger.info(`File uploaded: ${filePath}`);
  } catch (error) {
    logger.error(`File upload failed: ${error.message}`);
    throw error;
  }
}
```

### Example: Hover Action

```javascript
async hover(locatorObj) {
  try {
    const locator = await this.getElementLocator(locatorObj);
    await this.waitForElement(locator, locatorObj.timeout);
    await locator.hover();
    logger.info('Hover action completed');
  } catch (error) {
    logger.error(`Hover failed: ${error.message}`);
    throw error;
  }
}
```

## <a name="advanced-selectors"></a> 3. Advanced Selectors

### Playwright Built-in Selectors

The framework supports all Playwright selectors:

```excel
LocatorStrategy | LocatorValue | Description
getByRole      | button,{name:"Submit"} | Select by role
getByText      | Login | Select by text content
getByLabel     | Email | Select by associated label
getByPlaceholder | Enter email | Select by placeholder
getByTestId    | submit-btn | Select by data-testid
```

### Chained Selectors

For complex element hierarchies:

```excel
PageName | ElementName | LocatorStrategy | LocatorValue
Modal    | submitBtn   | xpath | //div[@role='dialog']//button[@type='submit']
```

### Shadow DOM Elements

```javascript
// In IFrameHandler, when dealing with shadow DOM:
const selector = `parent=form >> child=input`;
// Playwright will handle shadow DOM traversal
```

## <a name="complex-scenarios"></a> 4. Complex Scenarios

### Multi-page Workflows

```gherkin
Feature: Complete User Journey

Scenario: User registration and login flow
  Given NAVIGATE TO "/register"
  When FILL "firstName" WITH "John"
  And FILL "lastName" WITH "Doe"
  And FILL "email" WITH "john@example.com"
  And FILL "password" WITH "SecurePass123!"
  And CLICK "registerBtn"
  Then VERIFY TEXT "Registration successful"
  
  Given NAVIGATE TO "/login"
  When FILL "email" WITH "john@example.com"
  And FILL "password" WITH "SecurePass123!"
  And CLICK "loginBtn"
  Then VERIFY TEXT "Welcome John"
```

### Conditional Assertions

```gherkin
Scenario: Verify optional elements on dashboard
  Given NAVIGATE TO "/dashboard"
  When CLICK "loadMoreBtn"
  And WAIT FOR "2" SECONDS
  Then VERIFY ELEMENT "hiddenContent" IS VISIBLE
  And VERIFY TEXT "Additional information"
```

### Data-Driven Tests

Create multiple scenarios with different data:

```gherkin
Scenario: Login with admin user
  Given NAVIGATE TO "/login"
  When FILL "username"
  And FILL "password"
  And CLICK "loginBtn"
  Then VERIFY TEXT "Admin Dashboard"

Scenario: Login with regular user
  Given NAVIGATE TO "/login"
  When FILL "username"
  And FILL "password"
  And CLICK "loginBtn"
  Then VERIFY TEXT "User Dashboard"
```

## <a name="performance"></a> 5. Performance Optimization

### Parallel Execution

Update `cucumber.js`:

```javascript
module.exports = {
  default: {
    parallel: 4,  // Run 4 tests in parallel
    format: ['progress-bar', 'html:reports/cucumber-report.html'],
  },
};
```

### Optimize Timeouts

```env
# Adjust based on your application
DEFAULT_TIMEOUT=20000      # Reduced from 30000
ACTION_TIMEOUT=10000       # Reduced from 15000
NAVIGATION_TIMEOUT=20000   # Reduced from 30000
```

### Caching Locators

The LocatorReader caches all locators in memory - no repeated Excel reads.

### Screenshot Only on Failure

Already configured in `playwright.config.js`:
```javascript
screenshot: 'only-on-failure'
```

## <a name="cicd"></a> 6. CI/CD Integration

### GitHub Actions Example

```yaml
name: Automation Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Install Playwright browsers
        run: npx playwright install
      
      - name: Run tests
        run: npm test
      
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: reports/
```

### Jenkins Pipeline Example

```groovy
pipeline {
  agent any
  
  stages {
    stage('Install') {
      steps {
        sh 'npm install'
        sh 'npx playwright install'
      }
    }
    
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    
    stage('Report') {
      steps {
        publishHTML([
          reportDir: 'reports',
          reportFiles: 'cucumber-report.html',
          reportName: 'Test Report'
        ])
      }
    }
  }
  
  post {
    always {
      archiveArtifacts artifacts: 'reports/**'
      junit 'test-results/*.xml'
    }
  }
}
```

### Docker Integration

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npx playwright install

COPY . .

CMD ["npm", "test"]
```

## 🔒 Security Best Practices

### Handling Sensitive Data

```javascript
// In step definitions
When(/^LOGIN WITH CREDENTIALS$/, async function () {
  // Use environment variables for sensitive data
  const username = process.env.TEST_USER;
  const password = process.env.TEST_PASSWORD;
  
  const usernameLocator = await this.actionManager
    .fillAction.fill(usernameField, username);
  
  // Don't log sensitive values
  logger.info('Login attempt'); // Don't include credentials
});
```

### Excel File Security

- Never commit Excel files with real passwords to VCS
- Use environment variables for sensitive test data
- Implement role-based test data management

## 📈 Monitoring & Analytics

### Test Metrics

Extract from reports:
- Total test cases
- Pass/fail rate
- Average execution time
- Flaky tests

### Custom Reporting

Create `scripts/generateReport.js` for advanced reporting:

```javascript
import fs from 'fs';
import path from 'path';

function generateReport() {
  const reportJson = JSON.parse(
    fs.readFileSync('./reports/cucumber-report.json', 'utf8')
  );
  
  // Process and create custom metrics
  // Generate dashboards, charts, etc.
}

generateReport();
```

## 🚀 Best Practices Summary

1. ✅ Keep feature files simple and readable
2. ✅ Centralize test data in Excel
3. ✅ Use meaningful element names
4. ✅ Set appropriate timeouts
5. ✅ Log extensively for debugging
6. ✅ Handle errors gracefully
7. ✅ Use Playwright selectors (getByRole, getByText, etc.)
8. ✅ Maintain locator quality
9. ✅ Implement retry logic for flaky tests
10. ✅ Document custom actions and steps

## 📞 Common Issues & Solutions

### Issue: Element Locator Not Found

```javascript
// Debug
logger.debug('Attempted selector:', locatorObj);

// Solution: Update locators.xlsx with correct selector
// Use browser DevTools to verify selector path
```

### Issue: Timeout Errors

```env
# Increase timeouts
DEFAULT_TIMEOUT=40000
ACTION_TIMEOUT=20000
NAVIGATION_TIMEOUT=40000
```

### Issue: Flaky Tests

```javascript
// Implement retry logic
await TestHelper.retry(
  async () => {
    await element.click();
  },
  3, // max retries
  1000 // initial delay
);
```

---

**For more details, refer to:**
- [Playwright Official Docs](https://playwright.dev)
- [Cucumber Official Docs](https://cucumber.io)
