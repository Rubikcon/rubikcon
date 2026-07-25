# Contributing

Welcome to the Rubikcon backend.

## Code Style & Conventions

- **TypeScript Only**: No raw JavaScript files inside `src/`.
- **Strict Typing**: Avoid `any`. If you must bypass the compiler, document exactly why.
- **No AI Narrative Comments**: Comments should describe _why_ something is done, not _what_ is done (e.g., avoid `// Retrieve the user from the database`). Use JSDoc for method signatures.

## Layered Architecture

When adding a new feature, follow this exact file structure:

- `module-name.routes.ts`
- `controllers/module-name.controller.ts`
- `services/module-name.service.ts`
- `repositories/module-name.repository.ts`
- `schemas/module-name.schemas.ts`
- `types/module-name.types.ts`
- `module-name.swagger.ts`

## Pull Requests

1. Ensure `npx tsc --noEmit` passes with 0 errors.
2. Ensure you have updated Swagger documentation (`.openapi()`) for any new schemas.
3. Write clear PR descriptions focusing on architectural boundaries and business impact.
