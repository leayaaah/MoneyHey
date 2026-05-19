# MoneyHey — Technical Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Details](#2-architecture-details)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [Component Structure](#5-component-structure)
6. [API Services & Integration](#6-api-services--integration)
7. [User Authentication Flow](#7-user-authentication-flow)
8. [Feature Descriptions](#8-feature-descriptions)
9. [Deployment Instructions](#9-deployment-instructions)
10. [Environment Configuration](#10-environment-configuration)

---

## 1. Project Overview

**MoneyHey** is a personal finance management web application designed to help users track income, expenses, wallets, budgets, and generate visual financial reports. The application features a modern React-based frontend integrated with Supabase as the backend-as-a-service platform, and includes an innovative **AI Quick Transaction Parsing** capability that converts unstructured Vietnamese natural-language notes into structured financial transactions.

### Core Capabilities

- **Transaction Management**: Add, edit, delete, filter, and paginate income/expense transactions.
- **Wallet Management**: Maintain multiple wallets with real-time balance tracking.
- **Category Management**: Organize transactions into customizable income and expense categories.
- **Budget Tracking**: Set budgets with category-based limits and monitor usage.
- **Dashboard Analytics**: View summary cards, spending charts, recent transactions, and budget status.
- **Reporting & Visualization**: Interactive pie charts, bar charts, and line charts powered by Nivo.
- **AI Transaction Parsing**: Parse free-form Vietnamese text (e.g., *"uong phuc long het 65k, an my cay het 79k"*) into multiple structured transactions using OpenAI or Google Gemini.

### Target Audience

Vietnamese-speaking individuals seeking a simple yet powerful tool for personal finance tracking with AI-assisted data entry.

---

## 2. Architecture Details

MoneyHey follows a **Layered Architecture** pattern with clear separation of concerns between presentation, application, domain, and infrastructure layers. This structure promotes testability, maintainability, and scalability.

### 2.1 Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│  (React Components, Pages, Hooks, Context, Utils, CSS)      │
├─────────────────────────────────────────────────────────────┤
│                     APPLICATION LAYER                        │
│  (Services: authService, transactionService, walletService,  │
│   categoryService, dashboardService, profileService,         │
│   transactionIntelligenceService)                           │
├─────────────────────────────────────────────────────────────┤
│                       DOMAIN LAYER                           │
│  (Business Rules & Mappers: transactionRules,               │
│   transactionMapper, walletCalculations)                    │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                      │
│  (Repositories: authRepository, transactionRepository,       │
│   walletRepository, categoryRepository, budgetRepository,   │
│   profileRepository, transactionAiRepository)               │
│  (Supabase Client: supabaseClient.js)                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Layer Responsibilities

| Layer | Responsibility | Key Directories |
|-------|---------------|-----------------|
| **Presentation** | UI rendering, user interactions, routing, state consumption | `src/presentation/` |
| **Application** | Orchestration of domain logic, data transformation, use-case coordination | `src/application/services/` |
| **Domain** | Business rules validation, entity mapping, calculation logic | `src/domain/` |
| **Infrastructure** | External service integration, data persistence, API communication | `src/infrastructure/` |

### 2.3 Key Design Patterns

- **Repository Pattern**: Data access is abstracted through repository modules that interact with Supabase, allowing the application layer to remain database-agnostic.
- **Service Layer Pattern**: Business operations are encapsulated in service modules that coordinate between repositories and domain logic.
- **Context API**: Global authentication state is managed via React Context (`AuthProvider`) consumed through the `useAuth` hook.
- **Protected Routes**: Route-level authentication gating is implemented via `ProtectedRoute` component using React Router's `<Outlet />`.

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^19.2.4 | UI library with component-based architecture |
| **React DOM** | ^19.2.4 | DOM rendering for React |
| **React Router DOM** | ^7.14.0 | Client-side routing and navigation |
| **Vite** | ^8.0.1 | Build tool and development server with HMR |
| **Bootstrap** | ^5.3.8 | CSS framework for responsive layout and components |
| **@vitejs/plugin-react** | ^6.0.1 | Official Vite plugin for React Fast Refresh |

### 3.2 Data Visualization

| Technology | Version | Purpose |
|-----------|---------|---------|
| **@nivo/core** | ^0.99.0 | Core Nivo visualization library |
| **@nivo/pie** | ^0.99.0 | Pie/donut charts for expense breakdown |
| **@nivo/bar** | ^0.99.0 | Bar charts for absolute spending |
| **@nivo/line** | ^0.99.0 | Line charts for spending trends |

### 3.3 Backend & Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Supabase** | ^2.100.0 | Backend-as-a-service providing PostgreSQL database, authentication, and real-time APIs |

### 3.4 AI Integration

| Provider | Default Model | Purpose |
|----------|--------------|---------|
| **OpenAI** | gpt-5.4-nano | Natural language transaction parsing |
| **Google Gemini** | gemini-2.5-flash | Alternative NLP transaction parsing |

### 3.5 Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | ^9.39.4 | JavaScript/JSX linting |
| **eslint-plugin-react-hooks** | ^7.0.1 | React Hooks rules |
| **eslint-plugin-react-refresh** | ^0.5.2 | Fast Refresh validation |
| **globals** | ^17.4.0 | Global variable definitions for ESLint |

### 3.6 Fonts & Icons

- **Manrope** (400, 600, 700, 800): Primary display font
- **Inter** (400, 500, 600): Body text font
- **Material Symbols Outlined**: UI icons via Google Fonts

---

## 4. Database Schema

MoneyHey uses **Supabase PostgreSQL** with the following core tables. Relationships are managed through foreign key constraints with automatic user isolation via Row Level Security (RLS) policies.

### 4.1 Entity Relationship Overview

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   profiles  │       │  transactions   │       │   wallets   │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ user_id (PK)│◄──────│ user_id (FK)    │       │ wallet_id   │
│ full_name   │       │ wallet_id (FK)  │──────►│ user_id (FK)│
│ email       │       │ category_id(FK) │────┐  │ wallet_name │
│ avatar_img  │       │ amount          │    │  │ balance     │
└─────────────┘       │ note            │    │  └─────────────┘
                      │ tx_date         │    │
                      │ tx_type         │    │  ┌─────────────┐
                      └─────────────────┘    └──┤  categories │
                                                ├─────────────┤
                                                │ category_id │
                      ┌─────────────────┐       │ category_name│
                      │     budgets     │       │ tx_type     │
                      ├─────────────────┤       │ is_active   │
                      │ budget_id       │       └─────────────┘
                      │ user_id (FK)    │
                      │ category_id (FK)│
                      │ amount          │
                      │ start_date      │
                      │ end_date        │
                      └─────────────────┘
```

### 4.2 Table Definitions

#### `profiles`
Extended user profile information linked to Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PK, FK → auth.users | Unique user identifier |
| `full_name` | VARCHAR | | Display name |
| `email` | VARCHAR | | User email address |
| `avatar_img` | TEXT | | Avatar image URL |

#### `wallets`
User-defined financial accounts or wallets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `wallet_id` | SERIAL/INT | PK | Auto-increment wallet ID |
| `user_id` | UUID | FK → profiles | Wallet owner |
| `wallet_name` | VARCHAR | NOT NULL | Wallet display name |
| `balance` | DECIMAL | DEFAULT 0 | Current balance in VND |

#### `categories`
Predefined and user-defined transaction categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `category_id` | SERIAL/INT | PK | Auto-increment category ID |
| `category_name` | VARCHAR | NOT NULL | Category display name |
| `tx_type` | VARCHAR | | `"expense"` or `"income"` |
| `is_active` | BOOLEAN | DEFAULT true | Soft-delete flag |

#### `transactions`
Core transaction records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `trans_id` | SERIAL/INT | PK | Auto-increment transaction ID |
| `user_id` | UUID | FK → profiles | Transaction owner |
| `wallet_id` | INT | FK → wallets | Associated wallet |
| `category_id` | INT | FK → categories | Associated category |
| `amount` | DECIMAL | NOT NULL | Transaction amount (VND) |
| `note` | TEXT | | Transaction description |
| `tx_date` | DATE/TIMESTAMP | NOT NULL | Transaction date |
| `tx_type` | VARCHAR | NOT NULL | `"expense"` or `"income"` |

#### `budgets`
Budget limits with date ranges and optional category targeting.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `budget_id` | SERIAL/INT | PK | Auto-increment budget ID |
| `user_id` | UUID | FK → profiles | Budget owner |
| `category_id` | INT | FK → categories | Target category (nullable) |
| `amount` | DECIMAL | NOT NULL | Budget limit amount |
| `start_date` | DATE | NOT NULL | Budget period start |
| `end_date` | DATE | NOT NULL | Budget period end |

---

## 5. Component Structure

### 5.1 Directory Tree

```
src/
├── presentation/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LoginHeader.jsx
│   │   │   └── Pagination.jsx
│   │   ├── dashboard/
│   │   │   ├── QuickActions.jsx
│   │   │   ├── RecentTransactions.jsx
│   │   │   ├── SpendingChart.jsx
│   │   │   └── SummaryCard.jsx
│   │   ├── report/
│   │   │   ├── ExpensePieChart.jsx
│   │   │   ├── ExpenseBarChart.jsx
│   │   │   └── ExpenseLineChart.jsx
│   │   └── transaction/
│   │       ├── AddTransactionModal.jsx
│   │       ├── TransactionFilter.jsx
│   │       └── TransactionList.jsx
│   ├── context/
│   │   └── AuthProvider.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── TransactionPage.jsx
│   │   ├── ReportPage.jsx
│   │   ├── BudgetPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── ExplorePage.jsx
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   └── utils/
│       └── formatCurrency.js
├── application/
│   └── services/
│       ├── authService.js
│       ├── transactionService.js
│       ├── walletService.js
│       ├── categoryService.js
│       ├── dashboardService.js
│       ├── profileService.js
│       └── transactionIntelligenceService.js
├── domain/
│   └── transactions/
│       ├── transactionMapper.js
│       └── transactionRules.js
│   └── wallets/
│       └── walletCalculations.js
├── infrastructure/
│   ├── repositories/
│   │   ├── authRepository.js
│   │   ├── transactionRepository.js
│   │   ├── walletRepository.js
│   │   ├── categoryRepository.js
│   │   ├── budgetRepository.js
│   │   ├── profileRepository.js
│   │   └── transactionAiRepository.js
│   └── supabaseClient.js
├── theme/
│   └── theme.js
├── App.jsx
├── main.jsx
├── App.css
└── index.css
```

### 5.2 Component Categories

#### Authentication Components (`components/auth/`)

| Component | Purpose |
|-----------|---------|
| **LoginForm** | Email/password login form with validation |
| **RegisterForm** | User registration form |
| **ProtectedRoute** | Route guard that redirects unauthenticated users to `/login` |

#### Common Components (`components/common/`)

| Component | Purpose |
|-----------|---------|
| **Header** | Top navigation bar with sidebar toggle, user avatar, and logout |
| **Sidebar** | Collapsible navigation sidebar with route links (Dashboard, Transactions, Reports, Budget, Profile, Settings) |
| **Footer** | Application footer |
| **LoginHeader** | Header variant for auth pages |
| **Pagination** | Reusable pagination controls for list views |

#### Dashboard Components (`components/dashboard/`)

| Component | Purpose |
|-----------|---------|
| **SummaryCard** | Reusable stat card with icon, value, trend indicator, and subtitle |
| **QuickActions** | Shortcut buttons for common actions (add expense, add income, view report, view wallet) |
| **RecentTransactions** | List of latest 6 transactions |
| **SpendingChart** | Horizontal bar chart of top 5 spending categories |

#### Report Components (`components/report/`)

| Component | Purpose |
|-----------|---------|
| **ExpensePieChart** | Donut chart showing expense proportion by category (Nivo ResponsivePie) |
| **ExpenseBarChart** | Vertical bar chart of absolute spending per category |
| **ExpenseLineChart** | Line chart showing 6-month spending trends |

#### Transaction Components (`components/transaction/`)

| Component | Purpose |
|-----------|---------|
| **AddTransactionModal** | Bootstrap modal for creating/editing transactions with AI quick-parse tab |
| **TransactionFilter** | Filter panel (date range, category, wallet, type, keyword search) |
| **TransactionList** | Paginated table of transactions with edit/delete actions |

### 5.3 Pages

| Page | Route | Description |
|------|-------|-------------|
| **LoginPage** | `/login` | User authentication entry point |
| **RegisterPage** | `/register` | New user registration |
| **DashboardPage** | `/dashboard` | Main dashboard with summaries and charts |
| **TransactionPage** | `/transactions` | Full transaction management with filters and CRUD |
| **ReportPage** | `/reports` | Financial reports with interactive charts |
| **BudgetPage** | `/budget` | Budget overview and progress tracking |
| **ProfilePage** | `/profile` | User profile management |
| **SettingsPage** | `/settings` | Application settings (theme, preferences) |
| **ExplorePage** | `/explore` | Public explore page (no auth required) |

---

## 6. API Services & Integration

### 6.1 Supabase Client Configuration

The Supabase client is initialized in `src/infrastructure/supabaseClient.js` with:

- **URL**: `https://vpztqqjlbtoszfomvshx.supabase.co`
- **Auth Persistence**: Enabled with custom storage adapter supporting "Remember Me" functionality
- **Storage Strategy**: Dynamically switches between `localStorage` (remembered sessions) and `sessionStorage` (temporary sessions)

### 6.2 Service API Reference

#### Auth Service (`authService.js`)

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `signIn(email, password)` | `string, string` | Supabase session | Authenticates user with email/password |
| `signOut()` | — | Promise | Ends the current session |
| `getUser()` | — | `{ data: { user } }` | Retrieves current authenticated user |
| `setRememberSession(shouldRemember)` | `boolean` | — | Toggles persistent session storage |

#### Transaction Service (`transactionService.js`)

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `fetchTransactions(userId)` | `string` | `Transaction[]` | Retrieves all user transactions with mapped relations |
| `createTransaction(transaction)` | `Transaction` | `Transaction` | Creates a single transaction and updates wallet balance |
| `createTransactions(transactions)` | `Transaction[]` | `Transaction[]` | Batch creates transactions with balance updates |
| `updateTransaction(id, transaction)` | `number, Transaction` | `Transaction` | Updates transaction with wallet balance rollback/recovery |
| `removeTransaction(id)` | `number` | — | Deletes transaction and reverts wallet balance |
| `fetchTransactionsByType(type)` | `"income" \| "expense"` | `Transaction[]` | Filters transactions by type |

#### Wallet Service (`walletService.js`)

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `getTotalBalance(userId)` | `string` | `number` | Sums all wallet balances |
| `fetchWallets(userId)` | `string` | `Wallet[]` | Retrieves all user wallets |
| `createWallet(wallet)` | `Wallet` | `Wallet` | Creates a new wallet with validation |
| `updateWallet(id, wallet)` | `number, Wallet` | `Wallet` | Updates wallet details |
| `removeWallet(id, userId)` | `number, string` | — | Deletes wallet if no transactions exist |
| `applyTransactionsToWalletBalances(transactions)` | `Transaction[]` | — | Atomically applies balance deltas with rollback support |

#### Category Service (`categoryService.js`)

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `fetchCategories()` | — | `Category[]` | Retrieves all active categories |
| `createCategory(input)` | `string \| object` | `Category` | Creates a new category with type validation |

#### Dashboard Service (`dashboardService.js`)

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `getDashboardData(userId)` | `string` | `DashboardData` | Aggregates wallets, transactions, and budgets into dashboard-ready metrics |

**DashboardData Structure**:

```js
{
  totalBalance,           // Total across all wallets
  walletCount,            // Number of wallets
  recentTransactions,     // Last 6 transactions
  categorySpending,       // Top 5 expense categories with percentages
  currentMonthIncome,     // Income for current month
  currentMonthExpense,    // Expenses for current month
  incomeTrend,            // % change vs previous month
  expenseTrend,           // % change vs previous month
  activeBudgetCount,      // Number of active budgets
  budgetUsagePercent,     // % of budget used
  totalBudgetAmount       // Total budget limit
}
```

#### Transaction Intelligence Service (`transactionIntelligenceService.js`)

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `parseQuickTransactions({ rawText, categories })` | `string, Category[]` | `ParseResult` | Parses unstructured Vietnamese text into structured transactions via AI or fallback heuristic parser |

**ParseResult Structure**:

```js
{
  source: 'ai' | 'fallback',
  provider: 'openai' | 'gemini' | 'endpoint',
  providerLabel: string,
  model: string,
  reason?: string,        // Present when fallback is used
  transactions: [{
    note, amount, tx_type, category_id, category_name, confidence
  }]
}
```

### 6.3 AI Repository (`transactionAiRepository.js`)

Handles direct communication with AI providers:

| Function | Description |
|----------|-------------|
| `getTransactionAiConfig()` | Reads environment variables and returns provider configuration |
| `parseTransactionsByAi({ rawText, categories })` | Routes to OpenAI, Gemini, or custom endpoint based on config |
| `requestFromOpenAI()` | Sends structured JSON schema request to OpenAI Responses API |
| `requestFromGemini()` | Sends schema-constrained request to Gemini GenerateContent API |
| `requestFromCustomEndpoint()` | POSTs to user-defined `VITE_TRANSACTION_AI_ENDPOINT` |

**Amount Normalization Rules** (Vietnamese currency conventions):

| Pattern | Normalized Value |
|---------|-----------------|
| `65k`, `65 nghin`, `65 ngan` | 65,000 VND |
| `1tr`, `1 trieu` | 1,000,000 VND |
| `100` (no unit) | 100 VND |

---

## 7. User Authentication Flow

### 7.1 Authentication Architecture

MoneyHey uses **Supabase Auth** for user authentication with email/password strategy. Session persistence supports both "Remember Me" (localStorage) and session-only (sessionStorage) modes.

### 7.2 Authentication Flow Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User      │     │  LoginForm      │     │  authService    │
│  (Browser)  │────►│  (UI Component) │────►│  (signIn)       │
└─────────────┘     └─────────────────┘     └────────┬────────┘
                                                     │
                              ┌──────────────────────┘
                              ▼
                       ┌──────────────┐
                       │ Supabase Auth │
                       │ (signInWith  │
                       │  Password)    │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  AuthProvider │◄──────┐
                       │  (Context)    │       │
                       └──────┬───────┘       │
                              │               │
                              ▼               │
                       ┌──────────────┐       │
                       │   useAuth()   │───────┘
                       │   Hook        │
                       └───────────────┘
```

### 7.3 Authentication States

The `AuthProvider` maintains the following state:

| State | Type | Description |
|-------|------|-------------|
| `user` | `object \| null` | Authenticated user with `{ user_id, name, email, avatar }` |
| `isLoggedIn` | `boolean` | Authentication status flag |
| `loading` | `boolean` | Initial auth check in progress |

### 7.4 Route Protection

Protected routes are wrapped in `ProtectedRoute` which conditionally renders:

- **`Outlet`** — if `isAuthenticated === true`
- **`<Navigate to="/login" replace />`** — if not authenticated

Protected pages: `/dashboard`, `/transactions`, `/reports`, `/settings`, `/budget`, `/profile`

Public pages: `/login`, `/register`, `/explore`, `/`

### 7.5 Logout Flow

1. User clicks logout in Header
2. `logout()` from `useAuth()` calls `signOut()` from Supabase
3. `AuthProvider` clears `user` and `isLoggedIn` state
4. App redirects to `/login`

---

## 8. Feature Descriptions

### 8.1 Dashboard

The **Dashboard** (`/dashboard`) serves as the application's home screen and provides at-a-glance financial health metrics.

**Summary Cards** (4 cards in responsive grid):
1. **Total Balance** — Sum of all wallet balances with wallet count subtitle
2. **Monthly Income** — Current month income with trend vs. previous month
3. **Monthly Expense** — Current month expense with trend indicator
4. **Active Budgets** — Number of active budgets with usage percentage

**Charts & Lists**:
- **Quick Actions** — Shortcut buttons to common pages
- **Spending Chart** — Top 5 spending categories with horizontal bars
- **Recent Transactions** — Last 6 transactions with category and wallet names

### 8.2 Transaction Management

The **Transactions** page (`/transactions`) provides full CRUD operations with advanced filtering.

**Features**:
- **Add Transaction Modal** — Form with wallet, category, amount, note, date, and type
- **AI Quick Parse** — Tab in modal for pasting free-form Vietnamese text to auto-generate multiple transactions
- **Edit Transaction** — Inline modal editing with pre-populated values
- **Delete Transaction** — Confirmation dialog with wallet balance rollback
- **Filters** — Date range, category dropdown, wallet dropdown, transaction type, keyword search
- **Pagination** — 5 items per page with navigation controls

**Transaction Validation Rules**:
- Amount must be a positive number
- Wallet is required
- Category is required
- Transaction date is required
- Type must be `"expense"` or `"income"`

### 8.3 AI Quick Transaction Parsing

A standout feature that converts unstructured Vietnamese notes into structured transactions.

**Supported Input**:
```
uong phuc long het 65k, an my cay het 79k, mua ao het 100k
```

**AI Flow**:
1. User pastes text into AI Quick Parse tab
2. Frontend reads `VITE_TRANSACTION_AI_PROVIDER` from environment
3. Request is sent to OpenAI or Gemini with:
   - System instructions for Vietnamese finance extraction
   - Category options from the database
   - Strict JSON schema response format
4. AI returns structured transactions with note, amount, type, category, and confidence score
5. If AI fails or is unconfigured, a **fallback parser** handles:
   - Amount extraction with Vietnamese unit normalization (k, nghin, tr, trieu)
   - Income/expense inference from keywords
   - Category matching via keyword scoring

**Fallback Keywords**:
- Income indicators: `luong`, `thuong`, `nhan`, `thu`, `ban duoc`, `hoan tien`, `freelance`
- Category mapping: `an uong`, `di chuyen`, `mua sam`, `giai tri`, `hoa don`, `nha o`, `suc khoe`, `giao duc`

### 8.4 Reports

The **Reports** page (`/reports`) visualizes financial data with interactive charts.

**Metrics Displayed**:
- Total Income (all time)
- Total Expense (all time)
- Net Cash Flow (income - expense)
- Current Wallet Balance

**Charts**:
- **Expense Pie Chart** — Category proportion donut chart with legend
- **Expense Bar Chart** — Absolute spending per category
- **Expense Line Chart** — 6-month spending trend analysis

All charts use **Nivo** with custom theming from `theme.js` and compact VND formatting.

### 8.5 Budget Management

The **Budget** page (`/budget`) displays budget progress with visual indicators.

**Features**:
- Budget summary cards (Total, Spent, Remaining)
- Individual budget items with progress bars
- Status indicators: Safe / Approaching / Over budget
- Color-coded warnings based on percentage used

**Budget Logic** (in dashboard):
- Active budgets are those whose date range overlaps the current month
- Budget usage is calculated from expenses in targeted categories within the budget period

### 8.6 Wallet Management

Wallets are managed through the transaction modal and dashboard.

**Features**:
- Create wallets with name and initial balance
- Update wallet details
- Delete wallets (only if no transactions exist)
- Automatic balance updates on every transaction CRUD operation
- **Compensating transactions** — If a database error occurs during wallet balance update, the system rolls back to original balances

### 8.7 Theme & Settings

- **Light/Dark Theme** — Theme preference stored in `localStorage` as `moneyhey_settings`
- **Responsive Layout** — Collapsible sidebar with Bootstrap grid system
- **Vietnamese Localization** — Currency formatting (`vi-VN`), date formatting, and UI labels

---

## 9. Deployment Instructions

### 9.1 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **pnpm**
- **Supabase Project** with configured database schema
- *(Optional)* **OpenAI API Key** or **Google Gemini API Key** for AI parsing

### 9.2 Local Development Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd MoneyHey

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Configure environment variables
copy .env.example .env
# Edit .env with your API keys

# 4. Start the development server
npm run dev
```

The development server will start at `http://localhost:5173` (default Vite port).

### 9.3 Build for Production

```bash
# Create an optimized production build
npm run build

# Preview the production build locally
npm run preview
```

The production build is output to the `dist/` directory.

### 9.4 Deployment Options

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Netlify

1. Run `npm run build`
2. Drag the `dist/` folder to Netlify's deploy dropzone
3. Or connect your Git repository for continuous deployment

#### Option C: Static Hosting (Any CDN)

1. Run `npm run build`
2. Upload the contents of `dist/` to your static hosting provider

### 9.5 Supabase Configuration

Ensure the following are configured in your Supabase project:

1. **Database Tables**: `profiles`, `wallets`, `categories`, `transactions`, `budgets`
2. **Row Level Security (RLS)**: Enable RLS on all tables and create policies restricting data access to `auth.uid()`
3. **Authentication**: Enable Email provider in Authentication settings
4. **Triggers**: Set up a trigger to auto-create a `profiles` row when a new user signs up

### 9.6 Post-Deployment Checklist

- [ ] Verify Supabase RLS policies are active
- [ ] Confirm environment variables are set in hosting platform
- [ ] Test user registration and login
- [ ] Verify AI parsing works (if API keys are configured)
- [ ] Check that charts render correctly on target browsers
- [ ] Ensure responsive layout works on mobile devices

---

## 10. Environment Configuration

### 10.1 Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_TRANSACTION_AI_PROVIDER` | No | `openai` | AI provider: `openai` or `gemini` |
| `VITE_TRANSACTION_AI_ENDPOINT` | No | *(empty)* | Custom AI endpoint URL (overrides built-in providers) |
| `VITE_OPENAI_API_KEY` | No | *(empty)* | OpenAI API key for local development |
| `VITE_OPENAI_MODEL` | No | `gpt-5.4-nano` | OpenAI model identifier |
| `VITE_GEMINI_API_KEY` | No | *(empty)* | Google Gemini API key for local development |
| `VITE_GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model identifier |

### 10.2 Security Warnings

> **IMPORTANT**: API keys (`VITE_OPENAI_API_KEY`, `VITE_GEMINI_API_KEY`) are embedded in client-side bundle code due to Vite's environment variable handling. For production deployments, **do not** expose these keys directly. Instead:
>
> 1. Set `VITE_TRANSACTION_AI_ENDPOINT` to your own backend proxy/edge function
> 2. Store API keys securely on your server
> 3. Have your server forward requests to OpenAI/Gemini

### 10.3 Available npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start development server with HMR |
| `build` | `vite build` | Create production build |
| `lint` | `eslint .` | Run ESLint across the codebase |
| `preview` | `vite preview` | Preview production build locally |

---

## Appendix A: File Structure Reference

```
MoneyHey/
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
├── eslint.config.js              # ESLint configuration
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Lock file
├── pnpm-lock.yaml                # pnpm lock file
├── vite.config.js                # Vite configuration
├── README.md                     # Project readme
├── database/
│   └── supabase-schema-moneyhey.png  # Database schema diagram
└── src/
    ├── App.jsx                   # Root component with routing
    ├── App.css                   # Global App styles
    ├── main.jsx                  # Application entry point
    ├── index.css                 # Global CSS/styles
    ├── theme/
    │   └── theme.js              # Design token colors
    ├── presentation/             # UI Layer
    │   ├── components/           # Reusable components
    │   ├── context/              # React Context providers
    │   ├── hooks/                # Custom React hooks
    │   ├── pages/                # Route-level page components
    │   └── utils/                # UI utility functions
    ├── application/              # Application Layer
    │   └── services/             # Business orchestration services
    ├── domain/                   # Domain Layer
    │   ├── transactions/         # Transaction business rules
    │   └── wallets/              # Wallet calculation logic
    ├── infrastructure/           # Infrastructure Layer
    │   ├── repositories/         # Data access repositories
    │   └── supabaseClient.js     # Supabase client initialization
    └── css/                      # Page-specific stylesheets
```

---

*Document Version: 1.0*
*Last Updated: May 2026*
*Project: MoneyHey Personal Finance Application*
