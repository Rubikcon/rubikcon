# Rubikcon Backend

The core backend service for the Rubikcon platform, handling Authentication, Course Catalog, Progress tracking, Gamification, and User Management.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Validation**: Zod
- **Documentation**: Swagger / OpenAPI

## Architecture

This repository adheres strictly to a canonical layered architecture:

- `src/modules/*/*.routes.ts`: Express route definitions
- `src/modules/*/*.controller.ts`: Request validation and HTTP responses
- `src/modules/*/*.service.ts`: Core business logic
- `src/modules/*/*.repository.ts`: Data access layer

For detailed architectural guidelines, see `docs/architecture.md`.

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker (for local database)

### Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and configure your local environment variables
4. Start the database: `docker-compose up -d`
5. Run migrations: `npx prisma migrate dev`
6. Seed the database: `npm run seed`

### Running the App

- **Development**: `npm run dev`
- **Production**: `npm start`

## Documentation

- **API Documentation**: Available at `/api-docs` when the server is running.
- **Internal Docs**: See the `docs/` folder for information on architecture, authentication, the Academy module, and contributing guidelines.
