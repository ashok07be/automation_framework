# Locator File Guide

This document describes the structure and usage of the Excel spreadsheet that
is used by the automation framework to define page elements and their
selectors. The framework reads the file during test setup and uses the
entries to create Playwright locators.

---

## 📁 File Location

By default the path is specified via the `LOCATOR_FILE_PATH` variable in
`.env`. Typical value:

```
LOCATOR_FILE_PATH=./data/locators.xlsx
```

You can override it with a custom path when initializing `LocatorReader`.

---

## 🧱 Worksheet Structure

The workbook should have one worksheet (named `Locators` or the first sheet).
The first row is treated as a header row; subsequent rows define individual
locators.

| Column          | Description |
|-----------------|-------------|
| **PageName**    | Logical page or component name used by tests and the locator reader to
   group elements. Example: `LoginPage`, `DashboardPage`.
| **ElementName** | Unique identifier for the element within the page. Used in feature files
   and code (`CLICK "loginBtn"`). Must match the value used in step
definitions/test data.
| **LocatorStrategy** | How to interpret the locator value (see strategies section).  | 
| **LocatorValue** | The actual selector string. Format depends on the strategy.
| **Timeout**     | Optional. Time (ms) to wait for this element to become visible. Falls
   back to global default if empty.
| **iFrame**      | Optional. If the target element lives inside an `<iframe>`, provide a
   locator for that iframe (same format as `LocatorValue`).
| **parent**      | Optional. When the element is nested inside another container within
   the iframe, specify the parent locator; the framework will chain them to
   reach the final target.

> **Note:** blank cells are allowed; only the first four columns are
> strictly required. Additional columns may be added for custom metadata if
> you update `LocatorReader` accordingly.

---

## 🔧 Locator Strategies & Examples

The framework supports several common selector strategies.  `LocatorStrategy`
is case‑insensitive.

| Strategy        | Description & Example |
|-----------------|-----------------------|
| **id**          | Element has an `id` attribute.<br>`LocatorValue`: `submit-button`<br>selectors used: `#submit-button` |
| **css**         | Plain CSS selector.<br>`LocatorValue`: `.nav > li > a[href='/login']` |
| **xpath**       | XPath expression.<br>`LocatorValue`: `//button[text()='Next']` |
| **class**       | Class name only (prepends `.`).<br>`LocatorValue`: `btn-primary` |
| **text**        | Match text content.<br>`LocatorValue`: `Sign in` → `text=Sign in` |
| **role**        | Playwright role selector (`role=`).<br>`LocatorValue`: `button[name="OK"]` |
| **label**       | Equivalent to `text=`; useful for inputs tied to labels.<br>`LocatorValue`: `Email` |
| **placeholder** | Select by `placeholder` attribute.<br>`LocatorValue`: `Enter email` |
| **testid**      | `data-testid` attribute.<br>`LocatorValue`: `login-form` |

> Strategies such as `getByRole`, `getByText`, etc. are aliased to the
> simpler names above for convenience.

### Custom or Unknown Strategies

If you supply a strategy that isn't recognised, `IFrameHandler` will log a
warning and fall back to treating the value as a raw CSS selector.  You can
extend `_getPlaywrightSelector` in `IFrameHandler.js` to support additional
formats.

---

## 🧩 iFrame & Parent Columns

Handling elements inside iframes is transparent:

1. If the `iFrame` column is populated, the framework first locates the
   iframe using the provided selector.
2. Inside that frame, it either queries the element directly or, if the
   `parent` column is present, first locates a parent container and then
   finds the element relative to it.

Both `iFrame` and `parent` accept the same strategies as the main locator.

**Example row:**

| PageName | ElementName | LocatorStrategy | LocatorValue | Timeout | iFrame           | parent          |
|----------|-------------|-----------------|--------------|---------|------------------|-----------------|
| `Chat`   | `sendBtn`   | css             | `.send-button` | 20000 | `css.iframe#chat` | `css.form`      |

In this example the test code will do roughly:

```js
const iframe = page.frameLocator('css=iframe#chat');
const parent = iframe.locator('css=form');
const sendButton = parent.locator('css=.send-button');
await sendButton.click();
```

---

## 📦 Locators in Practice

Use element names from the file in your feature files or step definitions,
for example:

```gherkin
When CLICK "submitBtn"
And FILL "username" WITH "alice"
```

The framework will resolve the locator via `LocatorReader`, which caches all
rows on load and throws a clear error if a lookup fails.


---

## 🎯 Selecting Dropdowns

The framework provides a generic `SELECT` step that works with both native
`<select>` elements and custom dropdown components.  It uses `SelectAction` to
handle the interaction.

### Feature file usage

```gherkin
Scenario: choose report type
  Given NAVIGATE TO "/reports"
  When SELECT "reportTypeDropdown" WITH "Summary"
  # or if you prefer value-based selection:
  When SELECT "reportTypeDropdown" WITH "summary"  
```

Under the hood the default step implementation calls
`selectByValue()`; if you need text- or index-based selection you can add
custom steps or call the action directly from code:

```javascript
// text
await actionManager.selectAction.selectByText(locatorObj, 'Summary');
// index (0-based)
await actionManager.selectAction.selectByIndex(locatorObj, 2);
```

### Locator entry

A dropdown is defined just like any other element.  use a CSS selector that
identifies the `<select>` or the clickable container for a custom widget.
The `Timeout` column is handy for slow-loading dropdowns.

Example row:

| PageName        | ElementName        | LocatorStrategy | LocatorValue               | Timeout |
|-----------------|--------------------|-----------------|-----------------------------|---------|
| `ReportPage`    | `reportTypeDropdown` | css             | `select#report-type`        | 30000   |

For custom components you might define the locator to point to the toggler
button or input instead.

### Test data

You can drive the selected option from the Excel test data file too:

| ScenarioName   | reportTypeDropdown |
|----------------|--------------------|
| `TESTSCENARIO` | `Summary`          |

Then `When SELECT "reportTypeDropdown"` (without `WITH`) will automatically
pick the value from the data sheet.

---

## ✅ Tips & Best Practices

- Keep element names short and descriptive (`loginBtn`, not
  `button123`).
- Group related elements under a common `PageName` so they’re easy to find.
- Use the Timeout column for slow‑loading components (e.g. dynamic
  modals).
- Avoid brittle XPath expressions when a stable CSS selector will do.
- If the application under test frequently changes, consider generating the
  spreadsheet from a shared repository of selectors.

---

With this file in place, you should be able to add, inspect, and update
locators confidently. Happy testing!  

---

*Generated by framework docs – keep this file alongside your tests.*
