Feature: User Login Scenarios
  As a user
  I want to be able to login to the application
  So that I can access my account

  Scenario: Successful login with valid credentials
    Given NAVIGATE TO "/"
    When FILL "username"
    And FILL "password"
    And CLICK "loginBtn"
    Then VERIFY TEXT "Products"
    And VERIFY ELEMENT "dashboardHeader" IS VISIBLE

  Scenario: Failed login with invalid credentials
    Given NAVIGATE TO "/"
    When FILL "username" WITH "invaliduser"
    And FILL "password" WITH "wrongpassword"
    And CLICK "loginBtn"
    Then VERIFY TEXT "Epic sadface"

  Scenario: Login button should be enabled
    Given NAVIGATE TO "/"
    Then VERIFY ELEMENT "loginBtn" EXISTS
    
