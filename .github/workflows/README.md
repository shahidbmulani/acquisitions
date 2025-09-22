# CI/CD Workflows

This directory contains GitHub Actions workflows for automated testing, linting, and deployment of the Acquisitions API.

## Workflows Overview

### 1. `lint-and-format.yml` - Code Quality Checks

**Triggers:**

- Push to `main` or `staging` branches
- Pull requests to `main` or `staging` branches

**Features:**

- ✅ ESLint code analysis
- ✅ Prettier formatting checks
- ✅ Node.js 20.x with npm caching
- ✅ Clear error annotations with fix suggestions
- ✅ Automated failure on code quality issues

**Actions on Failure:**

- Provides specific commands to fix issues: `npm run lint:fix` and `npm run format`
- Annotates the workflow with helpful error messages

### 2. `tests.yml` - Test Suite Execution

**Triggers:**

- Push to `main` or `staging` branches
- Pull requests to `main` or `staging` branches

**Features:**

- 🧪 Jest test runner with ES modules support
- 📊 Coverage report generation
- 🗄️ PostgreSQL 15 test database
- 📦 Coverage artifacts (30-day retention)
- 📋 Detailed test summary in GitHub
- ⚠️ Test failure annotations

**Environment Variables:**

- `NODE_ENV=test`
- `NODE_OPTIONS=--experimental-vm-modules`
- `DATABASE_URL` (PostgreSQL test database)
- `JWT_SECRET` (test secret)
- `ARCJET_KEY` (test key)

### 3. `docker-build-and-push.yml` - Container Deployment

**Triggers:**

- Push to `main` branch
- Manual trigger via `workflow_dispatch`

**Features:**

- 🐳 Multi-platform builds (linux/amd64, linux/arm64)
- 🏷️ Intelligent tagging strategy
- 📦 Docker Hub registry
- ⚡ GitHub Actions cache optimization
- 📊 Comprehensive build summary

**Tags Generated:**

- `latest` (for main branch)
- `prod-YYYYMMDD-HHmmss` (timestamped production tags)
- `main-<sha>` (commit-specific tags)

## Setup Instructions

### 1. Repository Secrets

Configure the following secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

```bash
# Docker Hub credentials
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_token_or_password
```

### 2. Branch Protection Rules (Recommended)

Configure branch protection for `main` and `staging`:

1. Go to `Settings > Branches`
2. Add rule for `main` and `staging`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Required status checks:
     - `lint-and-format`
     - `test`

### 3. Local Development Workflow

Before pushing code, run these commands locally:

```bash
# Install dependencies
npm ci

# Run linting and formatting
npm run lint
npm run format:check

# Fix issues automatically
npm run lint:fix
npm run format

# Run tests
npm test
```

### 4. Docker Hub Setup

1. Create a Docker Hub account if you don't have one
2. Create a new repository named `acquisitions`
3. Generate an access token in Docker Hub settings
4. Add the token as `DOCKER_PASSWORD` secret in GitHub

## Workflow Behavior

### Pull Request Workflow

1. **Lint and Format** - Checks code quality
2. **Tests** - Runs test suite with coverage
3. Both must pass before merge is allowed

### Main Branch Workflow

1. **Lint and Format** - Ensures code quality
2. **Tests** - Validates functionality
3. **Docker Build and Push** - Creates and publishes container image

## Troubleshooting

### Common Issues

1. **ESLint Failures:**

   ```bash
   npm run lint:fix
   ```

2. **Formatting Issues:**

   ```bash
   npm run format
   ```

3. **Test Failures:**
   - Check database connection
   - Verify environment variables
   - Run `npm test` locally

4. **Docker Build Failures:**
   - Verify Docker secrets are set
   - Check Dockerfile syntax
   - Ensure target `runtime` exists in Dockerfile

### Monitoring Workflows

- Check workflow runs in the `Actions` tab
- Review coverage reports in artifacts
- Monitor Docker Hub for published images
- Check GitHub step summaries for detailed information

## Best Practices

1. **Always run tests locally** before pushing
2. **Use descriptive commit messages** for better tracking
3. **Keep dependencies updated** for security
4. **Monitor coverage reports** to maintain code quality
5. **Use feature branches** and create pull requests
6. **Review workflow logs** when failures occur

## Maintenance

### Updating Workflows

When updating workflows:

1. Test changes in a feature branch first
2. Consider backward compatibility
3. Update this README if behavior changes
4. Monitor first runs after updates

### Security Updates

- Regularly update action versions
- Review and rotate secrets annually
- Monitor security advisories for dependencies
- Use dependabot for automated updates
