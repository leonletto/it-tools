---
description: Pytest-specific testing standards, patterns, and best practices
alwaysApply: false
---

# Pytest Standards & Best Practices

> **Note:** This file covers pytest-specific patterns. For general testing
> principles, see `30-testing-standards.md`.

## Pytest Configuration

### Root pytest.ini

Every project using pytest MUST have a `pytest.ini` in the project root:

```ini
[pytest]
# Test discovery patterns
python_files = test_*.py
python_classes = Test*
python_functions = test_*

# Asyncio mode for async tests
asyncio_mode = auto

# Output options
addopts =
    -v
    --tb=short
    --strict-markers
    -ra

# Markers for categorizing tests
markers =
    unit: Unit tests for individual components
    integration: Integration tests for component interaction
    e2e: End-to-end tests for complete workflows
    slow: Tests that take a long time to run
    requires_browser: Tests that require Playwright browser installation
    workflow: Tests for workflow orchestration
    tool: Tests for workflow tools
    refactoring: Tests for refactoring changes
    validation: Tests for schema and workflow validation

# Coverage options
[coverage:run]
source = app
omit =
    */tests/*
    */test_*
    */__pycache__/*
```

### Key Configuration Points

- **`--strict-markers`:** Prevents unknown marker warnings (CRITICAL)
- **`markers` section:** Register ALL custom markers to avoid
  `PytestUnknownMarkWarning`
- **`asyncio_mode = auto`:** Enables async test support
- **`--tb=short`:** Concise traceback format for readability

## Test Function Signatures

### ✅ CORRECT: Use Assertions

```python
def test_user_creation():
    """Test that user can be created with valid data."""
    # Arrange
    user_data = {"email": "test@example.com", "name": "Test User"}

    # Act
    user = create_user(user_data)

    # Assert
    assert user is not None, "User should be created"
    assert user.email == user_data["email"], "Email should match"
    assert user.name == user_data["name"], "Name should match"
```

### ❌ WRONG: Don't Return Values

```python
def test_user_creation():
    # ... test code ...
    return True  # ❌ WRONG - causes PytestReturnNotNoneWarning
```

### ❌ WRONG: Don't Use Try/Except

```python
def test_user_creation():
    try:
        # ... test code ...
        return True
    except Exception:
        return False  # ❌ WRONG - not proper pytest pattern
```

## Pytest Markers

### Using Markers

```python
@pytest.mark.unit
def test_simple_calculation():
    """Unit test - fast, isolated."""
    assert 2 + 2 == 4

@pytest.mark.integration
def test_database_connection():
    """Integration test - tests component interaction."""
    db = connect_to_database()
    assert db is not None

@pytest.mark.e2e
def test_complete_user_workflow():
    """End-to-end test - tests full system."""
    # Complete workflow test
    pass

@pytest.mark.slow
def test_heavy_computation():
    """Slow test - takes significant time."""
    pass

@pytest.mark.requires_browser
def test_browser_automation():
    """Requires Playwright browser."""
    pass
```

### Running Tests by Marker

```bash
# Run only unit tests
pytest -m unit

# Run all except slow tests
pytest -m "not slow"

# Run unit or integration tests
pytest -m "unit or integration"

# Run tests with specific marker
pytest -m workflow
```

## Pytest Fixtures

### Basic Fixture Pattern

```python
import pytest

@pytest.fixture
def sample_user():
    """Fixture providing test user data."""
    return {
        "id": 1,
        "email": "test@example.com",
        "name": "Test User"
    }

def test_user_email(sample_user):
    """Test that uses the fixture."""
    assert sample_user["email"] == "test@example.com"
```

### Fixture Scopes

```python
@pytest.fixture(scope="function")  # Default - new instance per test
def fresh_database():
    pass

@pytest.fixture(scope="class")  # Shared across test class
def shared_resource():
    pass

@pytest.fixture(scope="module")  # Shared across module
def expensive_setup():
    pass

@pytest.fixture(scope="session")  # Shared across entire session
def global_config():
    pass
```

## Assertion Patterns

### ✅ Good Assertions

```python
# With descriptive messages
assert user is not None, "User should be created"
assert len(users) > 0, "Should have at least one user"
assert user.email == expected_email, f"Expected {expected_email}, got {user.email}"

# Using pytest.raises for exceptions
with pytest.raises(ValueError, match="Invalid email"):
    create_user({"email": "invalid"})

# Using pytest.warns for warnings
with pytest.warns(DeprecationWarning):
    deprecated_function()
```

### ❌ Poor Assertions

```python
assert user  # Vague - what about user?
assert len(users) == 1  # No message - hard to debug
assert user.email == expected_email  # No context on failure
```
