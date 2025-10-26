# Panem Express Web Booking Portal

## Overview

Panem Express is a full-stack web-based rail booking portal similar to IRCTC, designed for booking train tickets without online payment. Users select routes, choose seats from an interactive seat map, and receive PNR codes for payment at the station. The application features user authentication, real-time seat availability tracking, fare calculation with age-based discounts, booking management, and email confirmations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React with TypeScript** - Type-safe component development with JSX/TSX
- **Vite** - Fast build tool and development server with HMR (Hot Module Replacement)
- **Wouter** - Lightweight client-side routing library
- **TanStack Query** - Server state management, caching, and data fetching

**Rationale**: React provides a component-based architecture suitable for the multi-step booking flow. Vite offers superior build performance compared to traditional bundlers. Wouter is chosen over React Router for its minimal footprint. TanStack Query eliminates manual cache management and provides automatic background refetching.

**UI Component System**
- **shadcn/ui** - Customizable component library built on Radix UI primitives
- **Tailwind CSS** - Utility-first styling with custom design tokens
- **Radix UI** - Unstyled, accessible component primitives
- **React Hook Form + Zod** - Form state management with schema validation

**Rationale**: shadcn/ui provides copy-paste components that can be customized, avoiding vendor lock-in. Radix UI ensures accessibility compliance (ARIA patterns, keyboard navigation). Tailwind enables rapid styling iteration. React Hook Form minimizes re-renders, and Zod provides runtime type safety for form validation.

**Design System**
- Material Design-inspired aesthetic with booking platform patterns (IRCTC, Trainline)
- Typography: Inter for UI elements, Roboto for body text
- Spacing system based on Tailwind units (2, 4, 6, 8, 12, 16, 20, 24)
- Custom CSS variables for theming (light/dark mode support)

**Rationale**: Booking systems require clarity over visual flair. The design prioritizes information hierarchy, predictable patterns, and trust-building through professional presentation.

### Backend Architecture

**Server Framework**
- **Express.js** - Node.js web framework for REST API
- **TypeScript with ESM** - Type-safe backend with modern ES modules
- **Session-based authentication** - Server-side sessions stored in PostgreSQL using connect-pg-simple
- **bcrypt** - Password hashing for security

**Rationale**: Express provides a minimal, unopinionated framework suitable for REST APIs. Session-based auth avoids JWT complexity and token management. PostgreSQL-backed sessions ensure session persistence across server restarts. bcrypt provides industry-standard password hashing with configurable work factors.

**API Design Pattern**
- RESTful endpoints following resource-oriented design
- Session middleware for authentication state
- Centralized error handling
- Request/response logging with timestamps

**Authentication Flow**
1. User registers with username, email, and password
2. Password hashed with bcrypt (10 salt rounds)
3. Session created and stored in PostgreSQL
4. Session cookie sent to client (httpOnly, secure in production, 30-day expiry)
5. Subsequent requests authenticated via session cookie

**Business Logic**
- **Seat availability tracking**: Query bookings by route, date, and coach to determine occupied seats
- **Fare calculation**: `fare = distance × class_rate_per_km × (age >= 60 ? 0.8 : 1.0)`
- **Age validation**: Minimum age 7, maximum age 125
- **PNR generation**: 10-character unique identifier using nanoid
- **Booking status**: "confirmed" by default, "cancelled" after cancellation

### Data Storage

**Database**
- **PostgreSQL** via Neon serverless (connection pooling)
- **Drizzle ORM** - Type-safe SQL query builder with schema inference
- **Schema-first design** - Database schema defined in TypeScript, migrations generated

**Database Schema**

**Users Table**
- `id`: UUID primary key (auto-generated)
- `username`: Unique text field
- `email`: Unique text field (Gmail address)
- `password`: Hashed password text
- `createdAt`: Timestamp

**Routes Table**
- `id`: UUID primary key
- `name`: Route display name
- `fromStation`: Origin station text
- `toStation`: Destination station text
- `distanceKm`: Integer distance

**Bookings Table**
- `id`: UUID primary key
- `userId`: Foreign key to users (cascade delete)
- `routeId`: Foreign key to routes (cascade delete)
- `travelDate`: Date field
- `coach`: Coach class text (Business, 1st Class, Economy, 2nd Class, Non A/C)
- `row`: Integer (1-5)
- `column`: Integer (1-4)
- `passengerName`: Text
- `passengerAge`: Integer
- `fare`: Decimal(10,2)
- `pnr`: Unique text identifier
- `status`: Text ("confirmed" or "cancelled")
- `createdAt`: Timestamp

**Rationale**: PostgreSQL provides ACID guarantees essential for booking systems (preventing double-booking race conditions). Drizzle ORM generates types from schema, ensuring type safety between database and application code. UUID primary keys avoid enumeration attacks. Foreign key cascade deletes maintain referential integrity.

**Seat Map Structure**
- 5 coaches per route/date combination
- 5 rows × 4 columns (20 seats) per coach
- Each coach corresponds to a class with different per-km rates
- Seats identified by coach, row (1-5), and column (1-4)

### External Dependencies

**Email Service**
- **Nodemailer with Gmail** - Transactional emails for booking confirmations and cancellations
- Configuration: `GMAIL_USER` and `GMAIL_APP_PASSWORD` environment variables
- Gracefully degrades if credentials not configured (logs warning, skips email)

**Rationale**: Gmail SMTP provides reliable email delivery without additional service costs. Nodemailer is the de facto Node.js email library. Graceful degradation allows development without email credentials.

**Third-Party Libraries**
- **nanoid** - Cryptographically secure unique ID generation for PNRs
- **date-fns** - Date formatting and manipulation (locale-aware)
- **class-variance-authority** - Type-safe component variant management
- **zod** - Schema validation for forms and API payloads

**Development Dependencies**
- **tsx** - TypeScript execution for development server
- **esbuild** - Fast TypeScript compilation for production build
- **drizzle-kit** - Database migration generation and management

**Environment Variables**
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (defaults to development key)
- `GMAIL_USER`: Gmail address for sending emails (optional)
- `GMAIL_APP_PASSWORD`: Gmail app-specific password (optional)
- `NODE_ENV`: "development" or "production"

**Deployment Architecture**
- Development: Vite dev server proxied through Express
- Production: Static files served from `dist/public`, Express serves API
- Session storage: PostgreSQL table (auto-created by connect-pg-simple)
- WebSocket support: Neon serverless uses ws library for PostgreSQL connections