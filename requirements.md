# Fatoura - Invoice Management System Requirements

## Overview

This application is an invoice management system where users can:
- View all invoices
- Create new invoices
- Download invoices
- Send invoices to customers

## Invoice Lifecycle

- **Draft**: User clicks "create invoice", invoice enters draft mode
- **Submitted**: User clicks submit, invoice goes to submitted mode. Can revert to draft and be edited
- **Completed**: Final stage, invoice is completed by user and can't be edited anymore. Only downloading is possible
- **Sent**: Final stage, invoice is sent to customer via email

## User Attributes

- Name
- Address
- Email
- Telefoon (Phone)
- IBAN
- KVK (Chamber of Commerce number)

## Customer Attributes

- Name
- ID
- Address (optional)
- Email
- Contract number (optional)
- Rule: omzet (revenue) or hourly
- Currency (default = Euro)

## Invoice Attributes

- **Factuurnummer**: Unique identifier, prefix is the customer ID
- **Factuurdatum**: Invoice date
- **Vervaldatum**: Due date (Factuurdatum + 30 days)
- **Maandfacturatie**: Month/year for billing period
- **Purchase number** (optional)
- **Factuur aan**: Customer (bill to)
- **Factuur van**: User (bill from)
- **Factuur items**: Line items depending on customer rule
- **Extra**: Additional charges
- **Total**: Sum of factuur items + extra
- **LinkToPDF**: Link to PDF file
- **Status**: Current invoice status

## Invoice Line Items

### Rule 1: Omzet (Revenue)
- **Datum**: Date
- **Dagomzet**: Daily revenue amount in Euro (2 decimal places)
- **Vergoeding percentage**: Automatically calculated percentage
  - If dagomzet < €1000: 35%
  - If dagomzet < €1500: 40%
  - Otherwise: 45%
- **Vergoeding amount**: dagomzet × vergoeding percentage (2 decimal places)

### Rule 2: Hourly
- **Datum**: Date
- **Description**: Text description
- **Duration**: Time displayed as hh:mm
- **Rate (€/hour)**: Default €127, can be updated
- **Total**: (hours + minutes/60) × Rate

## Configuration Files

Under the main project, create a `config` folder with 2 configuration files:
- **customers.json**: JSON array file for customers
- **user.json**: JSON object for user data

## Email Configuration

Sensitive data (email SMTP configuration, storage location, database connection strings) will be stored in environment files.

## UI Pages

### Home Page (Invoice Listing)
- Grid showing all invoices ordered by date (most recent first)
- Filter by invoice status and customer
- Clicking an invoice redirects to:
  - Invoice details (if not in draft)
  - Edit page (if in draft)
- Create button at top opens popup with customer dropdown and Maandfacturatie (month / year)

### Invoice Creation/Edit Page
- **Factuurnummer**: Starts with customer prefix
- **Customer details**: Show available fields (exclude ID and rule)
- **Maandfacturatie**: from selected values in popup
- **Factuurdatum**: Invoice date
- **Vervaldatum**: Due date
- **Purchase number**: Grayed out by default, enabled via checkbox
- **Line items**: Add one by one, fields depend on customer rule

#### User Actions:
1. **Save Draft**: Save and return to list page
2. **Preview**: Modal with generated PDF
   - Close popup to continue editing
   - Submit to generate PDF, set status to "submitted", update PDF link, navigate to details page

#### PDF Storage:
- Filename: `facturnummer-maandfacutratie.pdf`
- Path: `/factuur/year/customer-id/generatedPdfFile`
- Create folders if they don't exist

### Invoice Details Page
- Same information as creation page
- **Change to Draft**: Update status, delete PDF link
- **Complete**: Popup warning that invoice becomes uneditable, user must send email manually
- **Send**: Popup with editable email preview
  - From/To: Not editable
  - Subject: Editable
  - Body: Editable
  - PDF attachment: Not editable
- **Preview**: Load previously generated PDF

## Technology Stack

- **Frontend/Backend**: Next.js
- **Database**: MySQL (local dev in Docker container)
- **Containerization**: Docker
- **Naming Convention**: English variable names in backend, Dutch field labels in UI






