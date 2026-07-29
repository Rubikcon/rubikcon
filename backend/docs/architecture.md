# Architecture

This document describes the high-level architecture of the backend service.

## Core Design Philosophy

We adhere strictly to a **canonical layered architecture**:

1. **Routes**: Express route definitions. No business logic.
2. **Controllers**: Request validation (Zod) and HTTP response handling.
3. **Services**: Core business logic.
4. **Repositories**: Data access layer exclusively. Only layer allowed to import Prisma.

## Key Principles

- **Clarity over Cleverness**: We avoid over-engineering. No CQRS, Event Sourcing, or complex Dependency Injection containers.
- **Module Boundaries**: Features are encapsulated into domain modules (e.g., Auth, Games, Gigs, Academy).
- **Single Source of Truth**: All data validation and Swagger schemas are generated directly from Zod.

## Database

We use PostgreSQL via Prisma ORM.
The schema is modularized into `prisma/schema` using the Prisma Schema Folder preview feature.
