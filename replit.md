# Audit Lifecycle Management Platform

## Overview

This is a comprehensive web-based audit and lead management platform designed for enterprise auditors and channel partners. The system supports planning, executing, and reporting audits across industries (Pharma, Chemical, etc.) while managing the complete lead lifecycle from generation to conversion. The platform features a modern, data-focused enterprise UI with real-time dashboards, configurable workflows, and master data management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React with TypeScript using Vite as the build tool
- **Routing:** Wouter (lightweight client-side routing)
- **UI Component Library:** Radix UI primitives with shadcn/ui design system
- **Styling:** Tailwind CSS with custom design tokens
- **State Management:** TanStack Query (React Query) for server state
- **Form Handling:** React Hook Form with Zod validation
- **Charts/Visualization:** Recharts for dashboards and reports

**Design Principles:**
- **Linear-inspired clean enterprise UI** with data clarity as priority
- **Mobile-first responsive design** with 44x44px minimum touch targets
- **Dark/light mode support** using CSS variables and class-based theming
- **Accessibility-focused** with proper ARIA labels and keyboard navigation
- Inter font family for UI with JetBrains Mono for monospaced data fields

**Component Structure:**
- Reusable UI components in `/client/src/components/ui` (shadcn/ui pattern)
- Feature-specific components for audits, leads, and dashboards
- Page-level components in `/client/src/pages`
- Custom hooks in `/client/src/hooks`

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js for REST API
- **Database ORM:** Drizzle ORM with Neon serverless PostgreSQL
- **Session Management:** Connect-pg-simple for PostgreSQL-backed sessions
- **Build Tool:** esbuild for production bundling

**API Design:**
- RESTful API structure with `/api` prefix for all routes
- CRUD operations abstracted through storage interface pattern
- Request/response logging middleware for debugging
- Error handling middleware with proper HTTP status codes

**Storage Layer:**
- Interface-based storage abstraction (`IStorage`) allowing multiple implementations
- Current implementation: In-memory storage (`MemStorage`) for development
- Designed for easy migration to database-backed storage (PostgreSQL via Drizzle ORM)
- User authentication structure prepared with username/password schema

### Database Schema

**ORM Configuration:**
- Drizzle ORM configured for PostgreSQL dialect
- Schema defined in `/shared/schema.ts` for shared type safety
- Zod integration for runtime validation (drizzle-zod)
- Migration files in `/migrations` directory

**Current Schema:**
- Users table with UUID primary keys, username (unique), and password fields
- Schema uses Neon serverless PostgreSQL with WebSocket support
- Prepared for expansion with audit, lead, customer, and master data tables

### Authentication & Session Management

**Planned Approach:**
- User roles: Enterprise Users, Auditors, Admins, Channel Partners
- Session-based authentication using PostgreSQL-backed sessions
- Password hashing (implementation needed)
- Role-based access control for different user types

### Application Structure

**Monorepo Organization:**
- `/client` - React frontend application
- `/server` - Express.js backend
- `/shared` - Shared TypeScript types and schemas
- `/attached_assets` - Project documentation and requirements

**Development Workflow:**
- Development server with HMR using Vite middleware
- TypeScript strict mode enabled across all modules
- Path aliases configured: `@/` for client, `@shared/` for shared code
- Build process: Vite for frontend, esbuild for backend bundling

### Key Features Implementation

**Audit Management:**
- Multi-step wizard form for audit creation (AuditFormWizard component)
- Audit status tracking with visual indicators
- Geo-location integration for site audits
- Document/photo upload capability (planned)
- Checklist system with dynamic questions

**Lead Management:**
- Kanban board view for visual pipeline management
- Table view for detailed lead information
- Lead conversion funnel visualization
- Assignment and follow-up tracking
- Integration with audit system for lead generation

**Dashboard & Reporting:**
- Real-time KPI cards with trend indicators
- Pie charts for audit status distribution
- Bar charts for lead conversion funnels
- Recent activity tables with filtering
- Separate dashboards for enterprise users and channel partners

**Master Data Management:**
- Tabbed interface for managing:
  - Users and roles
  - Customers with audit history
  - Industry types
  - Audit types
  - Questionnaire templates
  - Channel partners
  - Cities/States/Departments

## External Dependencies

### Core Infrastructure
- **Neon Database:** Serverless PostgreSQL database with WebSocket support
- **Replit Platform:** Development and deployment environment with built-in database provisioning

### UI & Styling
- **Radix UI:** Headless component primitives (20+ components)
- **Tailwind CSS:** Utility-first CSS framework with custom configuration
- **Recharts:** React charting library for dashboards
- **Lucide React:** Icon library
- **class-variance-authority:** Component variant management
- **tailwind-merge:** Intelligent Tailwind class merging

### Forms & Validation
- **React Hook Form:** Form state management
- **Zod:** TypeScript-first schema validation
- **@hookform/resolvers:** Zod resolver for React Hook Form

### Data Management
- **TanStack Query:** Server state management and caching
- **Drizzle ORM:** TypeScript ORM for PostgreSQL
- **drizzle-zod:** Zod schema generation from Drizzle schemas

### Development Tools
- **Vite:** Fast build tool and dev server
- **tsx:** TypeScript execution for development
- **Replit plugins:** Runtime error overlay, cartographer, dev banner

### Routing & Navigation
- **Wouter:** Lightweight client-side routing (~1.2KB)

### Future Integration Points
- **CRM Integration:** Planned for lead management
- **Email Service (SMTP):** For automated notifications and alerts
- **Geo-location API:** For audit site tracking
- **File Upload Service:** For photos and documents
- **Mobile App (Flutter):** Cross-platform mobile companion app (planned)