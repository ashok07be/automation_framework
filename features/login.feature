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
    
  Scenario: Access dashboard after successful login
    Given NAVIGATE TO "/"
    When FILL "username"
    And FILL "password"
    And CLICK "loginBtn"
    Then VERIFY ELEMENT "dashboardHeader" IS VISIBLE
    And VERIFY TEXT "Products"

  Scenario: End-to-end purchase flow
    Given NAVIGATE TO "/"
    When FILL "username"
    And FILL "password"
    And CLICK "loginBtn"
    And CLICK "productItem"
    And CLICK "addToCartBtn"
    And CLICK "cartLink"
    Then VERIFY TEXT "Your Cart"
    And CLICK "checkoutBtn"
    When FILL "firstName" WITH "John"
    And FILL "lastName" WITH "Doe"
    And FILL "postalCode" WITH "12345"
    And CLICK "continueBtn"
    And CLICK "finishBtn"
    Then VERIFY TEXT "THANK YOU"
