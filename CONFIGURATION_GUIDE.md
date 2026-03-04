# ⚙️ Configuration Guide

Complete guide to configuring the Playwright + Cucumber Automation Framework.

## 📋 Table of Contents
1. [Environment Variables](#environment-variables)
2. [Playwright Configuration](#playwright-config)
3. [Cucumber Configuration](#cucumber-config)
4. [Locator Configuration](#locator-config)
5. [Test Data Configuration](#test-data-config)
6. [Browser Configuration](#browser-config)
7. [Logging Configuration](#logging-config)
8. [Advanced Configuration](#advanced-config)

---

## <a name="environment-variables"></a> 1. Environment Variables

All configuration is managed through `.env` file in the project root.

### Application URLs

```env
# Production application URL
BASE_URL=https://your-application.com
```

Used by `NavigateAction` for relative URL navigation.

### Browser Configuration

```env
# Browser engine: chromium, firefox, webkit
BROWSER=chromium

# Display browser window (false=headless)
HEADED=false

# Slow down actions (milliseconds between actions)
SLOWMO=0

# Enable debug mode (opens DevTools)
DEBUG=false
```

### Timeouts

All timeouts in milliseconds:

```env
# Default timeout for element operations
DEFAULT_TIMEOUT=30000

# Timeout for action execution (clicks, fills, etc.)
ACTION_TIMEOUT=15000

# Timeout for page navigation
NAVIGATION_TIMEOUT=30000
```

### File Paths

```env
# Path to locators Excel file
LOCATOR_FILE_PATH=./data/locators.xlsx

# Path to test data Excel file
TEST_DATA_PATH=./data/testdata.xlsx
```

### Logging

```env
# Log level: debug, info, warn, error
LOG_LEVEL=info

# Directory where logs are stored
LOG_DIR=./logs
```

### Environment

```env
# Environment: local, development, staging, production
ENVIRONMENT=local
```

---

## <a name="playwright-config"></a> 2. Playwright Configuration

File: `playwright.config.js`

### Viewport Configuration

```javascript
use: {
  viewport: { width: 1920, height: 1080 },
}
```

Customize viewport size if needed:

```javascript
use: {
  viewport: { width: 1280, height: 720 }, // Smaller viewport
}
```

### Screenshots

```javascript
use: {
  screenshot: 'only-on-failure', // only-on-failure, always, off
}
```

### Video Recording

```javascript
use: {
  video: 'retain-on-failure', // retain-on-failure, always, off
}
```

### Trace Recording

```javascript
use: {
  trace: 'on-first-retry', // on-first-retry, on-failure, always, off
}
```

### Browser Launch Options

Modify in `WebContextManager.js`:

```javascript
const browserLaunchOptions = {
  headless: !configManager.get('headed'),
  slowMo: configManager.get('slowMo', 0),
  args: [
    '--start-maximized',        // Start maximized
    '--no-sandbox',             // Disable sandbox
    '--disable-blink-features=AutomationControlled', // Hide automation
  ]
};
```

### Proxy Configuration

Add to `playwright.config.js`:

```javascript
use: {
  proxy: {
    server: 'http://proxy-server:3128',
    username: 'username',
    password: 'password',
  }
}
```

---

## <a name="cucumber-config"></a> 3. Cucumber Configuration

File: `cucumber.js`

### Test Filters

Run specific scenarios:

```bash
cucumber-js --tags "@smoke"
cucumber-js --tags "@regression"
cucumber-js --tags "@slow"
```

Add tags to feature files:

```gherkin
@smoke @critical
Scenario: Login with valid credentials
  ...
```

### Formatters

```javascript
format: [
  'progress-bar',
  'html:reports/cucumber-report.html',
  'json:reports/cucumber-report.json',
  'junit:reports/cucumber-report.xml',
]
```

### Parallel Execution

```javascript
module.exports = {
  default: {
    parallel: 4,  // Run 4 scenarios in parallel
  }
};
```

### Retry Failed Tests

```javascript
module.exports = {
  default: {
    retry: 1,     // Retry failed scenarios once
  }
};
```

---

## <a name="locator-config"></a> 4. Locator Configuration

File: `data/locators.xlsx`

### Required Columns

| Column | Description | Example |
|--------|-------------|---------|
| PageName | Name of the page | LoginPage |
| ElementName | Name of the element | username |
| LocatorStrategy | How to find the element | id, css, xpath, etc. |
| LocatorValue | The actual selector | user_input |
| Timeout | Element wait timeout (ms) | 10000 |
| iFrame | If element is in iframe | #modal |
| parent | Parent selector within iframe | .content |

### Locator Strategies

#### ID Selector
```excel
LocatorStrategy | LocatorValue
id              | user_input
```

#### CSS Selector
```excel
LocatorStrategy | LocatorValue
css             | input.username-field
css             | div.container button.submit
```

#### XPath
```excel
LocatorStrategy | LocatorValue
xpath           | //input[@id='user_input']
xpath           | //button[text()='Login']
xpath           | //*[@class='modal']//button
```

#### Playwright Selectors
```excel
LocatorStrategy | LocatorValue
text            | Login Button
getByText       | Login Button
role            | button,{name:'Login'}
getByRole       | button,{name:'Login'}
label           | Email Address
getByLabel      | Email Address
placeholder     | Enter email
getByPlaceholder| Enter email
testid          | login-btn
getByTestId     | login-btn
```

### iframe Configuration

For elements inside iframes:

```excel
PageName | ElementName | LocatorStrategy | LocatorValue | iFrame      | parent
Modal    | okBtn       | xpath           | //button     | #modalFrame |
```

### Timeout Settings

Recommended timeouts:

```env
# Fast loading elements (dropdowns, buttons)
Timeout: 5000

# Normal elements
Timeout: 10000

# Slow loading (dynamic content, iframes)
Timeout: 15000-30000
```

---

## <a name="test-data-config"></a> 5. Test Data Configuration

File: `data/testdata.xlsx`

### Required Columns

| Column | Description | Example |
|--------|-------------|---------|
| ScenarioName | Name of scenario | Login Scenario |
| ElementName | Name of element | username |
| TestData | The actual data | testuser@example.com |
| DataType | Type of data | string, number, boolean |

### Scenario Name Matching

Scenario name in feature file MUST match exactly:

```gherkin
Feature: Login
  Scenario: Successful login test
    ...
```

Excel:
```
ScenarioName: Successful login test
```

### Test Data Types

```excel
TestData | DataType | Description
123      | number   | Numeric value
true     | boolean  | Boolean value
test@ex  | string   | Text value
12/25/24 | date     | Date format
```

### Using Environment Variables in Test Data

```env
# In .env
TEST_USER_EMAIL=testuser@example.com
TEST_PASSWORD=SecurePass123
```

### Reusing Test Data

If same data used in multiple scenarios, create separate rows:

```excel
ScenarioName | ElementName | TestData
Scenario A   | email       | user@example.com
Scenario B   | email       | user@example.com
```

---

## <a name="browser-config"></a> 6. Browser Configuration

### Browser Selection

```env
BROWSER=chromium    # Default, fast
BROWSER=firefox     # Alternative
BROWSER=webkit      # WebKit (Safari)
```

### Headed Mode

```bash
# Headless (fast, CI/CD)
npm test

# Headed (see browser)
HEADED=true npm test
```

### Browser-Specific Options

In `WebContextManager.js`:

```javascript
switch (browserType.toLowerCase()) {
  case 'chromium':
    this.browser = await chromium.launch({
      args: ['--disable-dev-shm-usage'] // Reduce memory usage
    });
    break;
  case 'firefox':
    this.browser = await firefox.launch({
      firefoxUserPrefs: {
        'network.cookie.cookieBehavior': 0
      }
    });
    break;
  case 'webkit':
    this.browser = await webkit.launch({});
    break;
}
```

### Device Emulation

Add to `playwright.config.js`:

```javascript
projects: [
  {
    name: 'Mobile Chrome',
    use: {
      ...devices['Pixel 5'],
    },
  },
  {
    name: 'iPhone',
    use: {
      ...devices['iPhone 12'],
    },
  },
]
```

---

## <a name="logging-config"></a> 7. Logging Configuration

File: `src/utils/Logger.js`

### Log Levels

```env
# All logs
LOG_LEVEL=debug

# Important logs
LOG_LEVEL=info

# Issues only
LOG_LEVEL=warn

# Errors only
LOG_LEVEL=error
```

### Log Files

```env
# Directory for logs
LOG_DIR=./logs
```

Generated files:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

### Custom Log Format

Modify `Logger.js` format option:

```javascript
format: winston.format.printf(({ timestamp, level, message, ...meta }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message}`;
})
```

### Disabling Sensitive Data Logging

```javascript
// In actions
logger.info(`Filling field: ${elementName}`);
// Don't log the value:
// logger.info(`Filling ${elementName} with ${value}`);
```

---

## <a name="advanced-config"></a> 8. Advanced Configuration

### Custom Timeouts per Action

```javascript
// In step definitions
const locatorObj = {
  ...originalLocator,
  timeout: 5000  // Override timeout for this action
};
```

### Retry Configuration

Implement in step definitions:

```javascript
const TestHelper = require('../utils/TestHelper');

await TestHelper.retry(
  async () => {
    await actionManager.clickAction.click(locatorObj);
  },
  3,     // max retries
  2000   // initial delay
);
```

### Wait Strategies

```javascript
// Wait for element visibility
await page.waitForSelector(selector, { state: 'visible' });

// Wait for element to be clickable
await page.waitForFunction(() => {
  const el = document.querySelector(selector);
  return el && el.offsetHeight > 0;
});

// Wait for specific timeout
await page.waitForTimeout(2000);

// Wait for navigation
await page.waitForNavigation({ waitUntil: 'networkidle' });
```

### Custom Context Options

In `WebContextManager.js`:

```javascript
this.context = await this.browser.newContext({
  viewport: { width: 1920, height: 1080 },
  locale: 'en-US',
  timezone: 'America/New_York',
  colorScheme: 'dark',
  reducedMotion: 'reduce',
  geolocation: { latitude: 40.7128, longitude: -74.0060 },
  permissions: ['geolocation'],
});
```

### Custom Interceptors

```javascript
// Intercept network requests
await page.route('**/*.png', async route => {
  // Skip loading images
  await route.abort();
});

// Intercept API calls
await page.route('**/api/**', async route => {
  const response = await route.fetch();
  console.log(response.status());
  await route.continue();
});
```

---

## 🔍 Configuration Validation

The framework validates configuration on startup:

```javascript
configManager.validate();
```

Checks for:
- baseUrl is set
- locatorFilePath exists
- testDataPath exists

### Pre-test Checks

Add to step definitions:

```javascript
Before(async function() {
  // Validate that all required locators are loaded
  if (locatorReader.getLocatorCount() === 0) {
    throw new Error('No locators loaded!');
  }
});
```

---

## 📝 Configuration Checklist

- [ ] Update `BASE_URL` in `.env`
- [ ] Set `BROWSER` preference
- [ ] Adjust `TIMEOUT` values for your app
- [ ] Update `LOCATOR_FILE_PATH` and `TEST_DATA_PATH`
- [ ] Create or update `locators.xlsx`
- [ ] Create or update `testdata.xlsx`
- [ ] Set `LOG_LEVEL` appropriately
- [ ] Configure CI/CD specific settings (if applicable)
- [ ] Test with sample scenarios

---

## 🚨 Troubleshooting Configuration

### Tests Run Slow
- Increase parallelism in `cucumber.js`
- Reduce `SLOWMO` value
- Check network conditions
- Optimize locators (use simpler selectors)

### Element Timeout Errors
- Increase `DEFAULT_TIMEOUT` in `.env`
- Check locator is correct
- Verify network is working
- Check element loads with HEADED=true

### Memory Issues
- Reduce `parallel` workers in `cucumber.js`
- Add `--no-sandbox` to browser args
- Run fewer parallel tests

### Flaky Tests
- Increase timeouts for slow elements
- Implement retry logic
- Add wait conditions
- Use more stable selectors

---

For more help, see:
- [README.md](README.md)
- [QUICK_START.md](QUICK_START.md)
- [ADVANCED_GUIDE.md](ADVANCED_GUIDE.md)
