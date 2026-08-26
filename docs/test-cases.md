# AI Fitness Plan Generator — Test Cases

## Overview

The application was tested using 24 scenarios covering successful workflows, invalid inputs, authentication, AI generation, data storage, PDF generation, regeneration, and access control.

## Test Scenarios

| #  | Test Scenario                 | Expected Result                        |
| -- | ----------------------------- | -------------------------------------- |
| 01 | New user registration         | Registration succeeds                  |
| 02 | Missing email                 | Registration is rejected               |
| 03 | Short password                | Registration is rejected               |
| 04 | Duplicate email               | Registration is rejected               |
| 05 | Correct login credentials     | Login succeeds                         |
| 06 | Incorrect password            | Login fails                            |
| 07 | Non-existent email            | Login fails                            |
| 08 | Successful dashboard access   | Dashboard loads                        |
| 09 | Dashboard user information    | Correct name and email displayed       |
| 10 | Empty required fitness fields | Form rejects submission                |
| 11 | Invalid age                   | Invalid age is rejected                |
| 12 | Invalid height/weight         | Non-numeric values are rejected        |
| 13 | Fitness goal selection        | Selected goal is included              |
| 14 | Experience level selection    | Selected level is included             |
| 15 | Webhook request               | n8n receives request                   |
| 16 | AI plan generation            | Valid plan is returned                 |
| 17 | Plan storage                  | Plan is saved in Google Sheets         |
| 18 | Successful plan status        | Status is completed/generated          |
| 19 | AI generation failure         | Error is handled                       |
| 20 | PDF generation                | PDF is generated successfully          |
| 21 | Edit and regenerate           | Updated plan is generated              |
| 22 | Previous plan handling        | Plan is replaced/versioned as designed |
| 23 | Logout                        | Session is cleared                     |
| 24 | Unauthorized access           | Access is blocked                      |

## Sample Successful Flow

```text
User Registration
      ↓
Login
      ↓
Enter Fitness Information
      ↓
Generate Fitness Plan
      ↓
AI Processing
      ↓
Plan Stored
      ↓
Plan Displayed
      ↓
PDF Generated
```

## Definition of Done

The project is considered complete when all 24 test scenarios have been executed, expected results have been verified, and failed scenarios have been fixed and retested.
