---
description: Standard project structure and organization conventions
alwaysApply: true
---

# Project Structure Standards

## Directory Organization

### Output Directory (`output/`)

- Direct ALL logs, test reports, and script outputs to `output/` directory
- Place one-off development testing scripts in `output/` to prevent codebase
  pollution
- Temporary files and experimental scripts belong here

### Tests Directory (`tests/`)

- Organize ALL testing code, test files, and test infrastructure in `tests/`
  folder
- Test file naming convention: `[filename].test.ts` or `[filename].spec.ts`
- Document test purpose in each test file

### Scripts Directory (`scripts/`)

- Place all administrative and manual task scripts in `scripts/` folder
- Include deployment scripts, build scripts, maintenance scripts

### Documentation Directory (`docs/`)

- Maintain all project documentation in `docs/` directory
- Architecture diagrams, API documentation, setup guides

## Configuration Management

### Environment Variables

- **ALWAYS** use `.env` file for:
  - Secrets
  - Configuration variables
  - Environment-specific settings
- **NEVER** hardcode secrets, API keys, or passwords
- Add `.env.example` template to repository (without actual secrets)

### Configuration-Driven Development

- Implement fixes and workarounds through **configuration parameters** or
  **dictionaries**
- **DO NOT** hardcode into classes/libraries
- Promotes clean, reusable code
- Examples:
  - Feature flags via config
  - Service endpoints via environment variables
  - Timeouts and thresholds via configuration files

## Environment Consistency

### Python Projects

- Use Python in `venv/bin/python` (or `.venv/bin/python`) for ALL tasks
- Ensures consistency across development and CI/CD
- Virtual environment isolation prevents dependency conflicts

### Node.js Projects

- Use Node in `node_modules/.bin/node` for project-specific tools
- Use npm scripts for common commands

### Language-Specific Conventions

- Follow language ecosystem standards (e.g., `requirements.txt` for Python,
  `package.json` for Node)
- Use standard dependency management tools

## File Organization Best Practices

### Keep Codebase Clean

- Remove obsolete files immediately
- No commented-out code blocks (use version control)
- Delete unused imports and dependencies

### Database and Cache Files (CRITICAL)

- **NEVER** delete database files (`*.db`, `*.sqlite`) directly
- **NEVER** use `rm -rf` on cache directories or database files
- If cache/database needs to be cleared:
  - **ASK THE USER FIRST** and explain why
  - User may want to preserve data for other scripts/sessions
  - Cache files are shared across multiple extraction scripts
  - Example: `cache/html_cache.db` is used by multiple scrapers
- Provide specific deletion commands for user to run if they approve

### Modular Code Structure

- Use 'services' directory/module for client-API interactions
- Clear separation of concerns
- Group related functionality

### Version Control

- Commit logical, atomic changes
- Meaningful commit messages
- `.gitignore` properly configured for build artifacts, dependencies,
  environment files

## Learned Preferences

This section can be updated as project-specific patterns emerge:

- Repository-specific naming conventions
- Custom directory structures for special cases
- Team-specific organizational patterns
