# Fatoura Development Plan

## Phase 1: Foundation Setup ✅ COMPLETED
- [x] Set up MySQL database schema with MySQL2
- [x] Create Docker configuration for MySQL
- [x] Set up environment variables (.env.local)
- [x] Create TypeScript interfaces for all data models
- [x] Create custom database client with MySQL2

## Phase 2: Configuration & Data Management ✅ COMPLETED
- [x] Create `config/` folder structure
- [x] Implement `customers.json` with sample customer data
- [x] Implement `user.json` with single user data
- [x] Set up file system structure for PDF storage (`/storage/factuur/year/customer-id/`)
- [x] Create utility functions for config file reading
- [x] Enhanced utilities with PDF directory management and ID generation

## Phase 3: Database Schema Implementation ✅ COMPLETED
- [x] Initialize database tables using MySQL2 client
- [x] Create database initialization script (`scripts/init-db.ts`)
- [x] Set up database relationships and constraints
- [x] Create database seed scripts with sample data
- [x] Test complete CRUD operations with sample invoices and line items
- [x] Verify database functionality with verification script

## Phase 4: Core API Development ✅ COMPLETED
- [x] Set up Next.js API routes structure
- [x] Implement customer data loading from config
- [x] Implement invoice CRUD operations
- [x] Create invoice number generation logic (CUST001-YYYY-MM)
- [x] Implement invoice status management with transition validation
- [x] Build line items calculation logic (omzet vs hourly)
- [x] Create comprehensive API endpoints:
  - `/api/customers` - GET customers from config
  - `/api/invoices` - GET (with filtering) and POST invoice operations
  - `/api/invoices/[id]` - GET, PUT, DELETE individual invoices
  - `/api/invoices/[id]/status` - PUT status management with validation
  - `/api/invoices/[id]/line-items` - GET and POST line items
  - `/api/invoices/[id]/line-items/[lineItemId]` - GET, PUT, DELETE individual line items
- [x] Added comprehensive database client methods for all operations
- [x] Implemented automatic invoice total recalculation on line item changes

## Phase 5: UI Foundation ✅ COMPLETED
- [x] Create base layout with Dutch labels and proper navigation
- [x] Implement invoice listing page with responsive grid layout
- [x] Add filtering by status and customer with dropdown controls
- [x] Create customer selection modal for new invoices with billing type display
- [x] Implement navigation between pages with breadcrumb navigation
- [x] Created comprehensive UI components:
  - `Navigation` - Main navigation bar with Dutch labels and active states
  - `InvoiceList` - Complete invoice listing with grid view and filters
  - `InvoiceFilters` - Filter controls for status and customer filtering
  - `CustomerSelectionModal` - Modal for customer selection with billing type indicators
  - `Breadcrumbs` - Navigation breadcrumbs for page hierarchy
- [x] Set up placeholder pages for customers and settings sections
- [x] Implemented responsive design with proper dark mode support

## Phase 6: Invoice Forms & Business Logic ✅ COMPLETED
- [x] Build invoice creation/edit form with comprehensive field handling
- [x] Implement dynamic line items based on customer rules (omzet vs hourly)
- [x] Create omzet percentage calculation (35%/40%/45%) with automatic tier detection
- [x] Implement hourly rate calculations with duration parsing (hh:mm format)
- [x] Add due date auto-calculation (+30 days from invoice date)
- [x] Build invoice total calculation with real-time updates
- [x] Created comprehensive InvoiceForm component with:
  - Auto-generated invoice numbers (CUSTOMER_ID-YYYY-MM format)
  - Dynamic line items with add/remove functionality
  - Real-time calculations for both omzet and hourly billing
  - Purchase number optional field with checkbox enable
  - Extra costs field for additional charges
  - Comprehensive totals section with subtotal and final total
  - Form validation and API integration for saving drafts
  - Responsive design with proper mobile support
- [x] Integrated with Phase 4 API endpoints for invoice and line item creation
- [x] Added proper error handling and user feedback

## Phase 7: PDF Generation & Email ⭐ NEXT
- [ ] Set up Puppeteer for PDF generation
- [ ] Create basic PDF template (no branding)
- [ ] Implement PDF file storage and management
- [ ] Set up Nodemailer for email sending
- [ ] Create basic email template
- [ ] Implement PDF attachment functionality

## Phase 8: Final Features & Polish
- [ ] Create invoice details view
- [ ] Implement PDF preview modal
- [ ] Add email sending modal with editable content
- [ ] Implement status transitions (draft → submitted → completed/sent)
- [ ] Add basic error handling and loading states
- [ ] Polish UI and responsiveness

## Phase 9: Local Deployment Setup
- [ ] Create Docker Compose for full application
- [ ] Write setup documentation
- [ ] Create sample data for testing
- [ ] Perform end-to-end testing
- [ ] Document known limitations and future enhancements

## Phase 10: Number Formatting Enhancement
**Technical Objective**: Implement proper 2-decimal formatting for all monetary fields

**Technical Depth:**
- [ ] **Input Formatting**:
  - Create custom `formatCurrency` utility function
  - Implement real-time formatting on input (format as user types)
  - Handle edge cases: empty values, partial inputs, paste operations
  - Ensure cursor position preservation during formatting

- [ ] **Validation & Parsing**:
  - Implement `parseCurrency` function to extract numeric values
  - Add client-side validation for decimal precision (max 2 decimals)
  - Handle locale-specific decimal separators (. vs ,)
  - Validate minimum/maximum value constraints

- [ ] **Database Integration**:
  - Ensure proper storage as DECIMAL(10,2) in MySQL
  - Implement database-level precision validation
  - Handle rounding for calculations (avoid floating-point errors)
  - Create migration script for existing data normalization

- [ ] **UI/UX Enhancements**:
  - Display formatted values in read-only fields (€1,234.56)
  - Implement consistent formatting across all monetary displays
  - Add input masks for better user guidance
  - Handle copy/paste of formatted values

- [ ] **Calculation Engine**:
  - Update all calculation functions to use precise decimal arithmetic
  - Implement proper rounding strategies (banker's rounding)
  - Ensure totals precision in multi-line calculations
  - Add validation for calculation overflow/underflow

- [ ] **Form State Management**:
  - Separate display values from internal numeric values
  - Implement proper state synchronization
  - Handle form validation with formatted values
  - Ensure API payload contains raw numeric values

**Files to modify:**
- `src/components/InvoiceForm.tsx` - Main form component
- `src/utils/currency.ts` - New utility for formatting/parsing
- `src/lib/calculations.ts` - Update calculation logic
- `src/lib/database.ts` - Ensure proper decimal handling
- Database schema - Update precision constraints

**Testing Requirements:**
- Unit tests for currency formatting/parsing functions
- Integration tests for form submission with formatted values
- Edge case testing (very large/small numbers, locale differences)
- Cross-browser compatibility testing

## Technical Decisions Made:
1. **Authentication**: None required (single user system)
2. **Customer IDs**: Manually set in customer config files
3. **Invoice Number Format**: `CUST001-YYYY-MM` (e.g., CUST001-2025-10)
4. **PDF Styling**: Simple, no branding required
5. **Email Template**: Basic template, no customization needed
6. **Data Validation**: Basic validation, no IBAN format checking
7. **Backup/Export**: Not required for initial version
8. **Deployment**: Local development only
9. **Database**: MySQL2 direct connection (instead of Prisma ORM)
10. **PDF Library**: Puppeteer (for server-side generation)
11. **Email Service**: Nodemailer with local SMTP
12. **UI Components**: Custom components with Tailwind CSS

## Simplified Estimated Timeline:
- **Phase 1**: 1 day (Foundation with Prisma + MySQL)
- **Phase 2**: 1 day (Config files + file structure)
- **Phase 3**: 1 day (Database schema)
- **Phase 4**: 2-3 days (Core API)
- **Phase 5**: 2 days (UI foundation)
- **Phase 6**: 2-3 days (Forms & business logic)
- **Phase 7**: 2 days (PDF + email)
- **Phase 8**: 2 days (Final features)
- **Phase 9**: 1 day (Local deployment)

**Total Estimated Time**: 12-15 days

## Immediate Next Steps:
1. **Start Phase 1**: Set up Prisma with MySQL
2. **Create database schema** based on requirements
3. **Set up Docker** for local MySQL instance
4. **Create sample config files** with customer and user data

Ready to begin with Phase 1? We'll start by setting up the database foundation with Prisma and MySQL.