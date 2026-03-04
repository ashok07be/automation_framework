# 📚 Framework API Documentation

## Table of Contents
1. [ActionManager](#actionmanager)
2. [ClickAction](#clickaction)
3. [FillAction](#fillaction)
4. [SelectAction](#selectaction)
5. [NavigateAction](#navigateaction)
6. [AssertAction](#assertaction)
7. [LocatorReader](#locatorreader)
8. [TestDataReader](#testdatareader)
9. [IFrameHandler](#iframehandler)
10. [WebContextManager](#webcontextmanager)
11. [TestHelper](#testhelper)

---

## <a name="actionmanager"></a> ActionManager

Central orchestrator for all actions. Provides unified interface to access all action classes.

### Constructor
```javascript
new ActionManager(page)
```

### Methods

#### executeAction(actionName, locatorObj, value)
Execute an action based on action name from feature file.

**Parameters:**
- `actionName` (string): Name of action (CLICK, FILL, SELECT, NAVIGATE, ASSERT, etc.)
- `locatorObj` (Object): Locator object from Excel
- `value` (any): Value to use for action (if applicable)

**Returns:** Promise<any>

**Example:**
```javascript
await actionManager.executeAction('CLICK', locatorObj);
await actionManager.executeAction('FILL', locatorObj, 'somevalue');
```

#### getActionHandler(actionType)
Get action handler for a specific action type.

**Parameters:**
- `actionType` (string): Type of action

**Returns:** Object (Action handler)

---

## <a name="clickaction"></a> ClickAction

Handles all click interactions.

### Methods

#### click(locatorObj)
Click on an element.

**Parameters:**
- `locatorObj` (Object): Locator object

**Returns:** Promise<void>

#### doubleClick(locatorObj)
Double click on an element.

#### rightClick(locatorObj)
Right click (context menu) on an element.

#### forceClick(locatorObj)
Force click bypassing visibility checks.

#### clickWithModifiers(locatorObj, modifiers)
Click with keyboard modifiers.

**Parameters:**
- `modifiers`: Object with {shift, control, alt, meta}

#### isClickable(locatorObj)
Check if element is clickable.

**Returns:** Promise<boolean>

---

## <a name="fillaction"></a> FillAction

Handles all text input interactions.

### Methods

#### fill(locatorObj, value)
Fill text in an input field.

**Parameters:**
- `locatorObj` (Object): Locator object
- `value` (string): Value to fill

**Returns:** Promise<void>

#### clear(locatorObj)
Clear an input field.

#### type(locatorObj, value, delay)
Type text character by character.

**Parameters:**
- `delay` (number): Delay between characters in ms (default: 50)

#### appendText(locatorObj, value)
Append text without clearing existing value.

#### getValue(locatorObj)
Get current value of input field.

**Returns:** Promise<string>

#### hasValue(locatorObj)
Check if input field has a value.

**Returns:** Promise<boolean>

#### setValueViaJS(locatorObj, value)
Set input value using JavaScript.

#### verifyValue(locatorObj, expectedValue)
Verify input field value.

**Returns:** Promise<boolean>

---

## <a name="selectaction"></a> SelectAction

Handles all select/dropdown interactions.

### Methods

#### selectByValue(locatorObj, value)
Select option by value from select element.

**Parameters:**
- `value` (string): Value to select

**Returns:** Promise<void>

#### selectByText(locatorObj, text)
Select option by visible text.

**Parameters:**
- `text` (string): Text to select

**Returns:** Promise<void>

#### selectByIndex(locatorObj, index)
Select option by index (0-based).

**Parameters:**
- `index` (number): Index of option

**Returns:** Promise<void>

#### getAllOptions(locatorObj)
Get all options from select element.

**Returns:** Promise<Array>

#### getSelectedValue(locatorObj)
Get selected option value.

**Returns:** Promise<string>

#### getSelectedText(locatorObj)
Get selected option text.

**Returns:** Promise<string>

#### isOptionAvailable(locatorObj, optionValue)
Check if option is available.

**Returns:** Promise<boolean>

#### selectMultiple(locatorObj, values)
Multi-select options.

**Parameters:**
- `values` (Array<string>): Array of values to select

**Returns:** Promise<void>

---

## <a name="navigateaction"></a> NavigateAction

Handles all page navigation.

### Methods

#### navigateTo(url)
Navigate to a URL.

**Parameters:**
- `url` (string): URL to navigate to

**Returns:** Promise<void>

#### navigateToPage(pageName)
Navigate using page name from locator file.

**Parameters:**
- `pageName` (string): Page name

**Returns:** Promise<void>

#### goBack()
Go back in browser history.

**Returns:** Promise<void>

#### goForward()
Go forward in browser history.

**Returns:** Promise<void>

#### refresh()
Refresh the page.

**Returns:** Promise<void>

#### getCurrentUrl()
Get current page URL.

**Returns:** string

#### getPageTitle()
Get page title.

**Returns:** Promise<string>

#### waitForUrlChange(expectedUrl, timeout)
Wait for URL to change.

**Returns:** Promise<void>

#### isOnPage(expectedUrl)
Check if page is on specific URL.

**Returns:** Promise<boolean>

---

## <a name="assertaction"></a> AssertAction

Handles all assertion/verification operations.

### Methods

#### assertTextPresent(text)
Assert that text is present on page.

**Returns:** Promise<boolean>

#### assertTextNotPresent(text)
Assert that text is NOT present.

**Returns:** Promise<boolean>

#### assertElementVisible(locatorObj)
Assert element is visible.

**Returns:** Promise<boolean>

#### assertElementNotVisible(locatorObj)
Assert element is NOT visible.

**Returns:** Promise<boolean>

#### assertElementExists(locatorObj)
Assert element exists in DOM.

**Returns:** Promise<boolean>

#### assertElementNotExists(locatorObj)
Assert element does NOT exist.

**Returns:** Promise<boolean>

#### assertElementText(locatorObj, expectedText)
Assert element text content.

**Returns:** Promise<boolean>

#### assertElementContainsText(locatorObj, expectedText)
Assert element contains text.

**Returns:** Promise<boolean>

#### assertElementAttribute(locatorObj, attributeName, expectedValue)
Assert element attribute value.

**Returns:** Promise<boolean>

#### assertElementEnabled(locatorObj)
Assert element is enabled.

**Returns:** Promise<boolean>

#### assertElementDisabled(locatorObj)
Assert element is disabled.

**Returns:** Promise<boolean>

#### assertUrlContains(expectedUrl)
Assert URL contains text.

**Returns:** Promise<boolean>

#### assertPageTitle(expectedTitle)
Assert page title.

**Returns:** Promise<boolean>

#### assertElementCount(locatorObj, expectedCount)
Assert element count.

**Returns:** Promise<boolean>

#### assertElementChecked(locatorObj)
Assert checkbox is checked.

**Returns:** Promise<boolean>

#### assertElementNotChecked(locatorObj)
Assert checkbox is not checked.

**Returns:** Promise<boolean>

---

## <a name="locatorreader"></a> LocatorReader

Reads and manages locators from Excel file.

### Constructor
```javascript
new LocatorReader(filePath)
```

### Methods

#### load()
Load locators from Excel file.

**Returns:** Promise<void>

#### getLocator(pageName, elementName)
Get locator object for specific page and element.

**Parameters:**
- `pageName` (string): Name of the page
- `elementName` (string): Name of the element

**Returns:** Object (Locator object)

**Example:**
```javascript
const locator = locatorReader.getLocator('LoginPage', 'username');
```

#### getPageLocators(pageName)
Get all locators for a page.

**Parameters:**
- `pageName` (string): Name of the page

**Returns:** Map<string, Object>

#### getPages()
Get all available pages.

**Returns:** Array<string>

#### hasLocator(pageName, elementName)
Check if locator exists.

**Returns:** boolean

#### getLocatorCount()
Get total number of locators.

**Returns:** number

---

## <a name="testdatareader"></a> TestDataReader

Reads and manages test data from Excel file.

### Constructor
```javascript
new TestDataReader(filePath)
```

### Methods

#### load()
Load test data from Excel file.

**Returns:** Promise<void>

#### getTestData(scenarioName, elementName)
Get test data for specific scenario and element.

**Parameters:**
- `scenarioName` (string): Name of scenario
- `elementName` (string): Name of element

**Returns:** any (Test data value)

#### getScenarioData(scenarioName)
Get all test data for a scenario.

**Parameters:**
- `scenarioName` (string): Name of scenario

**Returns:** Map<string, any>

#### hasTestData(scenarioName, elementName)
Check if test data exists.

**Returns:** boolean

#### getScenarios()
Get all available scenarios.

**Returns:** Array<string>

#### getTestDataCount()
Get total number of test data entries.

**Returns:** number

---

## <a name="iframehandler"></a> IFrameHandler

Handles iframe navigation and element finding transparently.

### Static Methods

#### getElementLocator(page, locatorObj)
Get element locator considering iframe hierarchy.

**Returns:** Promise<Locator>

#### waitForElement(locator, timeout)
Wait for element with timeout.

**Returns:** Promise<void>

#### isElementVisible(locator)
Check if element is visible.

**Returns:** Promise<boolean>

#### elementExists(locator)
Check if element exists.

**Returns:** Promise<boolean>

#### scrollIntoView(locator)
Scroll element into view.

**Returns:** Promise<void>

#### getElementCount(locator)
Get element count.

**Returns:** Promise<number>

#### getAttribute(locator, attributeName)
Get element's attribute value.

**Returns:** Promise<string>

#### getTextContent(locator)
Get element's text content.

**Returns:** Promise<string>

#### getInnerText(locator)
Get element's inner text.

**Returns:** Promise<string>

#### getInputValue(locator)
Get element's input value.

**Returns:** Promise<string>

#### isElementEnabled(locator)
Check if element is enabled.

**Returns:** Promise<boolean>

#### isElementDisabled(locator)
Check if element is disabled.

**Returns:** Promise<boolean>

#### isElementChecked(locator)
Check if element is checked.

**Returns:** Promise<boolean>

---

## <a name="webcontextmanager"></a> WebContextManager

Manages browser context and page instance.

### Methods

#### initialize()
Initialize browser and context.

**Returns:** Promise<void>

#### getPage()
Get the current page.

**Returns:** Page (Playwright page object)

#### getContext()
Get the browser context.

**Returns:** BrowserContext (Playwright context)

#### navigateTo(url)
Navigate to a URL.

**Parameters:**
- `url` (string): URL to navigate to

**Returns:** Promise<void>

#### close()
Close the browser.

**Returns:** Promise<void>

#### takeScreenshot(filename)
Take a screenshot.

**Parameters:**
- `filename` (string): Filename for screenshot

**Returns:** Promise<Buffer>

#### getPageTitle()
Get page title.

**Returns:** Promise<string>

#### getPageUrl()
Get page URL.

**Returns:** string

#### executeScript(script, args)
Execute JavaScript in page context.

**Parameters:**
- `script` (string): JavaScript code
- `args` (any): Arguments to pass

**Returns:** Promise<any>

---

## <a name="testhelper"></a> TestHelper

Common helper methods for tests.

### Static Methods

#### generateUnique(prefix)
Generate unique string.

**Parameters:**
- `prefix` (string): Prefix for unique string (default: 'test')

**Returns:** string

#### getCurrentDate(format)
Get current date in specific format.

**Parameters:**
- `format` (string): Date format (default: 'YYYY-MM-DD')

**Returns:** string

#### getDateAfterDays(days, format)
Add days to current date.

**Parameters:**
- `days` (number): Number of days to add
- `format` (string): Date format

**Returns:** string

#### generateRandomEmail(domain)
Generate random email.

**Returns:** string

#### generateRandomPassword(length)
Generate random password.

**Parameters:**
- `length` (number): Password length (default: 12)

**Returns:** string

#### isValidEmail(email)
Validate email format.

**Returns:** boolean

#### sleep(ms)
Sleep for milliseconds.

**Returns:** Promise<void>

#### retry(fn, maxRetries, delayMs)
Retry a function with exponential backoff.

**Returns:** Promise<any>

#### deepEqual(obj1, obj2)
Compare two objects.

**Returns:** boolean

#### parseUrlParams(url)
Parse URL parameters.

**Returns:** Object

#### sanitizeInput(input)
Sanitize input for security.

**Returns:** string

#### maskSensitiveData(data, visibleChars)
Mask sensitive data for logging.

**Returns:** string

---

## Example Usage

```javascript
import ActionManager from './src/actions/ActionManager.js';
import LocatorReader from './src/readers/LocatorReader.js';
import TestDataReader from './src/readers/TestDataReader.js';

// Initialize
const locatorReader = new LocatorReader();
await locatorReader.load();

const testDataReader = new TestDataReader();
await testDataReader.load();

const actionManager = new ActionManager(page);

// Get locator
const locator = locatorReader.getLocator('LoginPage', 'username');

// Get test data
const testData = testDataReader.getTestData('Login Scenario', 'username');

// Execute action
await actionManager.executeAction('FILL', locator, testData);
```

---

For more examples, see [ADVANCED_GUIDE.md](ADVANCED_GUIDE.md)
