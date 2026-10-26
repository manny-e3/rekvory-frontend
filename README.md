# Rekovry 🛡️

> **Financial Dispute Resolution Platform**  
> Rekovry is an enterprise-grade financial dispute resolution and claims recovery platform engineered for Nigerian consumers, merchants, and corporate entities. It accelerates restitution for failed interbank transfers, contested POS debits, unfulfilled vendor deliveries, and delayed chargebacks through institutional clearing channels and regulatory frameworks.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
  - [1. Multi-Step Claim Intake & Dossier Wizard](#1-multi-step-claim-intake--dossier-wizard)
  - [2. Automated Statutory Demand Notice Generation](#2-automated-statutory-demand-notice-generation)
  - [3. Integrated Payment & Filing Checkout](#3-integrated-payment--filing-checkout)
  - [4. Real-Time Claim Audit Trail & Timeline](#4-real-time-claim-audit-trail--timeline)
  - [5. Accredited Legal Counsel (Lawyer) Portal](#5-accredited-legal-counsel-lawyer-portal)
  - [6. Settlement & Restitution Ledger](#6-settlement--restitution-ledger)
  - [7. Regulatory Compliance & Governance Hub](#7-regulatory-compliance--governance-hub)
- [Dispute Categories Supported](#-dispute-categories-supported)
- [Technology Stack](#-technology-stack)
- [System Architecture & Folder Structure](#-system-architecture--folder-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
  - [Building for Production](#building-for-production)
  - [Linting & Code Quality](#linting--code-quality)
- [API & Service Layer](#-api--service-layer)
- [User Roles & Access Control](#-user-roles--access-control)

---

## 🔍 Overview

In the Nigerian financial ecosystem, transactions frequently experience dropped debits, failed instant transfers (NIP), merchant reconciliation delays, and unrendered commercial services. Reclaiming these funds via standard customer support channels can be time-consuming and inefficient.

**Sovereign Recovery (Rekovry)** bridges the gap between aggrieved financial consumers and institutional respondents by providing:
- **Statutory Legal Backing**: Automatically aligns disputes with Central Bank of Nigeria (CBN) Consumer Protection Regulations and the Federal Competition and Consumer Protection Act (FCCPA).
- **Formal Institutional Demand Notices**: Programmatically generates verifiable restitution instruments (`SR-DEMAND-*`) with statutory SLA response timers.
- **Accredited Legal Representation**: Connects high-value and unresolved claims to verified Nigerian Bar Association (NBA) counsel for ADR and litigation.
- **End-to-End Auditability**: Cryptographic document verification (SHA-256) and real-time lifecycle status tracking.

---

## 🚀 Core Features

### 1. Multi-Step Claim Intake & Dossier Wizard
- **Guided 5-Stage Dossier Submission**:
  1. **Dispute Classification**: Categorize the claim by financial scenario (Refund, POS issue, Service default, Product dispute, Consumer breach).
  2. **Interbank Routing**: Capture originating and beneficiary financial institutions (Access, GTBank, Zenith, FirstBank, Moniepoint, OPay, PalmPay, etc.), account numbers (NUBAN), NIBSS Session IDs, and Retrieval Reference Numbers (RRN).
  3. **Factual Narrative & AI Assistance**: Rich text narrative editor with built-in AI auto-draft assistance (`/claims/auto-draft-narrative`) to format claims into legally structured statements of fact.
  4. **Evidence Vault & Document Hashing**: Drag-and-drop file upload for debit receipts, bank statements, and correspondence, with SHA-256 cryptographic integrity hash tracking.
  5. **Statutory Declaration & SLA Calculation**: Calculates statutory reversal deadlines based on CBN regulatory frameworks and issues an official Case Reference ID.

### 2. Automated Statutory Demand Notice Generation
- Generates official, legal demand letters instantly upon filing.
- Populates formal respondent coordinates, dispute timeline, statutory citations, and restitution demand sums.
- Includes formatted printable and downloadable legal demand instruments ready for institutional service.

### 3. Integrated Payment & Filing Checkout
- **Dual Payment Gateway Support**: Embedded inline checkout supporting both **Paystack** and **Flutterwave**.
- Handles filing fees, retainer deposits, and legal review charges.
- Real-time payment verification webhook integration and automatic digital receipt issuance.

### 4. Real-Time Claim Audit Trail & Timeline
- Visual dispute lifecycle tracker with status badges:
  - `DRAFT` ➔ `SUBMITTED` ➔ `EVIDENCE_VERIFIED` ➔ `NOTICE_ISSUED` ➔ `UNDER_REVIEW` ➔ `LEGAL_ESCALATION` ➔ `SETTLED`
- Displays active dispute countdowns against CBN SLA benchmarks (e.g. 24–72 hours for interbank clearing drops).

### 5. Accredited Legal Counsel (Lawyer) Portal
- **Lawyer Onboarding & Multi-Tier KYC**:
  - Supreme Court Enrolment Number (SCN) registration.
  - Nigerian Bar Association (NBA) Bar Practicing Fee & Seal verification.
  - Law firm credentials, verified settlement account, and identity validation.
- **Bilateral Referral Matching System**:
  - Escalated dispute claims are routed to specialized counsel.
  - Two-way negotiation: Lawyers review briefs and propose retainer/contingency fee percentages; claimants review and accept terms.
- **Counsel Dashboard**:
  - Urgent action trays, active retainers counter, total value in litigation, and earned fee ledgers.

### 6. Settlement & Restitution Ledger
- Real-time financial ledger tracking recovered funds.
- Records bank settlement coordinates, clearing authorizations, disbursement transaction references, and restitution certificates.
- Executive KPI analytics: Total Claimed Value, Total Recovered Value, Success Rate %, and Average Resolution SLA.

### 7. Regulatory Compliance & Governance Hub
- Central repository mapping platform workflows to Nigerian regulatory guidelines:
  - **CBN Consumer Protection Framework**: Failed electronic funds transfer reversal mandates.
  - **NIBSS NIP Clearing Directives**: Instant payment tracing protocols.
  - **FCCPA (2018)**: Consumer rights regarding merchant delivery failures and unrendered services.

---

## 💼 Dispute Categories Supported

| Category | Description | Primary Regulatory SLA |
| :--- | :--- | :--- |
| **Refund** | Failed transfers, duplicate debits, cancelled bookings, delayed refunds | 24 – 48 Hours (CBN Guidelines) |
| **Payment Issue** | Declined POS terminals, ATM card dispense errors, failed NIP transactions | 24 – 72 Hours (NIBSS / CBN) |
| **Service Issue** | Vendor contract default, unrendered services, unfulfilled booking | 48 – 96 Hours (FCCPA) |
| **Product Issue** | Defective goods, disputed commercial invoices, breach of warranty | 3 – 5 Business Days (Sales of Goods Act) |
| **Consumer Dispute** | Unauthorized bank maintenance fees, contractual penalties | 3 – 5 Business Days (CBN Arbitration) |
| **Specialized Restitution** | Customized commercial dispute inquiries and corporate recovery | Case-by-case basis |

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) (`react`, `react-dom` `^19.2.8`)
- **Build Tool & Dev Server**: [Vite 8](https://vitejs.dev/) with Fast HMR
- **Routing**: [React Router v7](https://reactrouter.com/) (`react-router-dom` `^7.18.4`)
- **Icons**: [Lucide React](https://lucide.dev/) (`lucide-react` `^1.46.0`)
- **Linter & Code Analysis**: [Oxlint](https://oxc.rs/) (`oxlint` `^1.81.0`)
- **Typography**: Inter (Body) & Montserrat (Headings) via Google Fonts
- **Styling**: Vanilla CSS Design System with CSS Custom Properties, Responsive Fluid Grid, and Sovereign Navy (`#0B2D5B`) / Amber Gold (`#E68000`) theme tokens
- **Payment Gateways**: Paystack Inline JS & Flutterwave Inline JS
- **API Client**: Modular HTTP service layer with automatic fallback to local persistence

---

## 📂 System Architecture & Folder Structure

```text
rekovry-react/
├── public/                 # Static assets and public resources
├── src/
│   ├── assets/             # Brand logos, icons, and illustrations
│   ├── components/         # Reusable UI components
│   │   ├── BrandLogo.jsx         # SVG Sovereign Recovery branding
│   │   ├── ClaimTimeline.jsx     # Visual audit milestone stepper
│   │   ├── CurrencyInput.jsx     # Formatted Naira input handler
│   │   ├── DemandNoticeModal.jsx # Official printable legal demand instrument
│   │   ├── EvidenceModal.jsx     # Document preview and SHA-256 hash inspection
│   │   ├── Footer.jsx            # Platform footer with legal links
│   │   ├── Header.jsx            # Top navigation bar with role switcher
│   │   ├── MetricCard.jsx        # Dashboard metric & KPI displays
│   │   ├── NotificationBell.jsx  # Real-time alert tray
│   │   ├── RichTextEditor.jsx    # Narrative editor with formatting controls
│   │   ├── SettlementModal.jsx   # Restitution certificate & disbursement view
│   │   └── StatusBadge.jsx       # Color-coded regulatory status pill
│   ├── layout/             # Layout wrappers
│   │   ├── AuthLayout.jsx        # Authentication screens layout
│   │   ├── LawyerLayout.jsx      # Accredited counsel portal layout
│   │   └── PortalLayout.jsx      # Claimant dashboard layout
│   ├── pages/              # Main route views
│   │   ├── auth/                 # Login, Register, Verify Email, Forgot/Reset Password
│   │   ├── lawyer/               # Lawyer Dashboard, Lawyer KYC, Profile, Referrals
│   │   ├── ClaimCheckout.jsx     # Paystack & Flutterwave fee checkout
│   │   ├── ClaimDetail.jsx       # Individual claim dossier and timeline
│   │   ├── Compliance.jsx        # CBN, NIBSS, and FCCPA governance matrix
│   │   ├── Dashboard.jsx         # Main claimant executive dashboard
│   │   ├── LandingPage.jsx       # Public landing page with hero & categories
│   │   ├── MyClaims.jsx          # Filterable, sortable list of user disputes
│   │   ├── NewClaim.jsx          # 5-step dispute submission wizard
│   │   ├── Profile.jsx           # User security, KYC, and preferences
│   │   └── Settlements.jsx       # Recovered restitution ledger
│   ├── route/              # Routing configurations
│   │   ├── AppRoutes.jsx         # Application route tree
│   │   ├── ProtectedRoute.jsx    # Auth guard & role validator
│   │   └── routes.js             # Centralized route URL definitions
│   ├── services/           # Service & API client modules
│   │   ├── apiClient.js          # Base HTTP client with error handling
│   │   ├── authService.js        # Auth tokens, login, and registration
│   │   ├── claimService.js       # Claims CRUD, checkout, and AI narrative
│   │   ├── lawyerService.js      # Counsel KYC, verification, and stats
│   │   ├── notificationService.js# In-app notifications
│   │   ├── referralService.js    # Claim-lawyer bilateral referrals
│   │   └── settlementService.js  # Restitution ledger APIs
│   ├── utils/              # Helper utilities, bank lists, and constants
│   │   ├── index.js              # Naira formatters and session ID helpers
│   │   └── mockData.js           # Nigerian bank directory & dispute categories
│   ├── App.css
│   ├── App.jsx             # Main state coordinator & root provider
│   ├── index.css           # Global CSS variables, resets, and typography
│   └── main.jsx            # Vite entry point
├── .env                    # Environment variables (API Base URL)
├── index.html              # HTML shell with meta tags & fonts
├── package.json            # Node.js dependencies and scripts
└── vite.config.js          # Vite configuration
```

---

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manny-e3/rekvory-frontend.git
   cd rekovry-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Environment Configuration

Create or update the `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

> **Note**: If the backend service is offline, the frontend's built-in fallback automatically maintains offline claim state and demonstration workflows using persistent local storage.

### Running the Application

To start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production bundle locally:

```bash
npm run preview
```

### Linting & Code Quality

Run Oxlint to check code quality:

```bash
npm run lint
```

---

## 🔌 API & Service Layer

The frontend communicates with the REST backend via the `services/` directory:

| Endpoint Pattern | Method | Purpose |
| :--- | :---: | :--- |
| `/auth/login` | `POST` | Authenticate claimant or legal counsel |
| `/auth/register` | `POST` | Register user with dual role selection |
| `/claims` | `GET` | List caller's claims with pagination & filters |
| `/claims` | `POST` | Submit a new dispute claim dossier |
| `/claims/:id` | `GET` | Fetch complete dispute dossier details |
| `/claims/auto-draft-narrative` | `POST` | Generate structured dispute narrative via AI |
| `/claims/:id/checkout` | `GET` | Retrieve fee breakdown and invoice coordinates |
| `/claims/:id/verify-payment` | `POST` | Verify Paystack/Flutterwave transaction ref |
| `/lawyer/dashboard-stats` | `GET` | Fetch counsel litigation pipeline & fee metrics |
| `/lawyer/kyc` | `POST` | Submit NBA credentials & practicing certificates |
| `/referrals` | `GET`/`PATCH` | Manage bilateral dispute-to-counsel matching |
| `/settlements` | `GET` | Retrieve settled restitution records |

---

## 👥 User Roles & Access Control

1. **Claimant (Consumer / Business Entity)**:
   - File claims and track financial dispute resolutions.
   - Pay filing or retainer fees via Paystack or Flutterwave.
   - Download official legal demand notices.
   - Accept or reject counsel referral proposals.

2. **Accredited Legal Counsel (Lawyer)**:
   - Complete multi-tier NBA KYC verification.
   - Review incoming dispute briefs matched to their legal specialization.
   - Issue fee proposals (contingency or retainer percentages).
   - Track active litigation retainers and earned legal fees.

3. **Public / Prospective User**:
   - Access landing page, dispute category guide, FAQs, and regulatory compliance framework.

---

## 📄 License & Attribution

Designed and engineered for **Rekovry**. All rights reserved.
Built in compliance with consumer financial protection guidelines.
