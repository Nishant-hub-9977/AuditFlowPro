# Audit Lifecycle Management Platform

## Overview

This is a comprehensive web-based audit and lead management platform designed for enterprise auditors and channel partners. The system supports planning, executing, and reporting audits across industries (Pharma, Chemical, etc.) while managing the complete lead lifecycle from generation to conversion. The platform features a modern, data-focused enterprise UI with real-time dashboards, configurable workflows, and master data management capabilities. Its business vision is to provide a multi-tenant, enterprise-grade SaaS solution for audit and lead management, offering significant market potential across various regulated industries. The project aims to deliver a secure, scalable, and fully functional platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:** React with TypeScript, Vite, Wouter for routing, Radix UI primitives with shadcn/ui design system, Tailwind CSS, TanStack Query for server state, React Hook Form with Zod validation, and Recharts for visualizations.

**Design Principles:** Linear-inspired clean enterprise UI, mobile-first responsive design, dark/light mode support, accessibility-focused, and Inter font family.

**Component Structure:** Reusable UI components in `/client/src/components/ui`, feature-specific components for audits, leads, and dashboards, page-level components in `/client/src/pages`, and custom hooks in `/client/src/hooks`.

### Backend Architecture

**Technology Stack:** Node.js with TypeScript, Express.js for REST API, PostgreSQL (Neon serverless) with Drizzle ORM, and esbuild for bundling.

**API Design:** RESTful API structure, CRUD operations via storage interface, request/response logging, error handling, and Zod schema validation.

**Storage Layer:** Interface-based storage abstraction (`IStorage`) with PostgreSQL via Drizzle ORM for full CRUD operations on Users, Audits, Leads, Industries, Audit Types, Checklists, Checklist Items, Audit Checklist Responses, Observations, Business Intelligence, and Files.

### Database Schema

**ORM Configuration:** Drizzle ORM for PostgreSQL, schema defined in `/shared/schema.ts` with Zod integration for runtime validation.

**Core Tables (11):** Users, Industries, Audit Types, Audits, Leads, Checklists, Checklist Items, Audit Checklist Responses, Observations, Business Intelligence, and Files.

### Authentication & Session Management

Multi-tenant architecture with JWT tokens, bcrypt for password hashing, role-based authorization (master_admin, admin, client, auditor), secure API routes with authentication middleware and RBAC. Includes Login/Register UI with AuthContext and protected route handling using `RoleGuard` component, and role-based sidebar navigation.

### Application Structure

**Monorepo Organization:** `/client` (React frontend), `/server` (Express.js backend), `/shared` (shared TypeScript types and schemas), `/attached_assets` (documentation).

### Key Features Implementation

**Dashboard:** Real-time KPI cards, recent audits table, lead pipeline preview, all data from live PostgreSQL.
**Audit Management:** Comprehensive audits table with filtering, audit cards, status tracking, customer/industry/audit type relations.
**Lead Management:** Kanban board view, table view for details, lead cards, priority and source tracking.
**Master Data Management:** Tabbed interface for Users, Industry types, and Audit types with full CRUD and multi-tenant security.

### Workflow State Machines

**Audit Workflow:** Draft → Review → Approved → Closed, with state validation, tenant isolation, API endpoints with admin-only authorization, and conditional frontend buttons.
**Lead Workflow:** New → Qualified → In Progress → Converted → Closed, with state validation, tenant isolation, role-based authorization, and conditional frontend buttons.

## External Dependencies

### Core Infrastructure
- **Neon Database:** Serverless PostgreSQL.
- **Replit Platform:** Development and deployment environment.

### UI & Styling
- **Radix UI:** Headless component primitives.
- **Tailwind CSS:** Utility-first CSS framework.
- **Recharts:** React charting library.
- **Lucide React:** Icon library.
- **class-variance-authority:** Component variant management.
- **tailwind-merge:** Intelligent Tailwind class merging.

### Forms & Validation
- **React Hook Form:** Form state management.
- **Zod:** TypeScript-first schema validation.
- **@hookform/resolvers:** Zod resolver for React Hook Form.

### Data Management
- **TanStack Query:** Server state management and caching.
- **Drizzle ORM:** TypeScript ORM for PostgreSQL.
- **drizzle-zod:** Zod schema generation from Drizzle schemas.

### Development Tools
- **Vite:** Fast build tool and dev server.
- **tsx:** TypeScript execution for development.
- **Replit plugins:** Runtime error overlay, cartographer, dev banner.

### Routing & Navigation
- **Wouter:** Lightweight client-side routing.