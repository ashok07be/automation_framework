# Playwright + Cucumber Automation Framework

A production-grade, enterprise-class automation testing framework built on **Playwright** and **Cucumber**, designed for maintainability, scalability, and ease of use.

## 🎯 Key Features

- ✅ **Framework agnostic** - Same source code for all automation tests
- ✅ **Excel-based locators** - Centralized element management
- ✅ **Excel-based test data** - Scenario-driven test data
- ✅ **Generic feature files** - Write tests by changing feature files only
- ✅ **Comprehensive action classes** - Pre-built actions for common interactions
- ✅ **Transparent iframe handling** - No separate functions needed for iframe elements
- ✅ **Playwright selectors** - Native Playwright selector support (getByRole, getByText, etc.)
- ✅ **Advanced logging** - Detailed logs for debugging
- ✅ **Multiple browser support** - Chrome, Firefox, Safari
- ✅ **Screenshot on failure** - Automatic failure screenshots
- ✅ **Production-grade code** - High-quality, maintainable codebase

## 📁 Project Structure

```
automation_framework/
├── src/
│   ├── actions/           # Action classes (Click, Fill, Select, Navigate, Assert)
│   ├── readers/           # Excel readers (Locators, Test Data)
│   ├── config/            # Configuration management
│   ├── utils/             # Utilities (Logger, IFrameHandler, WebContextManager, etc.)
│   └── steps/             # Cucumber step definitions
├── features/              # Cucumber feature files
├── data/
│   ├── locators.xlsx      # Locator definitions (Excel)
│   └── testdata.xlsx      # Test data (Excel)
├── reports/               # Test reports and screenshots
├── logs/                  # Application logs
├── playwright.config.js   # Playwright configuration
├── cucumber.js            # Cucumber configuration
├── .env                   # Environment variables
└── package.json           # Project dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Clone/create the project**
   ```bash
   cd automation_framework
   npm install
   ```

2. **Update .env file**
   ```env
   BASE_URL=https://your-application.com
   LOCATOR_FILE_PATH=./data/locators.xlsx
   TEST_DATA_PATH=./data/testdata.xlsx
   ```

3. **Create locators Excel file** (See section below)

4. **Create test data Excel file** (See section below)

5. **Run tests**
   ```bash
   npm test
   ```

## 📊 Locators Excel File Structure

Create `data/locators.xlsx` with the following structure:

| PageName    | ElementName | LocatorStrategy | LocatorValue               | Timeout | iFrame       | parent |
|-------------|-------------|-----------------|----------------------------|---------|--------------|--------|
| LoginPage   | username    | id              | user_input                 | 10000   |              |        |
| LoginPage   | password    | id              | password_input             | 10000   |              |        |
| LoginPage   | loginBtn    | xpath           | //button[@type='submit']   | 10000   |              |        |
| LoginPage   | rememberMe  | css             | input[type='checkbox']     | 10000   |              |        |
| DashboardPage | notification | css           | .notification-alert        | 15000   | frame#notif  |        |
| Modal       | okButton    | getByRole       | button,{name:"OK"}         | 10000   |              |        |

### Supported Locator Strategies
- **id** - HTML element ID
- **css** / **cssselector** - CSS selector
- **xpath** - XPath expression
- **class** - HTML class name
- **text** / **getbytext** - Playwright text selector
- **role** / **getbyrole** - Playwright role selector
- **label** / **getbylabel** - Playwright label selector
- **placeholder** / **getbyplaceholder** - Placeholder attribute
- **testid** / **getbytestid** - Data-testid attribute

## 📋 Test Data Excel File Structure

Create `data/testdata.xlsx` with the following structure:

| ScenarioName          | username              | password            | email                | firstName |
|---------------------- |---------------------- |-------------------- |----------------------|-----------|
| Successful login      | testuser@example.com  | password123         | -                    | -         |
| Failed login          | invaliduser           | wrongpassword       | -                    | -         |
| Registration scenario | -                     | -                   | newuser@example.com  | John      |

## ✍️ Writing Feature Files

Feature files use simple, readable steps with generic actions:

```gherkin
Feature: User Login
  Scenario: Successful login
    Given NAVIGATE TO "/login"
    When FILL "username"
    And FILL "password"
    And CLICK "loginBtn"
    Then VERIFY TEXT "Dashboard"
    And VERIFY ELEMENT "dashboardHeader" IS VISIBLE
```

### Available Step Definitions

#### Navigation
- `Given NAVIGATE TO "<url>"` - Navigate to URL
- `Given NAVIGATE "<pageName>"` - Navigate using page name
- `When REFRESH THE PAGE` - Refresh current page

#### Input Actions
- `When FILL "<elementName>"` - Fill with test data
- `When FILL "<elementName>" WITH "<value>"` - Fill with explicit value
- `When CLICK "<elementName>"` - Click element
- `When SELECT "<elementName>" WITH "<value>"` - Select dropdown
- `When WAIT FOR "<seconds>" SECONDS` - Wait

#### Assertions
- `Then VERIFY TEXT "<text>"` - Verify text on page
- `Then VERIFY ELEMENT "<elementName>" IS VISIBLE` - Verify element visible
- `Then VERIFY ELEMENT "<elementName>" EXISTS` - Verify element exists

#### Advanced
- `When PERFORM "<action>" ON PAGE "<pageName>" ELEMENT "<elementName>" WITH "<value>"`

## 🎬 Action Classes

### Available Actions

#### ClickAction
- `click()` - Standard click
- `doubleClick()` - Double click
- `rightClick()` - Right click (context menu)
- `forceClick()` - Force click (ignores visibility)

#### FillAction
- `fill(locatorObj, value)` - Fill input field
- `clear(locatorObj)` - Clear input field
- `type(locatorObj, value, delay)` - Type with delay
- `getValue(locatorObj)` - Get input value
- `verifyValue(locatorObj, expectedValue)` - Verify value

#### SelectAction
- `selectByValue(locatorObj, value)` - Select by value
- `selectByText(locatorObj, text)` - Select by visible text
- `selectByIndex(locatorObj, index)` - Select by index
- `getAllOptions(locatorObj)` - Get all options
- `getSelectedValue(locatorObj)` - Get selected value

#### NavigateAction
- `navigateTo(url)` - Navigate to URL
- `navigateToPage(pageName)` - Navigate using page map
- `goBack()` - Go back in history
- `goForward()` - Go forward in history
- `refresh()` - Refresh page
- `waitForPageLoad()` - Wait for page to load

#### AssertAction
- `assertTextPresent(text)` - Assert text on page
- `assertElementVisible(locatorObj)` - Assert element visible
- `assertElementExists(locatorObj)` - Assert element exists
- `assertElementText(locatorObj, expectedText)` - Assert element text
- `assertElementEnabled(locatorObj)` - Assert element enabled
- `assertUrlContains(url)` - Assert URL contains
- `assertPageTitle(title)` - Assert page title

## 🔄 IFrame Handling

The framework handles iframes **transparently** without requiring separate functions:

```excel
PageName | ElementName | LocatorStrategy | LocatorValue | iFrame        | parent
Modal    | confirmBtn  | xpath           | //button     | #iframeModal  |
```

The framework automatically:
1. Identifies the iframe
2. Switches to the iframe context
3. Finds the element within iframe
4. Executes the action

No special code required!

## ⚙️ Configuration

Edit `.env` file to configure:

```env
# Browser
BROWSER=chromium          # chromium, firefox, webkit
HEADED=false              # true for headed mode
SLOWMO=0                  # milliseconds slow motion

# Timeouts
DEFAULT_TIMEOUT=30000     # Default element timeout
ACTION_TIMEOUT=15000      # Action timeout
NAVIGATION_TIMEOUT=30000  # Navigation timeout

# Logging
LOG_LEVEL=info            # Logging level (debug, info, warn, error)
LOG_DIR=./logs            # Log directory

# Files
LOCATOR_FILE_PATH=./data/locators.xlsx
TEST_DATA_PATH=./data/testdata.xlsx
```

## 🧪 Running Tests

### Run all tests
```bash
npm test
```

### Run specific browser
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Run in headed mode
```bash
npm run test:headed
```

### Debug mode
```bash
npm run test:debug
```

## 📊 Reports

Test reports are generated in `reports/` directory:
- `cucumber-report.html` - Cucumber HTML report
- Failure screenshots - Automatic screenshots on failure

## 📝 Logging

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

Log levels: `debug`, `info`, `warn`, `error`

## 🛠️ Adding New Feature Files

1. Create a new `.feature` file in `features/` directory
2. Add corresponding test data in `testdata.xlsx` if needed
3. Ensure all elements are defined in `locators.xlsx`
4. Run tests: `npm test`

## 📚 Best Practices

1. **Keep feature files simple** - One feature per file
2. **Maintain locators** - Update Excel when UI changes
3. **Use test data** - Define reusable test data
4. **Descriptive names** - Use clear page and element names
5. **Timeout values** - Set appropriate timeouts per element
6. **Logs** - Check logs for debugging
7. **Screenshots** - Use failure screenshots for analysis

## 🔍 Debugging

1. **Check logs** - Review `logs/combined.log`
2. **Enable debug mode** - `DEBUG=true npm test`
3. **Headed mode** - `npm run test:headed` to see browser
4. **Screenshots** - Check `reports/` for failure screenshots
5. **Playwright inspector** - Use Playwright Test inspector

## 🚨 Troubleshooting

### Element not found
1. Verify element in `locators.xlsx`
2. Check locator strategy and value
3. Check iframe configuration if applicable
4. Use browser DevTools to verify selector

### Timeout errors
1. Increase timeout in `locators.xlsx`
2. Add wait steps in feature file
3. Check application responsiveness

### Test data not found
1. Verify scenario name in `testdata.xlsx`
2. Check element name matches exactly
3. Ensure file is saved and closed

## 📖 Documentation

- [Playwright Documentation](https://playwright.dev)
- [Cucumber Documentation](https://cucumber.io)
- [Node.js Documentation](https://nodejs.org)

## 🤝 Contributing

When adding new features:
1. Follow existing code structure
2. Add comprehensive logging
3. Update documentation
4. Test thoroughly

## 📄 License

MIT

## 📧 Contact

For questions or support, contact the automation team.

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Framework**: Playwright + Cucumber + Node.js
