---
description: DRY (Don't Repeat Yourself) principles and enforcement strategies
alwaysApply: true
---

# DRY Principles & Enforcement

## DRYPrinciple Maxim (FUNDAMENTAL)

Don't Repeat Yourself - eliminate duplication at all levels. Search deeply for
existing code, import and reuse rather than create new. Look for opportunities
to remain DRY at all times.

**Nuance:** Thoroughly investigate codebase for existing implementations,
utilities, patterns, and functions before writing new code.

## Before Writing ANY Code

**MANDATORY SEARCH for existing:**

1. **Database helpers** - Connection managers, query builders, transaction
   handlers
2. **Validation functions** - Input validators, schema validators, data
   sanitizers
3. **API wrappers** - HTTP clients, service clients, API integrations
4. **Utility classes** - String utils, date utils, file utils, data transformers
5. **Config handlers** - Environment loaders, settings managers, feature flags
6. **Error handlers** - Exception classes, error formatters, logging utilities
7. **Authentication/Authorization** - Auth middleware, permission checkers,
   token handlers
8. **Data models** - Entity classes, DTOs, schemas, type definitions
9. **Test utilities** - Test fixtures, mocks, factories, test helpers
10. **Common patterns** - Decorators, middleware, interceptors, guards

## DRY Enforcement Process

### 1. Investigation Phase

```
BEFORE writing new code:
1. Use codebase-retrieval to search for similar functionality
2. Check for existing utility modules and helper functions
3. Review common patterns in the codebase
4. Identify reusable components
```

### 2. Reuse Phase

```
WHEN existing code found:
1. Import and use existing implementations
2. Extend existing classes/functions if needed
3. Compose existing utilities rather than rewriting
4. Document dependencies on shared code
```

### 3. Refactor Phase

```
WHEN duplication detected:
1. Extract common functionality immediately
2. Create shared utilities or base classes
3. Update all instances to use shared code
4. Remove duplicate implementations
```

## Common Duplication Patterns

### Pattern 1: Repeated Conditionals

**❌ Bad:**

```python
if user.role == 'admin' or user.role == 'superadmin':
    # ... (repeated in multiple places)
```

**✅ Good:**

```python
def is_admin(user):
    return user.role in ['admin', 'superadmin']

if is_admin(user):
    # ...
```

### Pattern 2: Duplicate Configurations

**❌ Bad:**

```python
# In file1.py
DATABASE_URL = "postgresql://..."

# In file2.py
DATABASE_URL = "postgresql://..."
```

**✅ Good:**

```python
# In config.py
DATABASE_URL = os.getenv('DATABASE_URL')

# In other files
from config import DATABASE_URL
```

### Pattern 3: Similar Classes

**❌ Bad:**

```python
class UserValidator:
    def validate_email(self, email): ...
    def validate_phone(self, phone): ...

class AdminValidator:
    def validate_email(self, email): ...  # Duplicate!
    def validate_phone(self, phone): ...  # Duplicate!
```

**✅ Good:**

```python
class BaseValidator:
    def validate_email(self, email): ...
    def validate_phone(self, phone): ...

class UserValidator(BaseValidator):
    pass  # Inherits validation methods

class AdminValidator(BaseValidator):
    pass  # Inherits validation methods
```

## Examples of DRY Application

### Example 1: Validation Logic

Instead of writing new validation:

```python
# SEARCH FIRST for existing validators
# Found: utils/validators.py with validate_email(), validate_phone()
from utils.validators import validate_email, validate_phone
```

### Example 2: API Clients

Instead of creating new API client:

```python
# SEARCH FIRST for existing service clients
# Found: services/api_client.py with BaseAPIClient
from services.api_client import BaseAPIClient

class MyServiceClient(BaseAPIClient):
    # Reuse connection, auth, error handling
    pass
```

### Example 3: Database Operations

Instead of writing new database code:

```python
# SEARCH FIRST for existing database utilities
# Found: db/repository.py with BaseRepository
from db.repository import BaseRepository

class UserRepository(BaseRepository):
    # Reuse CRUD operations, transactions
    pass
```

## Refactoring Checklist

When you detect duplication:

- [ ] Extract common functionality into shared module
- [ ] Create utility functions for repeated logic
- [ ] Establish base classes for similar classes
- [ ] Consolidate configuration into shared constants
- [ ] Update all instances to use shared code
- [ ] Remove ALL duplicate implementations
- [ ] Document the shared component
- [ ] Add tests for the shared component
