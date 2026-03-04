Feature: Dashboard Functionality
  Testing dashboard features and navigation

  Scenario: Navigate to dashboard and verify elements
    Given NAVIGATE TO "/dashboard"
    Then VERIFY ELEMENT "dashboardTitle" IS VISIBLE
    And VERIFY TEXT "Welcome back"

  Scenario: User can logout successfully
    Given NAVIGATE TO "/dashboard"
    When CLICK "userMenuBtn"
    And WAIT FOR "1" SECONDS
    And CLICK "logoutBtn"
    Then VERIFY TEXT "You have been logged out"

  Scenario: Verify table data with dropdown selection
    Given NAVIGATE TO "/dashboard/reports"
    When SELECT "reportTypeDropdown" WITH "Monthly"
    And WAIT FOR "2" SECONDS
    Then VERIFY ELEMENT "reportTable" IS VISIBLE
