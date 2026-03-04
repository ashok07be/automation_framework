# 🚀 Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
cd automation_framework
npm install
```

## Step 2: Create Sample Excel Files (1 min)

```bash
node scripts/createSampleData.js
```

This creates:
- `data/locators.xlsx` - Sample locators
- `data/testdata.xlsx` - Sample test data

## Step 3: Configure Environment (1 min)

Update `.env` file:

```env
BASE_URL=https://your-app.com
BROWSER=chromium
HEADED=false
```

## Step 4: Update Locators (~1 min)

Edit `data/locators.xlsx`:
- Update page names to match your app
- Update element locators using browser DevTools
- Set appropriate timeouts

Example:
| PageName | ElementName | LocatorStrategy | LocatorValue |
|----------|-------------|-----------------|--------------|
| LoginPage | username | id | user_field |
| LoginPage | password | id | pass_field |
| LoginPage | loginBtn | css | button.login |

## Step 5: Update Test Data (1 min)

Edit `data/testdata.xlsx`:
- Add your test scenarios
- Add test data for each element

Example:
| ScenarioName | ElementName | TestData |
|---|---|---|
| Login Test | username | testuser |
| Login Test | password | password123 |

## Step 6: Write Feature Files

Create `features/mytest.feature`:

```gherkin
Feature: My First Test
  Scenario: Test login
    Given NAVIGATE TO "/login"
    When FILL "username"
    And FILL "password"
    And CLICK "loginBtn"
    Then VERIFY TEXT "Dashboard"
```

## Step 7: Run Tests

```bash
npm test
```

Check:
- `reports/cucumber-report.html` - Test report
- `logs/combined.log` - Test logs

## 📊 File Structure

```
data/
├── locators.xlsx      ← Your element locators
└── testdata.xlsx      ← Your test data

features/
├── login.feature      ← Your tests
└── dashboard.feature

src/
├── steps/
│   └── stepDefinitions.js  (Don't change!)
├── actions/            (Pre-built, extend as needed)
├── readers/            (Pre-built, don't change)
└── utils/              (Pre-built, don't change)

logs/
└── combined.log        ← Check for issues

reports/
└── cucumber-report.html ← View test results
```

## 🔥 Common Commands

```bash
# Run all tests
npm test

# Run with Chrome
BROWSER=chromium npm test

# Run with Firefox
BROWSER=firefox npm test

# Run in headed mode (see browser)
HEADED=true npm test

# Run with debug logs
LOG_LEVEL=debug npm test
```

## 📝 Feature File Examples

### Simple Login Test
```gherkin
Scenario: User login
  Given NAVIGATE TO "/login"
  When FILL "username"
  And FILL "password"
  And CLICK "loginBtn"
  Then VERIFY TEXT "Welcome"
```

### With Explicit Values
```gherkin
Scenario: Reset password
  Given NAVIGATE TO "/forgot-password"
  When FILL "email" WITH "user@example.com"
  And CLICK "submitBtn"
  Then VERIFY TEXT "Check your email"
```

### With Waits
```gherkin
Scenario: Load data
  Given NAVIGATE TO "/data"
  When CLICK "loadBtn"
  And WAIT FOR "3" SECONDS
  Then VERIFY ELEMENT "dataTable" IS VISIBLE
```

### With Dropdowns
```gherkin
Scenario: Select option
  Given NAVIGATE TO "/filters"
  When SELECT "categoryFilter" WITH "Electronics"
  Then VERIFY TEXT "Showing Electronics"
```

## 🛠️ Configuration Essentials

### Timeouts
```env
# Element wait timeout
DEFAULT_TIMEOUT=30000

# Action execution timeout
ACTION_TIMEOUT=15000

# Page navigation timeout
NAVIGATION_TIMEOUT=30000
```

### Browser Options
```env
# Browser type
BROWSER=chromium          # chromium, firefox, webkit

# Headed mode (see browser)
HEADED=false              # true to see browser

# Slow motion (ms between actions)
SLOWMO=0                  # Increase to debug
```

### Logging
```env
# Log level
LOG_LEVEL=info            # debug, info, warn, error

# Where logs are saved
LOG_DIR=./logs
```

## 🐛 Troubleshooting

### Test fails to start
```bash
# Check if browsers are installed
npx playwright install

# Check Node version
node --version            # Should be 16+
```

### Element not found
1. Check Excel file for typos
2. Use browser DevTools to find correct selector
3. Update locator in Excel
4. Increase timeout if element loads slowly

### Excel file errors
1. Make sure files are closed in Excel
2. Create files using `node scripts/createSampleData.js`
3. Check column headers match exactly

## 📚 Next Steps

After basic setup:
1. Read [README.md](README.md) for full documentation
2. Explore [ADVANCED_GUIDE.md](ADVANCED_GUIDE.md) for advanced features
3. Create your locators and test data
4. Write and run your tests!

## ✅ Checklist

- [ ] `npm install` completed
- [ ] `.env` file updated with your URLs
- [ ] Sample Excel files created
- [ ] Locators updated with real app selectors
- [ ] Test data added to Excel
- [ ] Feature file created
- [ ] First test runs successfully

## 🎉 That's it!

You now have a production-grade automation framework!

---

**Questions?** Check [README.md](README.md) or [ADVANCED_GUIDE.md](ADVANCED_GUIDE.md)
