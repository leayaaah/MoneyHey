# Activity and Sequence Diagrams

<cite>
**Referenced Files in This Document**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md)
- [TECHNICAL_DOCUMENTATION.md](file://TECHNICAL_DOCUMENTATION.md)
- [SCREEN_FLOW.md](file://SCREEN_FLOW.md)
- [USECASE_DIAGRAM.md](file://USECASE_DIAGRAM.md)
- [src/main.jsx](file://src/main.jsx)
- [src/App.jsx](file://src/App.jsx)
- [src/presentation/context/AuthProvider.jsx](file://src/presentation/context/AuthProvider.jsx)
- [src/presentation/hooks/useAuth.js](file://src/presentation/hooks/useAuth.js)
- [src/application/services/authService.js](file://src/application/services/authService.js)
- [src/application/services/transactionService.js](file://src/application/services/transactionService.js)
- [src/application/services/walletService.js](file://src/application/services/walletService.js)
- [src/application/services/transactionIntelligenceService.js](file://src/application/services/transactionIntelligenceService.js)
- [src/infrastructure/repositories/authRepository.js](file://src/infrastructure/repositories/authRepository.js)
- [src/infrastructure/repositories/transactionRepository.js](file://src/infrastructure/repositories/transactionRepository.js)
- [src/infrastructure/repositories/walletRepository.js](file://src/infrastructure/repositories/walletRepository.js)
- [src/infrastructure/repositories/transactionAiRepository.js](file://src/infrastructure/repositories/transactionAiRepository.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document consolidates the activity and sequence diagrams that capture end-to-end workflows across the MoneyHey application. It focuses on:
- User authentication flow
- Manual transaction creation
- AI-powered quick transaction parsing
- Dashboard data loading
- Transaction deletion with compensation
- Component interaction overview

These diagrams are grounded in the repository’s layered architecture and service/repository patterns, and they align with the screen flow and use case descriptions documented elsewhere in the repository.

## Project Structure
MoneyHey follows a layered architecture with clear separation between presentation, application, domain, and infrastructure layers. The diagrams below reflect how components orchestrate user actions and data flows across these layers.

```mermaid
graph TB
subgraph "Presentation"
PAGES["Pages"]
COMP["Components"]
HOOKS["Hooks"]
CTX["AuthProvider"]
end
subgraph "Application"
SVC["Services"]
end
subgraph "Domain"
RULES["Business Rules"]
MAP["Mapper"]
CALC["Calculations"]
end
subgraph "Infrastructure"
REPO["Repositories"]
SC["Supabase Client"]
end
subgraph "External"
SB["Supabase Backend"]
AI["OpenAI / Gemini"]
end
PAGES --> COMP
PAGES --> HOOKS
HOOKS --> CTX
COMP --> HOOKS
PAGES --> SVC
SVC --> RULES
SVC --> MAP
SVC --> CALC
SVC --> REPO
REPO --> SC
SC --> SB
REPO -.-> AI
```

**Diagram sources**
- [TECHNICAL_DOCUMENTATION.md:44-64](file://TECHNICAL_DOCUMENTATION.md#L44-L64)
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:474-516](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L474-L516)

**Section sources**
- [TECHNICAL_DOCUMENTATION.md:38-81](file://TECHNICAL_DOCUMENTATION.md#L38-L81)
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:472-516](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L472-L516)

## Core Components
This section highlights the primary components involved in the workflows covered by the diagrams:
- Authentication: AuthProvider, useAuth hook, authService, authRepository
- Transaction lifecycle: transactionService, transactionRepository, walletService, walletRepository
- AI parsing: transactionIntelligenceService, transactionAiRepository
- Routing and context: main.jsx, App.jsx

Key responsibilities:
- Presentation layer: Pages and components orchestrate user interactions.
- Application layer: Services encapsulate business operations and coordinate repositories and domain logic.
- Domain layer: Rules and calculations enforce validation and derive derived metrics.
- Infrastructure layer: Repositories abstract Supabase interactions; transactionAiRepository integrates external AI providers.

**Section sources**
- [src/presentation/context/AuthProvider.jsx:1-84](file://src/presentation/context/AuthProvider.jsx#L1-L84)
- [src/presentation/hooks/useAuth.js:1-6](file://src/presentation/hooks/useAuth.js#L1-L6)
- [src/application/services/authService.js:1-7](file://src/application/services/authService.js#L1-L7)
- [src/application/services/transactionService.js:1-133](file://src/application/services/transactionService.js#L1-L133)
- [src/application/services/walletService.js:1-96](file://src/application/services/walletService.js#L1-L96)
- [src/application/services/transactionIntelligenceService.js:1-179](file://src/application/services/transactionIntelligenceService.js#L1-L179)
- [src/infrastructure/repositories/authRepository.js:1-11](file://src/infrastructure/repositories/authRepository.js#L1-L11)
- [src/infrastructure/repositories/transactionRepository.js:1-133](file://src/infrastructure/repositories/transactionRepository.js#L1-L133)
- [src/infrastructure/repositories/walletRepository.js:1-107](file://src/infrastructure/repositories/walletRepository.js#L1-L107)
- [src/infrastructure/repositories/transactionAiRepository.js:1-325](file://src/infrastructure/repositories/transactionAiRepository.js#L1-L325)

## Architecture Overview
The architecture supports predictable flows:
- Presentation components trigger application services.
- Services validate inputs, map relations, and delegate persistence to repositories.
- Repositories interact with Supabase; AI repository communicates with external providers.
- Domain logic ensures correctness and consistency (e.g., compensating balance updates).

```mermaid
sequenceDiagram
participant UI as "UI"
participant SVC as "Service"
participant REPO as "Repository"
participant DB as "Supabase"
UI->>SVC : Invoke operation
SVC->>REPO : Persist/Query data
REPO->>DB : Supabase SQL/API
DB-->>REPO : Result
REPO-->>SVC : Domain object(s)
SVC-->>UI : Outcome
```

**Diagram sources**
- [TECHNICAL_DOCUMENTATION.md:44-64](file://TECHNICAL_DOCUMENTATION.md#L44-L64)
- [src/application/services/transactionService.js:31-85](file://src/application/services/transactionService.js#L31-L85)
- [src/infrastructure/repositories/transactionRepository.js:1-57](file://src/infrastructure/repositories/transactionRepository.js#L1-L57)

## Detailed Component Analysis

### Activity Diagram: User Authentication Flow
This diagram captures the end-to-end authentication journey from app launch to dashboard access or registration.

```mermaid
flowchart TD
START([Start]) --> OPEN_APP[User opens application]
OPEN_APP --> CHECK_AUTH{Is user<br/>logged in?}
CHECK_AUTH -- Yes --> LOAD_DASHBOARD[Load Dashboard Page]
CHECK_AUTH -- No --> SHOW_LOGIN[Show Login Page]
SHOW_LOGIN --> USER_ACTION{User action?}
USER_ACTION -- Login --> ENTER_CREDENTIALS[Enter email & password]
ENTER_CREDENTIALS --> VALIDATE_LOGIN{Valid credentials?}
VALIDATE_LOGIN -- Yes --> CREATE_SESSION[Create Supabase session]
CREATE_SESSION --> FETCH_PROFILE[Fetch user profile]
FETCH_PROFILE --> SET_AUTH_STATE[Set AuthContext:<br/>isLoggedIn = true]
SET_AUTH_STATE --> LOAD_DASHBOARD
VALIDATE_LOGIN -- No --> SHOW_ERROR[Display error message]
SHOW_ERROR --> SHOW_LOGIN
USER_ACTION -- Register --> SHOW_REGISTER[Show Register Page]
SHOW_REGISTER --> ENTER_DETAILS[Enter registration details]
ENTER_DETAILS --> CREATE_ACCOUNT[Create Supabase auth account]
CREATE_ACCOUNT --> CREATE_PROFILE[Create profile record]
CREATE_PROFILE --> SHOW_LOGIN
USER_ACTION -- Explore --> SHOW_EXPLORE[Show Explore Page]
SHOW_EXPLORE --> USER_ACTION
LOAD_DASHBOARD --> END_AUTH([End])
```

**Diagram sources**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:9-39](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L9-L39)

**Section sources**
- [src/presentation/context/AuthProvider.jsx:12-46](file://src/presentation/context/AuthProvider.jsx#L12-L46)
- [src/presentation/hooks/useAuth.js:4-6](file://src/presentation/hooks/useAuth.js#L4-L6)
- [src/application/services/authService.js:4-6](file://src/application/services/authService.js#L4-L6)
- [src/infrastructure/repositories/authRepository.js:3-10](file://src/infrastructure/repositories/authRepository.js#L3-L10)

### Activity Diagram: Add Transaction Flow (Manual)
This diagram outlines manual transaction creation, validation, persistence, and balance updates.

```mermaid
flowchart TD
START_TX([Start]) --> NAV_TX[Navigate to Transactions Page]
NAV_TX --> CLICK_ADD[Click "Add Transaction" button]
CLICK_ADD --> OPEN_MODAL[Open Add Transaction Modal]
OPEN_MODAL --> ENTER_DATA[Enter transaction data:<br/>- Wallet<br/>- Category<br/>- Amount<br/>- Note<br/>- Date<br/>- Type]
ENTER_DATA --> VALIDATE{Validate input?}
VALIDATE -- Invalid --> SHOW_VALIDATION[Show validation errors]
SHOW_VALIDATION --> ENTER_DATA
VALIDATE -- Valid --> SAVE_TX[Save transaction to Supabase]
SAVE_TX --> UPDATE_WALLET[Update wallet balance]
UPDATE_WALLET --> SUCCESS{Save successful?}
SUCCESS -- Yes --> REFRESH_LIST[Refresh transaction list]
REFRESH_LIST --> REFRESH_WALLETS[Refresh wallet balances]
REFRESH_WALLETS --> CLOSE_MODAL[Close modal]
CLOSE_MODAL --> END_TX([End])
SUCCESS -- No --> ROLLBACK[Rollback wallet balance]
ROLLBACK --> SHOW_SAVE_ERROR[Show save error]
SHOW_SAVE_ERROR --> ENTER_DATA
```

**Diagram sources**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:43-66](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L43-L66)

**Section sources**
- [src/application/services/transactionService.js:41-62](file://src/application/services/transactionService.js#L41-L62)
- [src/application/services/walletService.js:36-70](file://src/application/services/walletService.js#L36-L70)
- [src/infrastructure/repositories/transactionRepository.js:21-43](file://src/infrastructure/repositories/transactionRepository.js#L21-L43)
- [src/infrastructure/repositories/walletRepository.js:80-94](file://src/infrastructure/repositories/walletRepository.js#L80-L94)

### Activity Diagram: AI Quick Parse Transaction Flow
This diagram covers AI-driven parsing with fallback heuristics and user review.

```mermaid
flowchart TD
START_AI([Start]) --> OPEN_AI_TAB[Open AI Quick Parse tab]
OPEN_AI_TAB --> ENTER_TEXT[Enter unstructured text:<br/>e.g., "uong phuc long het 65k, an my cay het 79k"]
ENTER_TEXT --> CLICK_PARSE[Click "Parse" button]
CLICK_PARSE --> CHECK_CONFIG{AI configured?}
CHECK_CONFIG -- Yes --> CALL_AI[Call AI provider API]
CALL_AI --> AI_RESPONSE{AI response<br/>successful?}
AI_RESPONSE -- Yes --> PARSE_JSON[Parse JSON response]
PARSE_JSON --> NORMALIZE[Normalize transactions]
NORMALIZE --> DISPLAY_PREVIEW[Display parsed transactions preview]
AI_RESPONSE -- No --> FALLBACK[Use fallback heuristic parser]
FALLBACK --> EXTRACT_AMOUNTS[Extract amounts with<br/>Vietnamese unit normalization]
EXTRACT_AMOUNTS --> INFER_TYPE[Infer income/expense<br/>from keywords]
INFER_TYPE --> MATCH_CATEGORY[Match categories by<br/>keyword scoring]
MATCH_CATEGORY --> DISPLAY_PREVIEW
CHECK_CONFIG -- No --> FALLBACK
DISPLAY_PREVIEW --> USER_REVIEW{User reviews?}
USER_REVIEW -- Edit --> MODIFY_TX[Modify transactions]
MODIFY_TX --> DISPLAY_PREVIEW
USER_REVIEW -- Confirm --> SAVE_ALL[Save all transactions]
SAVE_ALL --> UPDATE_BALANCES[Update all affected<br/>wallet balances]
UPDATE_BALANCES --> END_AI([End])
USER_REVIEW -- Cancel --> END_AI
```

**Diagram sources**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:70-101](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L70-L101)

**Section sources**
- [src/application/services/transactionIntelligenceService.js:139-179](file://src/application/services/transactionIntelligenceService.js#L139-L179)
- [src/infrastructure/repositories/transactionAiRepository.js:128-145](file://src/infrastructure/repositories/transactionAiRepository.js#L128-L145)
- [src/infrastructure/repositories/transactionAiRepository.js:311-325](file://src/infrastructure/repositories/transactionAiRepository.js#L311-L325)

### Activity Diagram: View Dashboard Flow
This diagram shows parallel data fetching, metric computation, and rendering.

```mermaid
flowchart TD
START_DASH([Start]) --> AUTH_CHECK{User authenticated?}
AUTH_CHECK -- No --> REDIRECT_LOGIN[Redirect to Login]
AUTH_CHECK -- Yes --> LOAD_DASH[Load Dashboard Page]
LOAD_DASH --> FETCH_PARALLEL[Fetch data in parallel:
<br/>- Wallets
<br/>- Transactions
<br/>- Budgets]
FETCH_PARALLEL --> CALC_BALANCE[Calculate total balance]
CALC_BALANCE --> CALC_MONTHLY[Calculate current month<br/>income & expense]
CALC_MONTHLY --> CALC_TRENDS[Calculate trends vs<br/>previous month]
CALC_TRENDS --> BUILD_SPENDING[Build top 5 category<br/>spending list]
BUILD_SPENDING --> CALC_BUDGET[Calculate active budgets<br/>& usage percentage]
CALC_BUDGET --> GET_RECENT[Get 6 most recent<br/>transactions]
GET_RECENT --> RENDER_CARDS[Render summary cards]
RENDER_CARDS --> RENDER_CHARTS[Render spending chart]
RENDER_CHARTS --> RENDER_RECENT[Render recent transactions]
RENDER_RECENT --> RENDER_QUICK[Render quick actions]
RENDER_QUICK --> INTERACT{User interaction?}
INTERACT -- Navigate --> ROUTE[Route to selected page]
INTERACT -- Refresh --> LOAD_DASH
INTERACT -- Logout --> CLEAR_SESSION[Clear session & redirect]
REDIRECT_LOGIN --> END_DASH([End])
ROUTE --> END_DASH
CLEAR_SESSION --> END_DASH
```

**Diagram sources**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:105-136](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L105-L136)

**Section sources**
- [src/App.jsx:17-62](file://src/App.jsx#L17-L62)
- [src/presentation/context/AuthProvider.jsx:48-69](file://src/presentation/context/AuthProvider.jsx#L48-L69)

### Activity Diagram: Generate Report Flow
This diagram illustrates report generation with filtering and user interactions.

```mermaid
flowchart TD
START_REP([Start]) --> NAV_REPORTS[Navigate to Reports Page]
NAV_REPORTS --> AUTH_CHECK{Authenticated?}
AUTH_CHECK -- No --> REDIRECT[Redirect to Login]
AUTH_CHECK -- Yes --> FETCH_DATA[Fetch transactions<br/>& wallet balances]
FETCH_DATA --> CALC_INCOME[Calculate total income]
CALC_INCOME --> CALC_EXPENSE[Calculate total expense]
CALC_EXPENSE --> CALC_NET[Calculate net cash flow]
CALC_NET --> GROUP_CATEGORIES[Group expenses by category]
GROUP_CATEGORIES --> PREP_PIE[Prepare pie chart data]
PREP_PIE --> PREP_BAR[Prepare bar chart data]
PREP_BAR --> PREP_LINE[Prepare 6-month<br/>trend line data]
PREP_LINE --> RENDER_SUMMARY[Render summary cards]
RENDER_SUMMARY --> RENDER_PIE[Render expense pie chart]
RENDER_PIE --> RENDER_BAR[Render expense bar chart]
RENDER_BAR --> RENDER_LINE[Render trend line chart]
RENDER_LINE --> USER_INTERACT{User interaction?}
USER_INTERACT -- Filter --> APPLY_FILTER[Apply date/type filter]
APPLY_FILTER --> FETCH_DATA
USER_INTERACT -- Navigate --> ROUTE_PAGE[Route to other page]
USER_INTERACT -- Logout --> END_SESSION[End session]
REDIRECT --> END_REP([End])
ROUTE_PAGE --> END_REP
END_SESSION --> END_REP
```

**Diagram sources**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:140-170](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L140-L170)

**Section sources**
- [SCREEN_FLOW.md:1-192](file://SCREEN_FLOW.md#L1-L192)

### Sequence Diagram: User Authentication Sequence
This sequence shows the end-to-end authentication flow from UI to Supabase and back.

```mermaid
sequenceDiagram
actor U as User
participant LP as LoginPage
participant AF as AuthForm
participant AH as useAuth Hook
participant AP as AuthProvider
participant AS as authService
participant AR as authRepository
participant SC as supabaseClient
participant PS as profileService
participant PR as profileRepository
U->>LP : Open application
LP->>AP : Check auth state
AP->>AR : getUser()
AR->>SC : supabase.auth.getUser()
SC-->>AR : { user : null }
AR-->>AP : no user
AP-->>LP : isLoggedIn = false
LP-->>U : Show Login form
U->>AF : Enter email & password
U->>AF : Click Login
AF->>AS : signIn(email, password)
AS->>AR : signInWithPassword(email, password)
AR->>SC : supabase.auth.signInWithPassword()
SC-->>AR : session + user
AR-->>AS : session
AS-->>AF : success
AF->>AH : login()
AH->>AP : Trigger login
AP->>AR : getUser()
AR->>SC : supabase.auth.getUser()
SC-->>AR : authenticated user
AR-->>AP : user data
AP->>PS : getProfile(userId)
PS->>PR : fetchProfileByUserId(userId)
PR->>SC : supabase.from('profiles').select()
SC-->>PR : profile record
PR-->>PS : profile
PS-->>AP : { full_name, email, avatar_img }
AP->>AP : Set user state
AP-->>AH : user + isLoggedIn = true
AH-->>AF : auth updated
AF-->>LP : login success
LP-->>U : Redirect to Dashboard
```

**Diagram sources**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:178-228](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L178-L228)

**Section sources**
- [src/presentation/context/AuthProvider.jsx:12-46](file://src/presentation/context/AuthProvider.jsx#L12-L46)
- [src/application/services/authService.js:4-6](file://src/application/services/authService.js#L4-L6)
- [src/infrastructure/repositories/authRepository.js:3-10](file://src/infrastructure/repositories/authRepository.js#L3-L10)

### Sequence Diagram: Add Transaction Sequence
This sequence covers manual transaction creation, validation, persistence, and balance updates.

```mermaid
sequenceDiagram
actor U as User
participant TP as TransactionPage
participant ATM as AddTransactionModal
participant TS as transactionService
participant TR as transactionRepository
participant VR as validateTransaction
participant WS as walletService
participant WR as walletRepository
participant SC as supabaseClient
U->>TP : Navigate to Transactions
TP->>TR : getTransactions(userId)
TR->>SC : supabase.from('transactions').select('*')
SC-->>TR : transactions data
TR-->>TP : transactions
TP-->>U : Display transaction list
U->>TP : Click "Add Transaction"
TP->>ATM : Open modal
ATM-->>U : Show form
U->>ATM : Fill form (wallet, category, amount, note, date, type)
U->>ATM : Click Save
ATM->>TS : createTransaction(transaction)
TS->>TS : toPersistedTransaction()
TS->>VR : validateTransaction(data)
VR-->>TS : valid
TS->>TR : addTransaction(transaction)
TR->>SC : supabase.from('transactions').insert()
SC-->>TR : created transaction
TR-->>TS : new transaction
TS->>WS : applyTransactionsToWalletBalances([tx])
WS->>WR : fetchWalletById(walletId)
WR->>SC : supabase.from('wallets').select().eq()
SC-->>WR : wallet record
WR-->>WS : wallet with balance
WS->>WS : calculate new balance
WS->>WR : updateWalletBalance(walletId, newBalance)
WR->>SC : supabase.from('wallets').update()
SC-->>WR : updated wallet
WR-->>WS : success
WS-->>TS : balances updated
TS-->>ATM : transaction created
ATM-->>TP : onTransactionsCreated()
TP->>TR : getTransactions(userId)
TR->>SC : supabase query
SC-->>TR : updated list
TR-->>TP : refreshed transactions
TP->>WR : fetchWallets(userId)
WR->>SC : supabase query
SC-->>WR : updated wallets
WR-->>TP : refreshed wallets
TP-->>U : Updated list displayed
ATM-->>U : Modal closed
```

**Diagram sources**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:232-293](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L232-L293)

**Section sources**
- [src/application/services/transactionService.js:41-62](file://src/application/services/transactionService.js#L41-L62)
- [src/application/services/walletService.js:36-70](file://src/application/services/walletService.js#L36-L70)
- [src/infrastructure/repositories/transactionRepository.js:21-43](file://src/infrastructure/repositories/transactionRepository.js#L21-L43)
- [src/infrastructure/repositories/walletRepository.js:80-94](file://src/infrastructure/repositories/walletRepository.js#L80-L94)

### Sequence Diagram: AI Quick Parse Sequence
This sequence shows AI parsing with provider selection and fallback handling.

```mermaid
sequenceDiagram
actor U as User
participant ATM as AddTransactionModal
participant TIS as transactionIntelligenceService
participant TAR as transactionAiRepository
participant FP as Fallback Parser
participant OP as OpenAI API / Gemini API
U->>ATM : Switch to "AI Quick Parse" tab
U->>ATM : Paste text : <br/>"uong phuc long het 65k, an my cay het 79k"
U->>ATM : Click Parse
ATM->>TIS : parseQuickTransactions({ rawText, categories })
TIS->>TAR : getTransactionAiConfig()
TAR-->>TIS : { provider, model, endpoint, ... }
alt Custom endpoint configured
TIS->>TAR : requestFromCustomEndpoint(endpoint, payload)
TAR->>OP : POST custom endpoint
OP-->>TAR : JSON response
TAR-->>TIS : parsed transactions
else Provider is Gemini
TIS->>TAR : requestFromGemini(payload)
TAR->>OP : POST generativelanguage.googleapis.com
OP-->>TAR : JSON response
TAR-->>TIS : parsed transactions
else Provider is OpenAI (default)
TIS->>TAR : requestFromOpenAI(payload)
TAR->>OP : POST api.openai.com/v1/responses
OP-->>TAR : JSON response
TAR-->>TIS : parsed transactions
end
TIS->>TIS : normalizeAiTransactions()
alt AI returns valid transactions
TIS-->>ATM : { source : 'ai', transactions : [...] }
else AI fails or returns empty
TIS->>FP : parseFallbackTransactions({ rawText, categories })
FP->>FP : Split by delimiters [\n,;]
FP->>FP : parseAmount() with unit normalization
FP->>FP : inferType() from income keywords
FP->>FP : inferCategory() by keyword scoring
FP-->>TIS : fallback transactions
TIS-->>ATM : { source : 'fallback', reason, transactions : [...] }
end
ATM-->>U : Display parsed transactions with confidence scores
U->>ATM : Review and confirm
ATM->>ATM : Save each transaction
ATM-->>U : Success message
```

**Diagram sources**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:297-349](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L297-L349)

**Section sources**
- [src/application/services/transactionIntelligenceService.js:139-179](file://src/application/services/transactionIntelligenceService.js#L139-L179)
- [src/infrastructure/repositories/transactionAiRepository.js:128-145](file://src/infrastructure/repositories/transactionAiRepository.js#L128-L145)
- [src/infrastructure/repositories/transactionAiRepository.js:311-325](file://src/infrastructure/repositories/transactionAiRepository.js#L311-L325)

### Sequence Diagram: Dashboard Data Loading Sequence
This sequence demonstrates parallel data fetching, enrichment, and metric computation.

```mermaid
sequenceDiagram
actor U as User
participant DP as DashboardPage
participant AH as useAuth
participant DS as dashboardService
participant WR as walletRepository
participant TR as transactionRepository
participant BR as budgetRepository
participant TM as transactionMapper
participant SC as supabaseClient
U->>DP : Navigate to Dashboard
DP->>AH : Get current user
AH-->>DP : { user_id, name, email }
DP->>DS : getDashboardData(userId)
par Parallel data fetching
DS->>WR : fetchWallets(userId)
WR->>SC : supabase.from('wallets').select('*').eq()
SC-->>WR : wallet records
WR-->>DS : wallets
and
DS->>TR : getTransactions(userId)
TR->>SC : supabase.from('transactions').select('*, categories(...), wallets(...)')
SC-->>TR : transactions with relations
TR-->>DS : raw transactions
and
DS->>BR : fetchBudgetsByUserId(userId)
BR->>SC : supabase.from('budgets').select('*, categories(...)')
SC-->>BR : budget records
BR-->>DS : budgets
end
DS->>TM : mapTransactionsWithRelations(rawTransactions)
TM-->>DS : enriched transactions with categoryName & walletName
DS->>DS : calculateTotalBalance(wallets)
DS->>DS : sort & slice recentTransactions (top 6)
DS->>DS : filter currentMonthTransactions
DS->>DS : filter previousMonthTransactions
DS->>DS : sumTransactionAmounts(current, 'income')
DS->>DS : sumTransactionAmounts(current, 'expense')
DS->>DS : sumTransactionAmounts(previous, 'income')
DS->>DS : sumTransactionAmounts(previous, 'expense')
DS->>DS : calculateTrendPercent(current, previous)
DS->>DS : buildCategorySpending (top 5)
DS->>DS : calculateBudgetUsage (active budgets & percentage)
DS-->>DP : DashboardData object
DP->>DP : Render SummaryCards with metrics
DP->>DP : Render QuickActions
DP->>DP : Render SpendingChart
DP->>DP : Render RecentTransactions
DP-->>U : Fully loaded Dashboard
```

**Diagram sources**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:353-410](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L353-L410)

**Section sources**
- [src/App.jsx:17-62](file://src/App.jsx#L17-L62)

### Sequence Diagram: Delete Transaction Sequence (with Compensation)
This sequence shows deletion with compensating balance updates and rollback on failure.

```mermaid
sequenceDiagram
actor U as User
participant TP as TransactionPage
participant TS as transactionService
participant TR as transactionRepository
participant WS as walletService
participant WR as walletRepository
participant SC as supabaseClient
U->>TP : Click "Delete" on transaction
TP->>U : Confirm dialog : "Xoa giao dich?"
U->>TP : Confirm deletion
TP->>TS : removeTransaction(transId)
TS->>TR : getTransactionById(transId)
TR->>SC : supabase.from('transactions').select().eq().single()
SC-->>TR : existing transaction
TR-->>TS : transaction data
TS->>WS : applyTransactionsToWalletBalances([reverseEffect(tx)])
Note over TS,WS : Reverse effect : flip income<->expense
WS->>WR : fetchWalletById(walletId)
WR->>SC : supabase query
SC-->>WR : wallet
WR-->>WS : wallet with balance
WS->>WS : calculate reverted balance
WS->>WR : updateWalletBalance(walletId, revertedBalance)
WR->>SC : supabase.from('wallets').update()
SC-->>WR : updated
WR-->>WS : success
WS-->>TS : balance reverted
TS->>TR : deleteTransactionById(transId)
TR->>SC : supabase.from('transactions').delete().eq()
SC-->>TR : deleted
TR-->>TS : success
alt Deletion fails
TS->>WS : applyTransactionsToWalletBalances([originalTx])
WS->>WR : restore original balance
WR->>SC : supabase update
SC-->>WR : restored
WR-->>WS : success
WS-->>TS : balance restored
TS-->>TP : throw error
TP-->>U : Show error message
else Deletion succeeds
TS-->>TP : success
TP->>TP : refresh transactions & wallets
TP-->>U : Show success + updated list
end
```

**Diagram sources**
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:414-468](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L414-L468)

**Section sources**
- [src/application/services/transactionService.js:111-122](file://src/application/services/transactionService.js#L111-L122)
- [src/application/services/walletService.js:36-70](file://src/application/services/walletService.js#L36-L70)
- [src/infrastructure/repositories/transactionRepository.js:59-112](file://src/infrastructure/repositories/transactionRepository.js#L59-L112)
- [src/infrastructure/repositories/walletRepository.js:80-94](file://src/infrastructure/repositories/walletRepository.js#L80-L94)

## Dependency Analysis
The diagrams reveal strong cohesion within layers and controlled coupling:
- Presentation depends on application services and consumes AuthProvider state.
- Application services depend on repositories and domain logic.
- Repositories depend on Supabase client; AI repository depends on external providers.
- Domain logic (rules, mappers, calculations) is reused across services.

```mermaid
graph LR
UI["UI Components"] --> SVC["Application Services"]
SVC --> REPO["Repositories"]
REPO --> DB["Supabase"]
SVC --> DOMAIN["Domain Logic"]
REPO --> AI["AI Providers"]
```

**Diagram sources**
- [TECHNICAL_DOCUMENTATION.md:44-64](file://TECHNICAL_DOCUMENTATION.md#L44-L64)
- [ACTIVITY_AND_SEQUENCE_DIAGRAMS.md:474-516](file://ACTIVITY_AND_SEQUENCE_DIAGRAMS.md#L474-L516)

**Section sources**
- [src/App.jsx:17-62](file://src/App.jsx#L17-L62)
- [src/presentation/context/AuthProvider.jsx:1-84](file://src/presentation/context/AuthProvider.jsx#L1-L84)

## Performance Considerations
- Parallel data fetching: The dashboard sequence demonstrates parallel queries to reduce latency.
- Validation and normalization: Early validation reduces downstream failures and rework.
- Compensating updates: Rollback mechanisms ensure data consistency with minimal user-visible errors.
- External API calls: AI parsing introduces network latency; consider caching or retry strategies at the repository level.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and recovery steps:
- Authentication failures: Verify Supabase credentials and session persistence settings.
- Transaction creation errors: Check validation rules and ensure wallet exists; rely on rollback behavior if balance update fails.
- AI parsing failures: Confirm provider configuration and API keys; fallback parser will still attempt heuristic extraction.
- Dashboard load delays: Ensure parallel queries are executed and consider pagination for large datasets.

**Section sources**
- [src/application/services/transactionService.js:41-62](file://src/application/services/transactionService.js#L41-L62)
- [src/application/services/walletService.js:36-70](file://src/application/services/walletService.js#L36-L70)
- [src/application/services/transactionIntelligenceService.js:139-179](file://src/application/services/transactionIntelligenceService.js#L139-L179)
- [src/infrastructure/repositories/transactionAiRepository.js:128-145](file://src/infrastructure/repositories/transactionAiRepository.js#L128-L145)

## Conclusion
The activity and sequence diagrams provide a comprehensive view of MoneyHey’s core workflows, emphasizing:
- Clear separation of concerns across layers
- Robust error handling and compensation
- Parallel processing for responsiveness
- Seamless integration with Supabase and external AI providers

These diagrams serve as a practical reference for developers and stakeholders to understand and evolve the system effectively.