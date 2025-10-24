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

## Phase 5: UI Foundation ⭐ NEXT
- [ ] Create base layout with Dutch labels
- [ ] Implement invoice listing page with basic grid
- [ ] Add filtering by status and customer
- [ ] Create customer selection modal for new invoices
- [ ] Implement navigation between pages

## Phase 6: Invoice Forms & Business Logic
- [ ] Build invoice creation/edit form
- [ ] Implement dynamic line items based on customer rules
- [ ] Create omzet percentage calculation (35%/40%/45%)
- [ ] Implement hourly rate calculations
- [ ] Add due date auto-calculation (+30 days)
- [ ] Build invoice total calculation

## Phase 7: PDF Generation & Email
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