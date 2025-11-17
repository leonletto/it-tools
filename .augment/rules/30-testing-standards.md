---
description:
  General testing standards, principles, and best practices (framework-agnostic)
alwaysApply: false
---

# General Testing Standards & Principles

> **Note:** This file covers framework-agnostic testing principles. For
> pytest-specific patterns, see `31-pytest-standards.md`. For Jest/TypeScript
> patterns, see `32-jest-standards.md`.

## Core Testing Principles

### Test-Driven Development (TDD)

1. **Test First:** Write tests **BEFORE** implementing new features
2. **Red-Green-Refactor:** Write failing test → Make it pass → Refactor
3. **Check Existing Tests:** Before writing new tests, check for existing test
   patterns
4. **Ensure Coverage:** All new features MUST have tests
5. **No Skipping:** Don't skip tests, even if they are failing - fix them
   instead

### Test Success Criteria

- **ALL tests MUST pass** for success
- ANY failing test = FAILURE (not success, not "minor issue")
- Functionality must work as specified
- Working without crashes ≠ working correctly

## Test Infrastructure

### Test Scripts (MANDATORY)

Always create these test runner scripts in your project root:

#### `run_single_test.sh`

```bash
#!/bin/bash
# Run single test with options
# Usage: ./run_single_test.sh <test_file> [--no-build] [--gather-logs] [--no-cleanup]
# Example: ./run_single_test.sh tests/workflows/test_orchestrator.py --gather-logs
```

#### `run_all_tests.sh`

```bash
#!/bin/bash
# Run all tests with options
# Usage: ./run_all_tests.sh [--no-build] [--gather-logs] [--no-cleanup]
# Example: ./run_all_tests.sh --gather-logs
```

### Troubleshooting Options (Required)

Implement these flags in test scripts:

- `--no-build`: Skip build/setup step for faster iteration during debugging
- `--gather-logs`: Collect and display all logs for debugging failed tests
- `--no-cleanup`: Keep test artifacts (temp files, databases, etc.) for
  inspection

## Test Types & Strategy

### Test Pyramid Approach

#### Unit Tests (Base - Most Numerous)

- **Characteristics:** Fast, isolated, focused on single units
- **Scope:** Individual functions, methods, classes
- **Mocking:** Mock all external dependencies
- **Speed:** Milliseconds per test
- **Coverage Target:** 80%+ for business logic

#### Integration Tests (Middle)

- **Characteristics:** Moderate speed, test component interaction
- **Scope:** Multiple units working together
- **Mocking:** Mock external services, use real internal components
- **Speed:** Seconds per test
- **Examples:** Service layer + repository, API endpoints + database

#### End-to-End Tests (Top - Fewest)

- **Characteristics:** Slow, test full system
- **Scope:** Complete user workflows
- **Mocking:** Minimal, use production-like environment
- **Speed:** Minutes per test
- **Examples:** Full user registration flow, checkout process

## Mocking Strategy

### Docker for External Services

- **Use Docker** for mocking external services
- **Reason:** Accurately reflects production environment
- **Examples:**
  - Database containers (PostgreSQL, MongoDB)
  - Message queues (RabbitMQ, Redis)
  - External APIs (WireMock, mock servers)

### Mock Configuration

```yaml
# Example docker-compose.test.yml
services:
  test-db:
    image: postgres:15
    environment:
      POSTGRES_DB: testdb
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass

  test-redis:
    image: redis:7-alpine
```

## Test Documentation

### Test File Structure

Every test file should include:

```
/**
 * Tests for [Component/Module Name]
 *
 * Purpose: [What is being tested and why]
 *
 * Test Strategy:
 * - [Type of tests: unit, integration, e2e]
 * - [Scope and coverage]
 * - [Any mocking strategy]
 *
 * Setup Requirements:
 * - [Any special configuration needed]
 * - [External services or databases]
 */
```

### Documentation Requirements

1. **Test Purpose:** What is being tested and why
2. **Test Strategy:** Approach, scope, and test types used
3. **Setup Requirements:** Any special configuration or dependencies
4. **AAA Pattern:** Arrange, Act, Assert clearly separated in each test
5. **Test Naming:** Descriptive names explaining what is tested

### Test Naming Conventions

- **Pattern:** `should [expected behavior] when [condition]`
- **Examples:**
  - ✅ `should return 404 when user not found`
  - ✅ `should throw ValidationError when email is invalid`
  - ✅ `should create new user with valid data`
  - ❌ `test1`, `userTest`, `it works`

## Test Reporting

### Generate Comprehensive Reports

- **Coverage Reports:** HTML/JSON coverage reports
- **Test Results:** JUnit XML for CI/CD integration
- **Performance Metrics:** Execution time per test
- **Failure Details:** Stack traces, error messages

## Test Logging

### Always Create and Check Logs

- **Don't rely solely on test output**
- Create detailed logs during test execution
- Check logs for errors even when tests "pass"
- Log files should go to `output/logs/test-{timestamp}.log`

## Test Maintenance

### Continuous Improvement

- Regularly review and update tests
- Remove obsolete tests
- Refactor tests for clarity and maintainability
- Keep test data realistic and up-to-date
- Update tests when requirements change

### Test Isolation

- Each test should be independent and self-contained
- No shared state between tests
- Clean up after each test (database, files, mocks, temporary data)
- Use setup/teardown hooks appropriately
- Avoid test interdependencies
