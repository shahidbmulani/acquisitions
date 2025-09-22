# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js Express API application for an "acquisitions" system with authentication functionality. It uses a modern JavaScript stack with ES modules, Drizzle ORM for database operations, and PostgreSQL (via Neon) as the database.

## Development Commands

### Running the Application

```bash
npm run dev          # Start development server with --watch flag
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check if code is formatted correctly
```

### Database Operations

```bash
npm run db:generate  # Generate Drizzle migrations from schema changes
npm run db:migrate   # Apply pending migrations to database
npm run db:studio    # Open Drizzle Studio for database management
```

## Architecture

### Module System

- Uses ES modules (`"type": "module"` in package.json)
- Custom import paths defined in `package.json` imports field using `#` prefix:
  - `#config/*` → `./src/config/*`
  - `#controllers/*` → `./src/controllers/*`
  - `#middleware/*` → `./src/middleware/*`
  - `#models/*` → `./src/models/*`
  - `#routes/*` → `./src/routes/*`
  - `#services/*` → `./src/services/*`
  - `#utils/*` → `./src/utils/*`
  - `#validations/*` → `./src/validations/*`

### Application Structure

- **Entry Point**: `src/index.js` loads environment variables and starts server
- **Server Setup**: `src/server.js` starts Express server on configured port
- **App Configuration**: `src/app.js` contains Express middleware setup and route registration
- **Database**: Uses Drizzle ORM with Neon PostgreSQL serverless database
- **Authentication**: JWT-based with bcrypt password hashing

### Key Components

#### Database Layer

- **Connection**: `src/config/database.js` - Neon serverless PostgreSQL connection
- **Models**: `src/models/user.model.js` - Drizzle schema definitions
- **Migrations**: Generated in `drizzle/` directory, configured via `drizzle.config.js`

#### API Layer

- **Routes**: Express routers in `src/routes/` (currently auth routes)
- **Controllers**: Request handlers in `src/controllers/`
- **Services**: Business logic and database operations in `src/services/`
- **Validations**: Zod schemas in `src/validations/`

#### Utilities

- **JWT**: Token generation and verification in `src/utils/jwt.js`
- **Cookies**: Cookie management utilities in `src/utils/cookies.js`
- **Formatting**: Error formatting utilities in `src/utils/format.js`

### Current Features

- User registration (`POST /api/auth/sign-up`) with validation
- Basic authentication structure (sign-in/sign-out routes stubbed)
- Health check endpoint (`/health`)
- Request logging with Winston and Morgan
- Security middleware (Helmet, CORS)

### Code Style

- **ESLint**: Enforces single quotes, 2-space indentation, semicolons, unix line endings
- **Prettier**: Configured for consistent code formatting
- **Import Style**: Uses custom import paths with `#` prefix for internal modules

### Environment Configuration

- Requires `.env` file with `DATABASE_URL` and `JWT_SECRET`
- Default port is 3000 if `PORT` env var not set

### Database Schema

Currently has one table:

- **users**: id, name, email (unique), password (hashed), role (user/admin), timestamps

## Development Notes

- The application uses Node.js `--watch` flag for hot reloading in development
- Database operations should always go through Drizzle ORM services layer
- All validation should use Zod schemas from the validations directory
- JWT tokens are set as HTTP-only cookies via the cookies utility
- Logging is centralized through Winston logger configuration
