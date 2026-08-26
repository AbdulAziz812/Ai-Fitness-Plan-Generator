# 🏋️ AI Fitness Plan Generator

An AI-powered web application that generates personalized weekly workout and meal plans based on a user's fitness information.

The project combines a web application with **n8n workflow automation, Groq, OpenAI GPT-OSS-120B, Google Sheets, and web-based PDF generation** to create an end-to-end AI fitness planning experience.

## 🌐 Live Demo

**Website:** https://aifitnessplangenerator.ai.studio/

## 🚀 Features

* User registration
* User login
* Fitness information collection
* Personalized workout plan generation
* Personalized meal suggestions
* AI-powered plan generation
* n8n workflow automation
* Google Sheets data storage
* Fitness data storage
* Generated plan storage
* Plan regeneration
* Webhook-based communication
* Structured AI output
* PDF generation and download
* Input processing and validation
* Error handling

## 🛠️ Tech Stack

* **Google AI Studio** — Web application
* **n8n** — Workflow automation
* **Groq** — AI inference
* **OpenAI GPT-OSS-120B** — AI language model
* **Google Sheets** — Data storage
* **Webhooks** — Website-to-n8n communication
* **PDF Generation** — Website-side PDF generation

## 🏗️ System Architecture

```text
                    ┌────────────────────────┐
                    │      Web Application   │
                    │    Google AI Studio    │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │       n8n Webhooks     │
                    └────────────┬───────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        ┌───────────┐      ┌───────────┐    ┌──────────────┐
        │  Signup   │      │   Login   │    │ Fitness Plan │
        └─────┬─────┘      └─────┬─────┘    └──────┬───────┘
              │                  │                  │
              ▼                  ▼                  ▼
        ┌────────────────────────────────────────────────┐
        │                 Google Sheets                  │
        │ Users / Fitness Details / Fitness Plans       │
        └────────────────────────┬───────────────────────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │    AI Agent   │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │  Groq API     │
                         │ GPT-OSS-120B  │
                         └───────┬───────┘
                                 │
                                 ▼
                      ┌────────────────────┐
                      │ Information        │
                      │ Extractor          │
                      └─────────┬──────────┘
                                │
                                ▼
                         Google Sheets
                                │
                                ▼
                         JSON Response
                                │
                                ▼
                         Web Application
                                │
                                ▼
                         PDF Generation
```

## 🔄 Application Flow

### 1. User Registration

The user provides:

* Full name
* Email
* Password

The website sends the information to an n8n registration webhook.

n8n checks Google Sheets for an existing account. If the email is available, a unique user ID is generated and the user is stored.

### 2. User Login

The user submits their email and password.

n8n searches the Users sheet and validates the submitted credentials.

If the credentials match, the workflow returns the user's:

* Name
* Email
* User ID

The website then provides access to the user's application experience.

### 3. Fitness Information

The user enters:

* Age
* Height
* Weight
* Fitness goal
* Experience level
* Workout days
* Available equipment
* Food preference

The information is sent to the Fitness Plan webhook.

### 4. Fitness Data Storage

n8n processes the submitted information and stores the fitness details in Google Sheets.

The stored information includes:

```text
User ID
Age
Height
Weight
Fitness Goal
Experience Level
Workout Days
Equipment
Food Preference
Updated Date
```

### 5. AI Plan Generation

n8n builds a structured prompt using the user's fitness information.

The prompt is sent to an AI Agent connected to the **Groq API**.

The model used in the workflow is:

**OpenAI GPT-OSS-120B**

The AI generates:

* Weekly workout plan
* Exercises
* Sets and repetitions
* Rest/light activity
* Meal suggestions
* Water goal

### 6. Structured AI Output

The generated AI response is processed through an Information Extractor.

The workflow extracts:

```text
Plan ID
User ID
Workout Plan
Meal Suggestions
Plan Status
Generated Date
Error Message
```

The structured result is then stored in the Fitness Plans sheet.

### 7. Website Response

After saving the generated plan, n8n returns a JSON response to the website.

The website receives and displays the personalized fitness plan.

### 8. PDF Generation

PDF generation is handled by the **website**, not n8n.

The generated plan can be displayed and downloaded as a PDF directly from the application.

## 📊 Google Sheets Data Model

### Users Sheet

```text
User ID
Full Name
Email
Password
Created Date
```

### Fitness Details Sheet

```text
User ID
Age
Height
Weight
Fitness Goal
Experience Level
Workout Days
Equipment
Food Preference
Updated Date
```

### Fitness Plans Sheet

```text
Plan ID
User ID
Workout Plan
Meal Suggestions
Plan Status
Generated Date
Error Message
```

## 🔗 n8n Automation

The n8n workflow contains three primary automation flows.

### Registration

```text
Signup Webhook
      ↓
Extract User Data
      ↓
Check Google Sheets
      ↓
Check Existing Email
      ↓
Generate User ID
      ↓
Save User
      ↓
Return Response
```

### Login

```text
Login Webhook
      ↓
Extract Email + Password
      ↓
Search Google Sheets
      ↓
Validate Credentials
      ↓
Return Login Result
```

### Fitness Plan

```text
Fitness Plan Webhook
      ↓
Extract Fitness Data
      ↓
Find User
      ↓
Save Fitness Details
      ↓
Build AI Prompt
      ↓
AI Agent
      ↓
Groq API
      ↓
OpenAI GPT-OSS-120B
      ↓
Information Extractor
      ↓
Save Fitness Plan
      ↓
Return JSON Response
      ↓
Website
      ↓
PDF Generation
```

## 🧪 Testing

The application was tested against 24 scenarios covering successful and unsuccessful paths.

Testing areas included:

* User registration
* Missing registration information
* Password validation
* Duplicate email registration
* Successful login
* Incorrect password
* Unknown email
* Dashboard access
* Fitness form validation
* Age validation
* Height and weight validation
* Fitness goal selection
* Experience level selection
* Webhook communication
* AI plan generation
* Google Sheets storage
* Plan status
* Error handling
* PDF generation
* Plan regeneration
* Session/logout handling
* Unauthorized access

## 📁 Repository Structure

```text
Ai-Fitness-Plan-Generator/
│
├── src/
├── public/
│
├── n8n/
│   └── ai-fitness-plan-workflow.json
│
├── docs/
│   ├── architecture.png
│   └── test-cases.md
│
├── README.md
└── .gitignore
```

## 🔐 Security

Sensitive information should never be committed to the repository.

Do not expose:

* API keys
* OAuth credentials
* n8n credentials
* Private webhook information
* Passwords
* Private Google Sheets information
* Real user data

Credentials should be configured securely in the relevant services.

## 📚 Key Learnings

This project provided practical experience with:

* AI application development
* n8n automation
* Webhooks
* API integration
* AI Agents
* Prompt engineering
* Structured AI output
* Google Sheets integration
* Frontend-to-workflow communication
* Data processing
* Error handling
* Testing
* PDF generation

## 🎯 Project Objective

The objective was to build a complete AI-powered application rather than simply connecting an AI model.

The project demonstrates how a web application can communicate with an automation workflow, process user information, interact with an AI model, store structured results, and return those results to the user.

## 🚀 Future Improvements

Potential improvements include:

* Secure password hashing
* Production-grade authentication
* Database migration from Google Sheets to a dedicated database
* Improved AI safety and validation
* Fitness plan version history
* User progress tracking
* More advanced nutrition calculations
* Exercise demonstrations
* Improved authorization and session management

---

**Think. Build. Test. Ship. 🚀**
