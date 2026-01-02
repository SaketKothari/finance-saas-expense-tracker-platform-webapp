<div align="center">
 <h1>💰 Finance SaaS Platform</h1>
 <p><strong>A comprehensive expense tracker and financial management platform</strong></p>
  
 [![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://finance-sass-expense-tracker-platform.vercel.app)
 [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
 [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
 [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
</div>

<br />

<div align="center">
 <img src="https://github.com/user-attachments/assets/1d9af6d6-07fb-47ab-baf6-5b7b551b26c2" alt="Finance SaaS Platform Dashboard" />
</div>

<br />

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Overview

Finance SaaS Platform is a modern, full-stack financial management application built with Next.js 14. It helps users track income and expenses, categorize transactions, connect bank accounts via Plaid, and gain insights through interactive dashboards and charts. The platform features a premium subscription model powered by Lemon Squeezy and secure authentication via Clerk.

## ✨ Key Features

### 📊 Dashboard & Visualization

- **Interactive Financial Dashboard** - Visualize income, expenses, and account balances with customizable charts
- **Multiple Chart Types** - Switch between area, bar, line, pie, radar, and radial charts
- **Custom Tooltips** - Detailed information on hover with category breakdowns
- **Real-time Updates** - Data refreshes automatically using React Query

### 💳 Transaction Management

- **Transaction Table** - Comprehensive view with sorting, filtering, and pagination
- **Bulk Operations** - Delete multiple transactions at once
- **Advanced Search** - Find transactions quickly by amount, category, or account
- **CSV Import** - Import transactions from spreadsheets with validation
- **Manual Entry** - Add transactions via intuitive forms

### 🏦 Account & Category Management

- **Multiple Accounts** - Track checking, savings, credit cards, and more
- **Custom Categories** - Create and manage expense/income categories
- **Account Filtering** - View transactions by specific accounts
- **Date Range Filters** - Analyze transactions across custom time periods

### 🔗 Banking Integration

- **Plaid Integration** - Securely connect real bank accounts
- **Automatic Syncing** - Import transactions directly from your bank
- **Bank Disconnection** - Manage connected institutions easily

### 💎 Premium Features

- **Subscription Management** - Monetized via Lemon Squeezy
- **Premium Upgrades** - Unlock advanced features and analytics
- **Subscription Control** - Manage billing and subscription status

### 🔐 Security & Authentication

- **Clerk Authentication** - Secure user authentication with Clerk Core 2
- **Protected Routes** - Dashboard and settings are auth-protected
- **User Settings** - Customize profile and preferences

## 🛠 Tech Stack

### Frontend

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautifully designed components
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[React Hook Form](https://react-hook-form.com/)** - Performant form validation
- **[Tanstack React Query](https://tanstack.com/query/latest)** - Data synchronization & caching
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management

### Backend

- **[Hono.js](https://hono.dev/)** - Fast, lightweight web framework
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database via Neon
- **[Zod](https://zod.dev/)** - Schema validation

### Authentication & Payments

- **[Clerk](https://clerk.com/)** - User authentication & management
- **[Plaid](https://plaid.com/)** - Banking data integration
- **[Lemon Squeezy](https://www.lemonsqueezy.com/)** - Payment processing & subscriptions

### Deployment & DevTools

- **[Vercel](https://vercel.com/)** - Hosting & deployment platform
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime & package manager

<div align="center">
 <img src="https://github.com/user-attachments/assets/efc5e8ea-9e53-4438-af85-7469c0ae9362" alt="Finance Platform Features" />
</div>


## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ or **Bun** runtime
- **PostgreSQL** database (or use [Neon](https://neon.tech/) for serverless Postgres)
- **Git** for version control

### Installation

1. **Clone the repository**

  ```bash
  git clone https://github.com/SaketKothari/finance-saas-expense-tracker-platform-webapp.git
  cd finance-saas-expense-tracker-platform-webapp
  ```

2. **Install dependencies**

  ```bash
  npm install
  # or
  yarn install
  # or
  pnpm install
  # or
  bun install
  ```

3. **Set up environment variables**

  Create a `.env.local` file in the root directory and add your environment variables (see [Environment Variables](#-environment-variables) section)

4. **Set up the database**

  ```bash
  # Generate database migrations
  npm run db:generate

  # Run migrations
  npm run db:migrate

  # (Optional) Seed the database with sample data
  npm run db:seed
  ```

5. **Run the development server**

  ```bash
  npm run dev
  # or
  yarn dev
  # or
  pnpm dev
  # or
  bun dev
  ```

6. **Open the application**

  Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Database commands
npm run db:generate    # Generate migrations from schema
npm run db:migrate     # Run migrations
npm run db:studio      # Open Drizzle Studio
npm run db:seed        # Seed database with sample data
```

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Plaid
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
NEXT_PUBLIC_PLAID_ENV=sandbox # or development/production

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_api_key
NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting API Keys

- **Database**: Sign up for [Neon](https://neon.tech/) or use your own PostgreSQL instance
- **Clerk**: Create an account at [clerk.com](https://clerk.com/)
- **Plaid**: Sign up at [plaid.com](https://plaid.com/) and get sandbox credentials
- **Lemon Squeezy**: Register at [lemonsqueezy.com](https://www.lemonsqueezy.com/)

## 💾 Database Setup

This project uses PostgreSQL with Drizzle ORM. The schema includes:

- **Users** - User account information (managed by Clerk)
- **Accounts** - Financial accounts (checking, savings, etc.)
- **Categories** - Transaction categories
- **Transactions** - Income and expense records
- **Subscriptions** - Premium subscription data

### Schema Management

```bash
# Generate migrations after schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio for visual database management
npm run db:studio
```

## 📁 Project Structure

```
finance-saas-expense-tracker-platform-webapp/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── accounts/          # Account management
│   │   ├── categories/        # Category management
│   │   ├── settings/          # User settings
│   │   └── transactions/      # Transaction management
│   ├── api/                   # API routes (Hono.js)
│   │   └── [[...route]]/
│   ├── globals.css
│   └── layout.tsx
├── components/                 # React components
│   ├── ui/                    # Shadcn/ui components
│   ├── charts/                # Chart components
│   ├── filters/               # Filter components
│   └── ...
├── features/                   # Feature-based modules
│   ├── accounts/
│   │   ├── api/               # React Query hooks
│   │   ├── components/        # Feature components
│   │   └── hooks/             # Custom hooks
│   ├── categories/
│   ├── transactions/
│   ├── plaid/
│   └── subscriptions/
├── db/                         # Database configuration
│   ├── schema.ts              # Drizzle schema
│   └── drizzle.ts             # Database client
├── lib/                        # Utility libraries
├── hooks/                      # Shared hooks
└── providers/                  # Context providers
```

## 📡 API Documentation

The API is built with Hono.js and follows RESTful conventions.

### Endpoints

#### Accounts

- `GET /api/accounts` - List all accounts
- `GET /api/accounts/:id` - Get single account
- `POST /api/accounts` - Create account
- `PATCH /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account
- `POST /api/accounts/bulk-delete` - Bulk delete accounts

#### Categories

- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `POST /api/categories/bulk-delete` - Bulk delete categories

#### Transactions

- `GET /api/transactions` - List transactions (with filters)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/bulk-delete` - Bulk delete transactions
- `POST /api/transactions/bulk-create` - Import CSV transactions

#### Plaid

- `POST /api/plaid/create-link-token` - Create Plaid Link token
- `POST /api/plaid/exchange-public-token` - Exchange public token
- `POST /api/plaid/sync-transactions` - Sync bank transactions

#### Summary

- `GET /api/summary` - Get financial summary with analytics

#### Subscriptions

- `GET /api/subscriptions` - Get current subscription
- `POST /api/subscriptions/checkout` - Create checkout session
- `POST /api/subscriptions/webhook` - Handle Lemon Squeezy webhooks

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

2. **Clone your fork**

  ```bash
  git clone https://github.com/YOUR_USERNAME/finance-saas-expense-tracker-platform-webapp.git
  cd finance-saas-expense-tracker-platform-webapp
  ```

3. **Create a feature branch**

  ```bash
  git checkout -b feature/amazing-feature
  ```

4. **Make your changes**

  - Write clean, maintainable code
  - Follow the existing code style
  - Add tests if applicable
  - Update documentation as needed

5. **Commit your changes**

  ```bash
  git commit -m "feat: add amazing feature"
  ```

  Use conventional commits:

  - `feat:` - New feature
  - `fix:` - Bug fix
  - `docs:` - Documentation changes
  - `style:` - Code style changes (formatting, etc.)
  - `refactor:` - Code refactoring
  - `test:` - Adding tests
  - `chore:` - Maintenance tasks

6. **Push to your fork**

  ```bash
  git push origin feature/amazing-feature
  ```

7. **Open a Pull Request**
  - Provide a clear description of your changes
  - Reference any related issues
  - Wait for review and address feedback

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Shadcn](https://ui.shadcn.com/) for the beautiful UI components
- [Clerk](https://clerk.com/) for authentication
- [Plaid](https://plaid.com/) for banking integration
- [Lemon Squeezy](https://www.lemonsqueezy.com/) for payment processing

## 📞 Support

If you have any questions or need help, please:

- Open an [issue](https://github.com/SaketKothari/finance-saas-expense-tracker-platform-webapp/issues)
- Check the [documentation](https://github.com/SaketKothari/finance-saas-expense-tracker-platform-webapp/wiki)

---

<div align="center">
 <p>Built with ❤️ by <a href="https://github.com/SaketKothari">Saket Kothari</a></p>
 <p>⭐ Star this repo if you find it helpful!</p>
</div>

