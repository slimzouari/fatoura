# Storage Directory

This directory contains generated PDF invoices organized by:
- Year (e.g., 2025/)
- Customer ID (e.g., CUST001/)
- PDF files (e.g., CUST001-2025-10.pdf)

## Structure Example:
```
storage/factuur/
├── 2025/
│   ├── CUST001/
│   │   ├── CUST001-2025-10.pdf
│   │   └── CUST001-2025-11.pdf
│   └── CUST002/
│       └── CUST002-2025-10.pdf
└── 2024/
    └── CUST001/
        └── CUST001-2024-12.pdf
```

Directories are created automatically when invoices are generated.