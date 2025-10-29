# Furever Stripe Connect Dashboard

A comprehensive Next.js application demonstrating Stripe Connect integration for a pet care platform. This project showcases how to build a multi-account payment system with both demo and live account support.

## 🚀 Features

- **Dual Account System**: Choose between demo accounts (instant access) or create live Stripe Connect accounts
- **Complete Dashboard**: Home, Pets, Payments, Payouts, Finances, and Account management pages
- **Real-time Payments**: View payment history with status tracking (Succeeded/Refunded/Disputed)
- **Financial Analytics**: Revenue tracking, balance management, and payout history
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Clean, professional interface with smooth transitions and animations

## 📁 Project Structure

```
frontend-connect/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication group
│   │   └── select-account/       # Account selection page
│   ├── (dashboard)/              # Dashboard group (requires auth)
│   │   ├── home/                 # Dashboard home
│   │   ├── pets/                 # Pet management
│   │   ├── payments/             # Payment history and stats
│   │   ├── payouts/              # Payout management
│   │   ├── finances/             # Financial overview
│   │   ├── account/              # Account settings
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   ├── api/                      # API routes
│   │   ├── account/              # Account management endpoints
│   │   └── stripe/               # Stripe integration endpoints
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page (redirects to select-account)
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── layout/                   # Layout components (Sidebar, Header)
│   ├── account/                  # Account selection components
│   ├── payments/                 # Payment-related components
│   └── ui/                       # Reusable UI components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
├── types/                        # TypeScript type definitions
└── README.md                     # This file
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Payment**: Stripe Connect
- **Icons**: Heroicons
- **State Management**: React hooks + localStorage
- **UI Components**: Custom component library

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Stripe account with Connect capabilities

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file based on `.env.example`:

```bash
# Platform Stripe Keys (to create Connected Accounts)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Demo Connected Account (Type 1)
DEMO_ACCOUNT_ID=acct_xxxxx
DEMO_ACCOUNT_NAME=Furever Demo Account

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How It Works

### Demo Account Flow
1. User clicks "Use Demo Account"
2. App verifies `DEMO_ACCOUNT_ID` from environment
3. Saves account to localStorage as type `'demo'`
4. Redirects to dashboard with demo data
5. Shows "⚡ Demo Mode" badge

### Live Account Flow
1. User fills email + business name
2. API creates Express account using platform keys
3. Returns Stripe onboarding URL
4. User completes Stripe onboarding
5. Account saved as type `'live'`
6. Shows "✓ Live Account" badge

## 📊 Pages Overview

### 🏠 Home Dashboard
- Account status overview
- Quick actions and navigation
- Account type indicator

### 💳 Payments
- Month-to-date statistics with charts
- Payment history table
- Filter by status (All/Disputes)
- Export functionality

### 🐾 Pets Management
- Pet listings and services
- Booking management
- Revenue tracking from pet services

### 💰 Payouts
- Available and pending balance
- Payout history
- Bank account management

### 📈 Finances
- Comprehensive financial analytics
- Revenue trends and charts
- Payment method breakdown
- Export reports

### ⚙️ Account Settings
- Account information and status
- Onboarding completion
- Notification preferences
- Security settings

## 🎨 UI Components

### Layout Components
- **Sidebar**: Navigation with active state and account badge
- **Header**: Page title and account type indicator
- **AccountBadge**: Shows demo/live status with switch option

### Payment Components
- **PaymentStats**: Statistics cards with mini charts
- **PaymentTable**: Sortable payment history with status badges
- **StatusBadge**: Color-coded status indicators

### Account Components
- **AccountSelector**: Choose between demo and live accounts
- **DemoAccountCard**: Demo account selection card
- **CreateAccountCard**: Live account creation form

## 🎯 Key Features Implemented

✅ **Account Management**: Demo vs Live account selection
✅ **Sidebar Navigation**: Complete navigation system
✅ **Payment Dashboard**: Real payment integration with stats
✅ **Status Tracking**: Succeeded/Refunded/Disputed payments
✅ **Account Switching**: Easy account type switching
✅ **Responsive Design**: Mobile-friendly interface
✅ **TypeScript**: Full type safety
✅ **Clean Architecture**: Well-organized codebase
✅ **Error Handling**: Comprehensive error states
✅ **Loading States**: Smooth user experience
✅ **Demo Data**: Sample data for testing

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

```bash
npm run build
npm start
```

---

Built with ❤️ for demonstrating modern payment platform development
