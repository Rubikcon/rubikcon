# Deployment

This guide outlines how to deploy the Rubikcon backend.

## Environment Variables

Ensure all variables defined in `.env.example` are securely set in your deployment environment.

## Build Process

The application is built using TypeScript.

```bash
npm run build
```

This generates the transpiled JavaScript into the `dist/` directory.

## Running in Production

Use the `npm start` script to launch the application. We recommend using a process manager such as PM2 or running inside a Docker container.

```bash
npm start
```

## Database Migrations

Before deploying new code, ensure the production database schema is up-to-date:

```bash
npx prisma migrate deploy
```

## Vercel (Optional)

A `vercel.json` configuration file is included in the root if you wish to deploy the Express application as a Serverless function.
