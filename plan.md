# Fatoura Development Plan

## Phase 1: Foundation Setup ✅ COMPLETED
- [x] Set up MySQL database schema with MySQL2
- [x] Create Docker configuration for MySQL
- [x] Set up environment variables (.env.local)
- [x] Create TypeScript interfaces for all data models
- [x] Create custom database client with MySQL2

## Phase 2: Configuration & Data Management
- [ ] Create `config/` folder structure
- [ ] Implement `customers.json` with sample customer data
- [ ] Implement `user.json` with single user data
- [ ] Set up file system structure for PDF storage (`/factuur/year/customer-id/`)
- [ ] Create utility functions for config file reading

## Phase 3: Database Schema Implementation
- [ ] Initialize database tables using MySQL2 client
- [ ] Create database initialization script
- [ ] Set up database relationships and constraints
- [ ] Create database seed scripts with sample data

## Phase 4: Core API Development
- [ ] Set up Next.js API routes structure
- [ ] Implement customer data loading from config
- [ ] Implement invoice CRUD operations
- [ ] Create invoice number generation logic (CUST001-YYYY-MM)
- [ ] Implement invoice status management
- [ ] Build line items calculation logic (omzet vs hourly)

## Phase 5: UI Foundation
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