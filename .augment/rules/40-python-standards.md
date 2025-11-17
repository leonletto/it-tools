---
type: "agent_requested"
description: "Python-specific coding standards, patterns, and best practices"
---

# Python Coding Standards

## Environment & Setup

### Virtual Environment

- **ALWAYS** use Python in `venv/bin/python` or `.venv/bin/python`
- Activate virtual environment before running any Python code
- Keep dependencies isolated per project

### Dependency Management

```bash
# requirements.txt for production dependencies
# requirements-dev.txt for development dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Code Style

### Follow PEP 8

- Use snake_case for variables and functions
- Use PascalCase for classes
- Use UPPER_CASE for constants
- Maximum line length: 88 characters (Black formatter standard)

### Type Hints (Required)

```python
from typing import List, Dict, Optional, Union

def process_users(
    users: List[Dict[str, str]],
    filter_active: bool = True
) -> List[Dict[str, str]]:
    """Process user list with optional filtering."""
    return [u for u in users if not filter_active or u.get('active')]
```

### Docstrings (Required)

Use Google-style or NumPy-style docstrings:

```python
def calculate_average(numbers: List[float]) -> float:
    """
    Calculate the average of a list of numbers.

    Args:
        numbers: List of numeric values to average

    Returns:
        The arithmetic mean of the input numbers

    Raises:
        ValueError: If the input list is empty

    Examples:
        >>> calculate_average([1, 2, 3, 4, 5])
        3.0
    """
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")
    return sum(numbers) / len(numbers)
```

## Imports Organization

```python
# Standard library imports
import os
import sys
from datetime import datetime

# Third-party imports
import requests
import pandas as pd
from flask import Flask, request

# Local application imports
from app.models import User
from app.services.email import EmailService
```

## Error Handling

### Use Specific Exceptions

```python
# ❌ BAD - Too broad
try:
    result = risky_operation()
except Exception:
    pass

# ✅ GOOD - Specific and handled
try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Invalid value: {e}")
    raise
except ConnectionError as e:
    logger.error(f"Connection failed: {e}")
    return default_value
```

### Custom Exceptions

```python
class DataValidationError(Exception):
    """Raised when data validation fails."""
    pass

class ServiceUnavailableError(Exception):
    """Raised when external service is unavailable."""
    pass
```

## Defensive Programming

### Input Validation

```python
def divide(a: float, b: float) -> float:
    """Safely divide two numbers."""
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("Both arguments must be numeric")

    if b == 0:
        raise ValueError("Cannot divide by zero")

    return a / b
```

### Use Context Managers

```python
# ✅ GOOD - Automatic resource cleanup
with open('data.txt', 'r') as f:
    data = f.read()

# ✅ GOOD - Custom context manager
from contextlib import contextmanager

@contextmanager
def database_connection(db_url: str):
    conn = create_connection(db_url)
    try:
        yield conn
    finally:
        conn.close()
```

## Data Classes (Python 3.7+)

```python
from dataclasses import dataclass, field
from typing import List

@dataclass
class User:
    """User data model."""
    id: int
    email: str
    name: str
    roles: List[str] = field(default_factory=list)
    is_active: bool = True

    def has_role(self, role: str) -> bool:
        """Check if user has specific role."""
        return role in self.roles
```

## Async/Await (When Applicable)

```python
import asyncio
from typing import List

async def fetch_data(url: str) -> dict:
    """Fetch data from URL asynchronously."""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def fetch_multiple(urls: List[str]) -> List[dict]:
    """Fetch multiple URLs concurrently."""
    tasks = [fetch_data(url) for url in urls]
    return await asyncio.gather(*tasks)
```

## Testing

### pytest Standards

```python
import pytest
from app.services.user_service import UserService

class TestUserService:
    """Test suite for UserService."""

    @pytest.fixture
    def user_service(self):
        """Create UserService instance for testing."""
        return UserService(config=test_config)

    @pytest.fixture
    def sample_user(self):
        """Create sample user for testing."""
        return {
            'id': 1,
            'email': 'test@example.com',
            'name': 'Test User'
        }

    def test_create_user_success(self, user_service, sample_user):
        """Test successful user creation."""
        # Arrange
        expected_id = sample_user['id']

        # Act
        result = user_service.create_user(sample_user)

        # Assert
        assert result['id'] == expected_id
        assert result['email'] == sample_user['email']

    def test_create_user_invalid_email(self, user_service):
        """Test user creation with invalid email."""
        # Arrange
        invalid_user = {'email': 'not-an-email', 'name': 'Test'}

        # Act & Assert
        with pytest.raises(ValueError, match="Invalid email format"):
            user_service.create_user(invalid_user)
```

## Logging

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('output/logs/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def process_data(data: dict) -> dict:
    """Process data with logging."""
    logger.info(f"Processing data: {data.get('id')}")

    try:
        result = transform_data(data)
        logger.debug(f"Transform successful: {result}")
        return result
    except Exception as e:
        logger.error(f"Processing failed: {e}", exc_info=True)
        raise
```

## Common Patterns

### Services Pattern

```python
# services/user_service.py
from typing import Optional
from app.models import User
from app.repositories import UserRepository

class UserService:
    """Service layer for user operations."""

    def __init__(self, repository: UserRepository):
        self.repository = repository

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Retrieve user by email address."""
        if not email or '@' not in email:
            raise ValueError("Invalid email format")

        return self.repository.find_by_email(email)

    def create_user(self, user_data: dict) -> User:
        """Create new user with validation."""
        self._validate_user_data(user_data)
        return self.repository.create(user_data)

    def _validate_user_data(self, data: dict) -> None:
        """Validate user data before creation."""
        required_fields = ['email', 'name']
        missing = [f for f in required_fields if f not in data]

        if missing:
            raise ValueError(f"Missing required fields: {missing}")
```

### Repository Pattern

```python
# repositories/user_repository.py
from typing import List, Optional
from app.models import User
from app.database import db_session

class UserRepository:
    """Data access layer for User model."""

    def find_by_id(self, user_id: int) -> Optional[User]:
        """Find user by ID."""
        return db_session.query(User).filter(User.id == user_id).first()

    def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email."""
        return db_session.query(User).filter(User.email == email).first()

    def create(self, user_data: dict) -> User:
        """Create new user."""
        user = User(**user_data)
        db_session.add(user)
        db_session.commit()
        return user

    def update(self, user: User) -> User:
        """Update existing user."""
        db_session.commit()
        return user
```

## Performance Considerations

### List Comprehensions vs Loops

```python
# ✅ GOOD - List comprehension (faster)
squares = [x**2 for x in range(1000)]

# ❌ SLOWER - Traditional loop
squares = []
for x in range(1000):
    squares.append(x**2)
```

### Generators for Large Data

```python
def read_large_file(file_path: str):
    """Read large file line by line using generator."""
    with open(file_path, 'r') as f:
        for line in f:
            yield line.strip()

# Usage - memory efficient
for line in read_large_file('large_file.txt'):
    process_line(line)
```

## Security Best Practices

### Never Hardcode Secrets

```python
import os
from dotenv import load_dotenv

load_dotenv()

# ✅ GOOD - From environment
API_KEY = os.getenv('API_KEY')
DATABASE_URL = os.getenv('DATABASE_URL')

# ❌ BAD - Hardcoded
# API_KEY = 'sk-1234567890abcdef'
```

### SQL Injection Prevention

```python
# ✅ GOOD - Parameterized query
cursor.execute(
    "SELECT * FROM users WHERE email = %s",
    (email,)
)

# ❌ BAD - String formatting
# cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
```
