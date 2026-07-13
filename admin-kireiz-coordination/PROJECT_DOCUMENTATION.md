# Kireiz Admin Coordination — Project Documentation

> **App Name:** Kireiz  
> **Version:** 1.2.1  
> **Framework:** Next.js 15.3.1 (App Router)  
> **Port:** 7002  
> **Generated:** 2026-02-17

---

## 1. Project Overview

**Kireiz Admin Coordination** is a full-featured **admin dashboard and uniform coordination platform** built with Next.js 15 (App Router). It serves as the admin panel for managing uniform-related business operations including:

- **Product & specification management** (fabrics, parts, colors, templates, products)
- **Content & media management** (categories, catalog images, blogs, FAQs, PDF templates)
- **Customer management** (B2B accounts, quotation history, sales representation, assignments, permissions)
- **Pricing management** (quotation templates, unit pricing, special conditions, PDF templates)
- **Simulation configuration** (PDF templates, exports)
- **User profile & settings** (personal info, change password, linked orders/quotes, notification settings, simulation history)
- **Analytics dashboard** with charts and statistics
- **Landing/admin homepage** with hero section, dashboard stats, charts, quick actions, and alerts
- **38+ reusable UI components** (buttons, tables, modals, forms, charts, etc.)
- **Internationalization (i18n)** — supports English, Arabic, Spanish, and Chinese
- **Dark mode / Light mode** with multiple layout options
- **Authentication** via NextAuth.js v5 (credentials, Google, GitHub)

---

## 2. Tech Stack

| Layer              | Technology                                                       |
| ------------------ | ---------------------------------------------------------------- |
| **Framework**      | Next.js 15.3.1 (App Router)                                      |
| **UI Library**     | React 19                                                         |
| **Styling**        | Tailwind CSS v4 + PostCSS + `tailwind-merge`                     |
| **Authentication** | NextAuth.js v5 (beta) — Credentials, Google OAuth, GitHub OAuth  |
| **State Mgmt**     | Zustand v5, Valtio v2                                            |
| **Data Fetching**  | Axios (custom base), SWR v2                                      |
| **Forms**          | React Hook Form + Zod validation + `@hookform/resolvers`         |
| **Charts**         | ApexCharts (`react-apexcharts`)                                  |
| **Tables**         | TanStack React Table v8                                          |
| **Animations**     | Framer Motion v11                                                |
| **3D Rendering**   | Three.js + React Three Fiber + Drei                              |
| **Rich Text**      | TipTap Editor                                                    |
| **Calendar**       | FullCalendar v6                                                  |
| **Drag & Drop**    | `@hello-pangea/dnd`                                              |
| **i18n**           | `next-intl` v4                                                   |
| **Icons**          | `react-icons` v5                                                 |
| **Date Handling**  | Day.js                                                           |
| **Maps**           | `react-simple-maps`                                              |
| **Typography**     | Inter (primary), system font stack                               |
| **Deployment**     | PM2 (`ecosystem.config.js`), GCP-ready build script              |
|---------------------------------------------------------------------------------------|
    
---

## 3. Folder Structure

```
admin-kireiz-coordination/
├── public/                          # Static assets
│   ├── img/                         # Images (140 files)
│   └── data/                        # Static data files
├── messages/                        # i18n translation files
│   ├── en.json                      # English
│   ├── ar.json                      # Arabic
│   ├── es.json                      # Spanish
│   └── zh.json                      # Chinese
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── layout.jsx               # Root layout (Auth, Theme, Locale, Navigation providers)
│   │   ├── page.jsx                 # Root page (redirects to /kireiz-form)
│   │   ├── not-found.jsx            # 404 page
│   │   ├── (auth-pages)/            # Authentication pages (sign-in, sign-up, forgot/reset password)
│   │   ├── (protected-pages)/       # Authenticated pages (dashboards, UI components, auth demos)
│   │   ├── (public-pages)/          # Public pages (admin-form, products, contents, pricing, etc.)
│   │   └── api/                     # API route handlers (14 modules)
│   ├── assets/                      # Static assets
│   │   ├── styles/                  # Global CSS styles
│   │   ├── svg/                     # SVG icon components
│   │   ├── maps/                    # Map data files
│   │   └── markdown/                # Markdown documentation files
│   ├── auth.js                      # NextAuth.js configuration export
│   ├── middleware.js                 # Next.js route middleware (auth guards)
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # 42 base UI components (Button, Table, Modal, etc.)
│   │   ├── shared/                  # Shared components (DataTable, Chart, RichTextEditor, etc.)
│   │   ├── template/                # Template components (Header, Footer, SideNav, etc.)
│   │   ├── layouts/                 # Layout wrappers (AuthLayout, PostLoginLayout)
│   │   ├── auth/                    # Auth form components (SignIn, SignUp, etc.)
│   │   ├── view/                    # View components (OrderForm, CustomerForm, etc.)
│   │   └── docs/                    # Documentation components
│   ├── configs/                     # App configuration
│   │   ├── app.config.js            # API prefix, entry paths, locale settings
│   │   ├── auth.config.js           # NextAuth providers & callbacks
│   │   ├── firebase.config.js       # Firebase configuration
│   │   ├── chart.config.js          # Chart default configurations
│   │   ├── theme.config.js          # Theme defaults
│   │   ├── navigation.config/      # Sidebar navigation tree configs (7 files)
│   │   └── routes.config/          # Route definitions (protected, public, auth)
│   ├── constants/                   # App-wide constants
│   │   ├── app.constant.js          # APP_NAME ("Kireiz"), cookie keys
│   │   ├── theme.constant.js        # Layout types, dimensions, modes
│   │   ├── roles.constant.js        # ADMIN, USER roles
│   │   └── route.constant.js        # Route path constants
│   ├── services/                    # API service layer
│   │   ├── axios/                   # Axios base instance + interceptors
│   │   ├── ApiService.js            # Generic fetch wrapper
│   │   ├── AuthService.js           # Sign-up, forgot/reset password APIs
│   │   ├── ProductService.js        # Product CRUD APIs
│   │   ├── CustomersService.js      # Customer APIs
│   │   ├── AccontsService.js        # Settings/profile APIs
│   │   ├── AiService.js             # AI chat & image generation APIs
│   │   ├── ChatService.js           # Chat/conversation APIs
│   │   ├── CommonService.js         # Notifications, search APIs
│   │   └── ProjectService.js        # Scrum board, project APIs
│   ├── server/                      # Server-side actions
│   │   └── actions/                 # Next.js server actions (29 action files)
│   ├── mock/                        # Mock data for development
│   │   └── data/                    # 15 mock data files (accounts, chat, dashboard, etc.)
│   ├── utils/                       # Utility functions
│   │   ├── hooks/                   # 16 custom React hooks
│   │   ├── hoc/                     # Higher-order components
│   │   └── *.js                     # Helper functions (sort, paginate, classNames, etc.)
│   └── i18n/                        # i18n configuration
│       ├── request.js               # Locale request handler
│       └── dateLocales.js           # Date locale mappings
├── ecosystem.config.js              # PM2 deployment config
├── tailwind.config.js               # Tailwind CSS configuration
├── next.config.mjs                  # Next.js configuration
└── package.json                     # Dependencies & scripts
```

---

## 4. Routing Architecture

The app uses Next.js **App Router** with three route groups:

### 4.1 `(auth-pages)` — Authentication Routes
| Route               | Description             |
| -------------------- | ----------------------- |
| `/sign-in`           | Sign in page            |
| `/sign-up`           | Sign up page            |
| `/forgot-password`   | Forgot password page    |
| `/reset-password`    | Reset password page     |

Uses `AuthLayout` (Side/Split/Simple variants).

### 4.2 `(protected-pages)` — Authenticated Routes
Wrapped in `PostLoginLayout` which supports **6 layout variants**:
- Collapsible Side
- Stacked Side
- Top Bar Classic
- Frameless Side
- Content Overlay
- Blank

| Route Group             | Description                          |
| ----------------------- | ------------------------------------ |
| `/dashboards/analytic`  | Analytics dashboard                  |
| `/dashboards/profile/*` | User profile section (6 sub-pages)   |
| `/ui-components/*`      | 38 UI component demo/showcase pages  |
| `/auth/*`               | 15 auth layout demo variants         |

**Profile Sub-pages:**
- `personal-information` — Edit personal details
- `change-password` — Change password form
- `linked-order` — Linked orders & quotes
- `notification-setting` — Notification preferences
- `simulation-history` — Simulation history table
- `settings` — Full settings hub (all above combined with side menu)

### 4.3 `(public-pages)` — Public Routes (No Auth Required)
| Route                        | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `/admin-form` (→ `/kireiz-form`) | **Main landing/admin homepage** — hero, stats, charts, alerts |
| `/products`                  | Product & Specification Management (5 tabs)       |
| `/contents`                  | Content & Media Management (5 tabs)               |
| `/pricing`                   | Pricing Management (4 tabs)                       |
| `/customer`                  | Customer Management (5 tabs)                      |
| `/simulation-configuration`  | Simulation Configuration (2 tabs)                 |
| `/header`                    | Shared navigation header                          |

### 4.4 API Routes (`/api/`)
14 API route modules:
`ai`, `auth`, `contacts`, `conversations`, `customers`, `files`, `helps`, `logs`, `md`, `notifications`, `products`, `projects`, `search`, `setting`

---

## 5. Authentication

### Stack
- **NextAuth.js v5** (beta) with `next-auth`
- Three providers: **Credentials**, **Google OAuth**, **GitHub OAuth**

### Flow
1. `src/auth.js` — Exports `auth`, `signIn`, `signOut`, `handlers` from NextAuth
2. `src/middleware.js` — Route-level auth guards:
   - API auth routes → skip middleware
   - Auth routes (sign-in, etc.) → redirect to app if already signed in
   - Protected routes → redirect to sign-in if not authenticated
3. `src/configs/auth.config.js` — Provider setup + session callbacks (adds `authority` & `id` to session)
4. `src/server/actions/auth/` — Server actions for `handleSignIn`, `handleOauthSignIn`, credential validation

### Roles
- `ADMIN` and `USER` (defined in `roles.constant.js`)
- Authority array set in session callback: `['admin', 'user']`

---

## 6. State Management

| Tool       | Purpose                                     |
| ---------- | ------------------------------------------- |
| **Zustand** | Theme state (mode, layout, schema, direction) |
| **Valtio**  | Proxy-based reactive state where needed      |
| **SWR**     | Data fetching with caching & revalidation    |

The `useTheme` hook (Zustand store) manages:
- `mode` — light/dark
- `layout.type` — one of 6 layout types
- `themeSchema` — color scheme
- `direction` — LTR/RTL

---

## 7. Services Layer

All API calls go through a centralized **Axios-based service layer**:

```
AxiosBase (axios instance)
  ├── baseURL: NEXT_PUBLIC_API_BASE_URL + "/api"
  ├── timeout: 60 seconds
  ├── withCredentials: true
  ├── Request interceptor (AxiosRequestIntrceptorConfigCallback)
  └── Response interceptor (AxiosResponseIntrceptorErrorCallback)
        ↓
ApiService.fetchDataWithAxios(config)
        ↓
Domain Services (AuthService, ProductService, CustomersService, etc.)
```

### Service Modules
| Service             | Endpoints                                     |
| ------------------- | --------------------------------------------- |
| `AuthService`       | sign-up, forgot-password, reset-password      |
| `ProductService`    | GET /products, GET /products/:id              |
| `CustomersService`  | GET /customers, GET /customers/log            |
| `AccontsService`    | GET /setting/profile, notification, billing, integration |
| `AiService`         | POST /ai/chat, GET /ai/chat/history, images   |
| `ChatService`       | GET /conversations/:id, GET /contacts         |
| `CommonService`     | GET /notifications, GET /search               |
| `ProjectService`    | GET /projects/scrum-board, GET /projects/:id   |
| `HelpCenterService` | Help center articles                          |
| `FileService`       | File management                               |
| `LogService`        | Activity logs                                 |

---

## 8. UI Component Library

The app includes a **custom UI component library** (`src/components/ui/`) with **42 components**:

### Base Components
`Alert`, `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `CloseButton`, `ConfigProvider`, `Dialog`, `Drawer`, `Input`, `InputGroup`, `Notification`, `Radio`, `ScrollBar`, `Segment`, `Select`, `Skeleton`, `Slider`, `Spinner`, `StatusIcon`, `Steps`, `Switcher`, `Tag`, `Tooltip`, `Upload`

### Data Display
`Calendar`, `RangeCalendar`, `DatePicker`, `Table`, `Tabs`, `Timeline`, `Pagination`, `Progress`

### Navigation
`Dropdown` (with sub-components), `Menu` (with sub-components), `MenuItem`

### Form
`Form` (with Item, validation integration)

### Feedback
`toast` (notification toasts)

### Shared Higher-Level Components (`src/components/shared/`)
`DataTable`, `Chart`, `RichTextEditor`, `CalendarView`, `GanttChart`, `RegionMap`, `AutoComplete`, `ConfirmDialog`, `ImageGallery`, `OtpInput`, `PasswordInput`, `Loading`, `StickyFooter`, `Masonry`, and more.

---

## 9. Theme System

### Modes
- **Light** (`light` class on `<html>`)
- **Dark** (`dark` class on `<html>`)

### Layout Types
| Constant               | Layout Style       |
| ---------------------- | ------------------ |
| `LAYOUT_COLLAPSIBLE_SIDE` | Collapsible sidebar |
| `LAYOUT_STACKED_SIDE`     | Stacked sidebar    |
| `LAYOUT_TOP_BAR_CLASSIC`  | Top navigation bar |
| `LAYOUT_FRAMELESS_SIDE`   | Frameless sidebar  |
| `LAYOUT_CONTENT_OVERLAY`  | Content overlay    |
| `LAYOUT_BLANK`            | No chrome/blank    |

### Direction
- LTR (Left-to-Right)  
- RTL (Right-to-Left) — for Arabic support

### Color Tokens (CSS Variables)
`--primary`, `--primary-deep`, `--primary-mild`, `--primary-subtle`, `--error`, `--success`, `--info`, `--warning`, `--neutral`, `--gray-50` through `--gray-950`

---

## 10. Internationalization (i18n)

- **Library:** `next-intl` v4
- **Supported Locales:** English (`en`), Arabic (`ar`), Spanish (`es`), Chinese (`zh`)
- **Translation files:** `messages/*.json`
- **Server-side:** Locale resolved via `getLocale()` and `getMessages()` in root layout
- **Client-side:** `useTranslation` hook, `LocaleProvider` wraps the app
- **Active translation:** Configurable via `appConfig.activeNavTranslation`

---

## 11. Server Actions

Located in `src/server/actions/`, these Next.js server actions handle server-side logic:

| Category          | Actions                                                    |
| ----------------- | ---------------------------------------------------------- |
| **Auth**          | `handleSignIn`, `handleOauthSignIn`, `validateCredential`, `handleSignUp`, `handleSignOut` |
| **Navigation**    | `getNavigation` — fetches sidebar navigation tree         |
| **Theme**         | `getTheme` — retrieves theme settings from cookies        |
| **Locale**        | `locale.js` — locale management                          |
| **Dashboard**     | `getAnalyticDashboard`, `getEcommerceDashboard`, `getProjectDashboard`, `getMarketingDashboard` |
| **Products**      | `getProducts`, `getProduct`                               |
| **Orders**        | `getOrderList`, `getOrderDetails`                         |
| **Customers**     | `getCustomers`, `getCustomer`                             |
| **Content**       | `getArticle`, `getArticleCategories`, `getManageArticle`  |
| **Projects**      | `getProjects`, `getScrumboardData`, `getScrumboardMembers`|
| **Chat**          | `getChatList`, `getChatHistory`                           |
| **Mail**          | `getMail`, `getMailList`                                  |
| **Settings**      | `getRolesPermissionsRoles`, `getRolesPermissionsUsers`    |
| **Other**         | `getPricingPlans`, `getCalendar`, `getTasks`, `getTask`, `getLogs` |

---

## 12. Custom Hooks

Located in `src/utils/hooks/`:

| Hook                    | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `useTheme`              | Zustand theme store (mode, layout, schema)     |
| `useCurrentSession`     | Access current auth session                    |
| `useAuthority`          | Role-based access control check                |
| `useLayout`             | Get current layout type                        |
| `useLayoutGap`          | Calculate layout spacing                       |
| `useMenuActive`         | Track active menu item in navigation           |
| `useNavigation`         | Access navigation tree context                 |
| `useResponsive`         | Responsive breakpoint detection                |
| `useDebounce`           | Debounced value                                |
| `useInfiniteScroll`     | Infinite scroll pagination                     |
| `useInterval`           | setInterval hook                               |
| `useScrollTop`          | Scroll position tracking                       |
| `useRandomBgColor`      | Random background color generator              |
| `useTimeOutMessage`     | Auto-dismissing messages                       |
| `useTranslation`        | i18n translation access                        |
| `useAppendQueryParams`  | URL query parameter management                 |

---

## 13. Public Pages Detail

### Admin Homepage (`/kireiz-form`)
The main landing page includes:
- **Header** with navigation, auth buttons, and dark mode toggle
- **Hero section** with promotional content
- **Dashboard stats** cards
- **Charts:** Most Used Industries (pie), Quotation Requests (bar)
- **Quick Actions** card and **Quotations by Status** chart
- **Active Alerts** section

### Products Page (`/products`)
Tabbed interface managing:
- **Fabrics** — fabric materials
- **Parts** — uniform parts/components
- **Colors** — color palette management
- **Templates** — design templates
- **Products** — product catalog (with Add/Edit modal)

### Contents Page (`/contents`)
Tabbed interface managing:
- **Categories** — content categories
- **Catalog Images** — image management
- **Blog** — blog post management
- **FAQ** — frequently asked questions
- **PDF Templates** — PDF template management

### Pricing Page (`/pricing`)
- **Quotation Template** — quote templates
- **Unit Price** — pricing rules
- **Special Conditions** — conditional pricing
- **PDF Templates** — pricing document templates

### Customer Page (`/customer`)
- **B2B Accounts** — business accounts
- **Quotation History** — past quotes
- **Sales Representation** — sales rep assignments
- **Assignments** — task assignments
- **Permission** — access control

### Simulation Configuration (`/simulation-configuration`)
- **PDF Templates** — simulation document templates
- **Exports** — data export settings

---

## 14. Mock Data

The app includes comprehensive mock data for development (`src/mock/data/`):

`accountsData`, `aiData`, `authData`, `calendarData`, `chatData`, `commonData`, `dashboardData`, `filesData`, `helpCenterData`, `logData`, `mailData`, `ordersData`, `productData`, `projectsData`, `usersData`

---

## 15. Scripts & Deployment

### NPM Scripts
```bash
npm run dev          # Start dev server on port 7002 (accessible on 0.0.0.0)
npm run build        # Production build
npm run gcp-build    # GCP build with 8GB memory limit
npm run start        # Start production server on port 7002
npm run lint         # ESLint
npm run prettier     # Check formatting
npm run prettier:fix # Auto-fix formatting
```

### PM2 Deployment (`ecosystem.config.js`)
```js
{
  name: "uniform-kireiz-coordination",
  script: "npm",
  args: "run start",
  cwd: "/root/uniform-coordination/uniform-kireiz-coordination",
  watch: true,
  env: { NODE_ENV: "production", PORT: 7002 }
}
```

### Environment Variables Required
```
NEXT_PUBLIC_API_BASE_URL        # Backend API base URL
GITHUB_AUTH_CLIENT_ID           # GitHub OAuth client ID
GITHUB_AUTH_CLIENT_SECRET       # GitHub OAuth client secret
GOOGLE_AUTH_CLIENT_ID           # Google OAuth client ID
GOOGLE_AUTH_CLIENT_SECRET       # Google OAuth client secret
NEXT_PUBLIC_FIREBASE_API_KEY    # Firebase API key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
AUTH_SECRET                     # NextAuth secret
```

---

## 16. Key Design Patterns

1. **Route Groups** — `(auth-pages)`, `(protected-pages)`, `(public-pages)` for clean separation
2. **Server Components + Client Components** — Root layout is a server component; interactive pages use `'use client'`
3. **Server Actions** — Data fetching via Next.js server actions in `src/server/actions/`
4. **Service Layer Abstraction** — All API calls go through `ApiService` → `AxiosBase`
5. **Component-Driven Architecture** — 42 base UI components + shared high-level components
6. **Theme-Driven Layouts** — 6 interchangeable layout types controlled via Zustand
7. **Tab-based Page Pattern** — Admin pages use a consistent tab-switching pattern (useState + switch)
8. **Middleware Auth Guards** — Centralized route protection in `middleware.js`
9. **CSS Variable Theming** — Colors defined as CSS variables, referenced in Tailwind config
10. **Mock-First Development** — Comprehensive mock data allows frontend development independent of backend

---

*End of Documentation*
