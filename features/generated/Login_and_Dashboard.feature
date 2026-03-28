Feature: Login and Dashboard

  # Login - Basic
  Scenario: Login with valid credentials
    Given NAVIGATE TO "/login"
    When FILL "username"
    And FILL "password"
    And CLICK "loginBtn"
    Then VERIFY TEXT "Welcome"

  # Dashboard - Basic
  Scenario: Navigate to dashboard
    Given NAVIGATE TO "/dashboard"
    When CLICK "menuBtn"
    Then VERIFY ELEMENT "dashboardHeader" IS VISIBLE
    And VERIFY TEXT "Dashboard Overview"

