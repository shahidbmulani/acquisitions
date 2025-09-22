# Docker Setup Guide for Acquisitions Application

This guide explains how to run the Acquisitions application using Docker with different configurations for development and production environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

## Overview

The application supports two distinct Docker deployment modes:

- **Development**: Uses Neon Local proxy for local database development with ephemeral branches
- **Production**: Connects directly to Neon Cloud database

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Neon account and project setup
- Node.js (for local development without Docker)

## Environment Variables

### Required for Development (Neon Local)

Create a `.env` file in the project root with the following variables:

```bash
# Neon Local Configuration
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
PARENT_BRANCH_ID=your_parent_branch_id_here

# JWT Secret (development)
JWT_SECRET=dev_jwt_secret_change_in_production

# Optional: Arcjet
ARCJET_KEY=your_arcjet_key_here
```

### Required for Production

Set these as environment variables in your production environment:

```bash
# Production Database (Neon Cloud)
DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require

# JWT Secret (production - must be secure)
JWT_SECRET=your_secure_production_jwt_secret

# Optional: Arcjet
ARCJET_KEY=your_production_arcjet_key
```

## Development Setup

### 1. Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd acquisitions

# Create environment file
cp .env.development .env
# Edit .env with your Neon credentials

# Start development environment
npm run docker:dev
```

### 2. Step-by-Step Development Setup

#### Step 2.1: Configure Neon Local

1. Get your Neon API key from [Neon Console](https://console.neon.tech)
2. Find your Project ID and Parent Branch ID
3. Create `.env` file:

```bash
NEON_API_KEY=neon_api_1234567890abcdef
NEON_PROJECT_ID=cool-project-123456
PARENT_BRANCH_ID=br-main-123456
JWT_SECRET=development_secret_key
```

#### Step 2.2: Start Development Environment

```bash
# Start all services (app + Neon Local)
docker-compose -f docker-compose.dev.yml up --build

# Or use the npm script
npm run docker:dev
```

This will:

- Start Neon Local proxy on port 5432
- Create an ephemeral database branch
- Start the application on port 3000
- Set up hot reload for development

#### Step 2.3: Run Database Migrations

```bash
# Run migrations against the local database
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Or generate new migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:generate
```

#### Step 2.4: Access Drizzle Studio (Optional)

```bash
# Start Drizzle Studio for database management
npm run docker:dev:studio

# Access at http://localhost:4983
```

### 3. Development Workflow

```bash
# View logs
npm run docker:dev:logs

# Stop services
npm run docker:dev:down

# Restart services
docker-compose -f docker-compose.dev.yml restart

# Rebuild and restart
npm run docker:dev
```

## Production Setup

### 1. Environment Configuration

Set the following environment variables in your production environment (CI/CD, cloud provider, etc.):

```bash
export DATABASE_URL=\"postgresql://user:pass@hostname.neon.tech/db?sslmode=require\"
export JWT_SECRET=\"your-secure-production-secret\"
export ARCJET_KEY=\"your-production-arcjet-key\"
```

### 2. Deploy to Production

```bash
# Build and start production services
npm run docker:prod

# Or manually
docker-compose -f docker-compose.prod.yml up --build -d
```

### 3. Production Management

```bash
# View production logs
npm run docker:prod:logs

# Stop production services
npm run docker:prod:down

# Scale the application (if using Docker Swarm)
docker service scale acquisitions-app-prod=3
```

### 4. Health Checks

The production setup includes health checks:

- Application: `http://localhost:3000/health`
- Docker health check runs every 30 seconds

## Available Scripts

### Development Scripts

```bash
npm run docker:dev              # Start development environment
npm run docker:dev:down         # Stop development environment
npm run docker:dev:logs         # View development logs
npm run docker:dev:studio       # Start Drizzle Studio
```

### Production Scripts

```bash
npm run docker:prod             # Start production environment
npm run docker:prod:down        # Stop production environment
npm run docker:prod:logs        # View production logs
```

### Utility Scripts

```bash
npm run docker:build            # Build Docker image only
npm run docker:clean            # Clean up Docker resources
```

## Troubleshooting

### Common Issues

#### 1. Neon Local Connection Issues

```bash
# Check if Neon Local is running
docker-compose -f docker-compose.dev.yml ps

# Check Neon Local logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Verify environment variables
docker-compose -f docker-compose.dev.yml exec neon-local env | grep NEON
```

#### 2. Application Won't Start

```bash
# Check application logs
docker-compose -f docker-compose.dev.yml logs app

# Verify database connection
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
```

#### 3. Port Conflicts

```bash
# Check what's using port 3000
lsof -i :3000

# Use different ports by modifying docker-compose.yml
# Change \"3000:3000\" to \"3001:3000\"
```

#### 4. Permission Issues

```bash
# Fix log directory permissions
sudo chown -R $USER:$USER ./logs

# Or run with sudo (not recommended)
sudo docker-compose -f docker-compose.dev.yml up
```

### Database Issues

#### Reset Development Database

```bash
# Stop services
npm run docker:dev:down

# Clean volumes
docker volume prune -f

# Restart (creates new ephemeral branch)
npm run docker:dev
```

#### Migration Issues

```bash
# Generate new migration
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Apply migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Check migration status
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## Architecture

### Development Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Developer     │    │   Docker Host    │    │   Neon Cloud    │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │   Browser   │─┼────┼─│     App      │ │    │ │   Parent    │ │
│ └─────────────┘ │    │ │  (Port 3000) │ │    │ │   Branch    │ │
│                 │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │        │         │    │        ▲        │
│                 │    │        ▼         │    │        │        │
│                 │    │ ┌──────────────┐ │    │        │        │
│                 │    │ │  Neon Local  │─┼────┼────────┘        │
│                 │    │ │  (Port 5432) │ │    │                 │
│                 │    │ └──────────────┘ │    │ ┌─────────────┐ │
│                 │    │                  │    │ │ Ephemeral   │ │
│                 │    │                  │    │ │   Branch    │ │
│                 │    │                  │    │ │ (Auto-created)││
│                 │    │                  │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Production Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Client      │    │   Docker Host    │    │   Neon Cloud    │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │   Browser   │─┼────┼─│     App      │─┼────┼─│ Production  │ │
│ └─────────────┘ │    │ │  (Port 3000) │ │    │ │  Database   │ │
│                 │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│                 │    │ ┌──────────────┐ │    │                 │
│                 │    │ │    Nginx     │ │    │                 │
│                 │    │ │ (Optional)   │ │    │                 │
│                 │    │ └──────────────┘ │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Differences

| Aspect          | Development                   | Production         |
| --------------- | ----------------------------- | ------------------ |
| Database        | Neon Local + Ephemeral Branch | Neon Cloud Direct  |
| Port Exposure   | 3000, 5432, 4983              | 3000 only          |
| Hot Reload      | Yes (volume mounted)          | No                 |
| Resource Limits | None                          | CPU/Memory limits  |
| Health Checks   | Basic                         | Comprehensive      |
| Logging         | Debug level                   | Info level         |
| Security        | Development keys              | Production secrets |

## Security Considerations

### Development

- Uses development JWT secrets (not secure)
- Database credentials are in Docker Compose
- All ports exposed for debugging

### Production

- Environment variables for all secrets
- No hardcoded credentials
- Minimal port exposure
- Non-root container user
- Resource limits applied
- Health checks configured

## Next Steps

1. **Set up CI/CD Pipeline**: Integrate with GitHub Actions, GitLab CI, or similar
2. **Add Monitoring**: Integrate with tools like Prometheus, Grafana, or DataDog
3. **Implement Logging**: Set up centralized logging with ELK stack or similar
4. **Add Load Balancing**: Use Nginx or HAProxy for production traffic
5. **Database Backup**: Implement automated backup strategies
6. **Security Scanning**: Add container security scanning to your pipeline

## Support

For issues related to:

- **Neon Database**: [Neon Documentation](https://neon.com/docs)
- **Docker**: [Docker Documentation](https://docs.docker.com)
- **Application**: Check the main README.md or create an issue in the repository
