---
description:
  LLM prompt engineering standards, local Ollama integration, and response
  validation patterns
alwaysApply: false
---

# LLM Integration & Prompt Engineering Standards

Standards for designing LLM prompts, integrating with local Ollama/OpenAI APIs,
parsing responses, and validating LLM outputs.

---

## Local LLM Setup (Ollama)

### Why Use Local Ollama

**PREFER** local Ollama over cloud APIs for development and testing:

- ✅ **Cost**: No API fees
- ✅ **Privacy**: Sensitive data stays local
- ✅ **Availability**: No rate limits or outages
- ✅ **Speed**: Fast iteration during development
- ✅ **Consistency**: Reproducible results

### Configuration Pattern

```python
@dataclass
class LLMConfig:
    """Configuration for LLM integration."""

    # Provider
    llm_provider: Literal["openai", "ollama"] = "ollama"
    llm_base_url: Optional[str] = "http://localhost:11434"

    # Model
    llm_model: str = "qwen3:30b-a3b-instruct-2507-q4_K_M"
    llm_temperature: float = 0.1  # Low for deterministic results
    llm_max_tokens: int = 1000
    llm_timeout: int = 120  # seconds

    # Retry & Validation
    llm_retry_attempts: int = 3
    llm_min_confidence: float = 0.5
```

### Ollama API Integration

```python
import httpx

async def call_ollama_llm(
    prompt: str,
    model: str = "qwen3:30b-a3b-instruct-2507-q4_K_M",
    base_url: str = "http://localhost:11434",
    temperature: float = 0.1,
    max_tokens: int = 1000,
    timeout: int = 120
) -> str:
    """Call local Ollama LLM API."""
    url = f"{base_url}/api/generate"

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens
        }
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "")
```

---

## Prompt Design Principles

### Structure Your Prompts

**1. Context Section**

```python
prompt = """You are an expert at [domain/task description].

**Input Data:**
Field1: {field1}
Field2: {field2}
Content: {content}
"""
```

**2. Instructions Section**

```python
"""
**Instructions:**
Analyze the content and extract the following information:

**1. FIELD_NAME**: Description of what to extract. Choose ONE from:
- option1 (when to use this)
- option2 (when to use this)

**2. ARRAY_FIELD**: List all [items] (array). Include:
- Type 1 items
- Type 2 items
Do NOT include items that only appear in [excluded location].

**3. CONFIDENCE**: Rate your confidence (0.0-1.0):
- 1.0: All information explicitly stated
- 0.8-0.9: Most explicit, minor inference
- 0.6-0.7: Moderate inference required
- <0.5: High uncertainty
"""
```

**3. Output Format Section**

````python
"""
**Output Format:**
Return ONLY a valid JSON object with this exact structure (no additional text):

```json
{{
  "field_name": "...",
  "array_field": [...],
  "confidence": 0.0
}}
````

**Important:**

- Return ONLY JSON, no explanations
- Use empty arrays [] for missing data, not null
- Use empty string "" for missing values
- Ensure valid JSON syntax """

````

### Prompt Template Pattern
```python
# Define template with clear structure
CATEGORIZATION_PROMPT = """You are an expert at analyzing {domain} content.

**Article Information:**
Title: {title}
URL: {url}

**Article Content:**
{content}

**Instructions:**
[Detailed instructions...]

**Output Format:**
[JSON structure...]
"""

def build_prompt(title: str, url: str, content: str, max_length: int = 8000) -> str:
    """Build prompt with content truncation."""
    if len(content) > max_length:
        content = content[:max_length] + "\n\n[Content truncated...]"

    return CATEGORIZATION_PROMPT.format(
        domain="knowledge base",
        title=title,
        url=url,
        content=content
    )
````

---

## Prompt Engineering Best Practices

### Be Explicit About Filtering

When you want to exclude certain data from extraction:

```python
"""
**7. RELATED_ITEMS**: List items mentioned in main content (array).

**CRITICAL FILTERING RULE**:
- ✅ INCLUDE: Items mentioned in Section1, Section2, Section3
- ❌ EXCLUDE: Items that ONLY appear in cross-reference titles
- ❌ EXCLUDE: Items in "Additional Resources" section

Example: If the content says "Product A is affected", include it.
But if "Product B" only appears in "Related Article: ...Product B...",
exclude it.
"""
```

### Use Examples for Edge Cases

```python
"""
**Extraction Rules:**

Example 1: Direct mention
Content: "This feature works with Product A and Product B"
Extract: ["Product A", "Product B"]

Example 2: Cross-reference only
Content: "See KB123: Product C Setup Guide"
Extract: [] (exclude, only in cross-reference title)

Example 3: Mixed
Content: "Product A is affected. See KB123: Product B Guide"
Extract: ["Product A"] (A is in main content, B is only in cross-ref)
"""
```

### Confidence Scoring Guidelines

Always request confidence and provide clear guidelines:

```python
"""
**Confidence Score (0.0-1.0):**
- 1.0: All information explicitly stated in the content
- 0.9: Most explicit, 1-2 minor inferences
- 0.8: Some inference but clear context
- 0.7: Moderate inference required
- 0.6: Significant inference from limited info
- 0.5: High uncertainty, ambiguous content
- <0.5: Very uncertain, insufficient information

Always include confidence in your JSON response.
"""
```

---

## Response Parsing & Validation

### Parse JSON from Response

````python
import re
import json
from typing import Dict, Any

def parse_llm_response(response: str) -> Dict[str, Any]:
    """
    Parse LLM response and extract JSON.

    Handles:
    - JSON in markdown code blocks
    - Raw JSON
    - Extra text around JSON
    """
    # Try to find JSON in markdown code blocks
    json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # Try to find raw JSON object
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
        else:
            raise ValueError(f"No JSON found in response: {response[:200]}")

    try:
        result = json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}\nJSON: {json_str[:200]}")

    return result
````

### Validate Response Structure

```python
def validate_llm_response(
    response: Dict[str, Any],
    required_fields: List[str],
    array_fields: List[str],
    enum_fields: Dict[str, List[str]]
) -> List[str]:
    """
    Validate LLM response structure and content.

    Returns:
        List of validation error messages (empty if valid)
    """
    issues = []

    # Check required fields exist
    for field in required_fields:
        if field not in response:
            issues.append(f"Missing required field: {field}")

    # Ensure arrays are actually arrays
    for field in array_fields:
        if field in response and not isinstance(response[field], list):
            issues.append(f"Field '{field}' must be array, got: {type(response[field])}")
            # Auto-fix: convert to empty array
            response[field] = []

    # Validate enum values
    for field, valid_values in enum_fields.items():
        if field in response and response[field] not in valid_values:
            issues.append(f"Invalid {field}: {response[field]} (must be one of {valid_values})")

    # Validate confidence if present
    if 'confidence' in response:
        try:
            confidence = float(response['confidence'])
            if not (0 <= confidence <= 1):
                issues.append(f"Confidence out of range [0,1]: {confidence}")
                response['confidence'] = 0.5  # Auto-fix
        except (ValueError, TypeError):
            issues.append(f"Invalid confidence type: {response['confidence']}")
            response['confidence'] = 0.5  # Auto-fix

    return issues
```

### Complete Validation Example

```python
def parse_and_validate_categorization(response: str) -> Dict[str, Any]:
    """Parse and validate KB categorization response."""
    # Parse JSON
    result = parse_llm_response(response)

    # Define validation rules
    required_fields = [
        'primary_product', 'product_version', 'article_type',
        'severity', 'confidence'
    ]
    array_fields = [
        'secondary_versions', 'platforms', 'related_products',
        'components', 'key_topics', 'prerequisites', 'cross_references'
    ]
    enum_fields = {
        'article_type': ['troubleshooting', 'known-issue', 'informational',
                        'how-to', 'best-practices', 'security', 'announcement'],
        'severity': ['critical', 'high', 'medium', 'low', 'info']
    }

    # Validate
    issues = validate_llm_response(result, required_fields, array_fields, enum_fields)

    if issues:
        raise ValueError(f"Validation failed: {', '.join(issues)}")

    return result
```

---

## Error Handling & Retries

### Retry Pattern with Exponential Backoff

```python
async def call_llm_with_retry(
    prompt: str,
    max_retries: int = 3,
    base_delay: float = 2.0,
    timeout: int = 120
) -> Dict[str, Any]:
    """Call LLM with retry logic."""
    for attempt in range(max_retries):
        try:
            # Call LLM
            response = await call_ollama_llm(prompt, timeout=timeout)

            # Parse and validate
            result = parse_and_validate_categorization(response)

            # Check confidence threshold
            if result['confidence'] < 0.5:
                logger.warning(f"Low confidence: {result['confidence']}")

            return result

        except httpx.TimeoutException:
            if attempt == max_retries - 1:
                raise
            wait_time = base_delay * (2 ** attempt)
            logger.warning(f"Timeout on attempt {attempt + 1}, retrying in {wait_time}s")
            await asyncio.sleep(wait_time)

        except ValueError as e:
            # Parsing or validation error
            if attempt == max_retries - 1:
                raise
            logger.error(f"Parse error on attempt {attempt + 1}: {e}")
            await asyncio.sleep(base_delay)

        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise
```

### Fallback Mechanisms

```python
async def categorize_with_fallback(content: str) -> Dict[str, Any]:
    """Categorize with fallback to manual categorization."""
    try:
        # Try LLM categorization
        result = await call_llm_with_retry(content)
        return result

    except Exception as e:
        logger.error(f"LLM categorization failed: {e}")

        # Fallback: Return minimal categorization
        return {
            'primary_product': 'Unknown',
            'product_version': '',
            'secondary_versions': [],
            'article_type': 'informational',
            'platforms': [],
            'severity': 'info',
            'related_products': [],
            'components': [],
            'key_topics': [],
            'prerequisites': [],
            'cross_references': [],
            'confidence': 0.0,
            'llm_failed': True
        }
```

---

## Testing LLM Integration

### Test Script Pattern

```python
async def test_llm_categorization(
    article_file: Path,
    model: str,
    verbose: bool = False
) -> Dict[str, Any]:
    """Test LLM categorization on a single article."""
    # Load article
    with open(article_file, 'r') as f:
        article = json.load(f)

    # Build prompt
    prompt = build_categorization_prompt(**article)

    if verbose:
        print("PROMPT:")
        print(prompt[:1000] + "...")

    # Call LLM
    response = await call_ollama_llm(prompt, model=model)

    if verbose:
        print("\nRAW RESPONSE:")
        print(response)

    # Parse and validate
    categorization = parse_and_validate_categorization(response)

    print("\nPARSED CATEGORIZATION:")
    print(json.dumps(categorization, indent=2))

    # Validate
    issues = validate_categorization(categorization)
    if issues:
        print("\n⚠️  Validation Issues:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("\n✅ Valid!")

    return {
        'success': True,
        'categorization': categorization,
        'validation_issues': issues
    }
```

### Measure Quality

```python
def measure_categorization_quality(
    predicted: Dict[str, Any],
    expected: Dict[str, Any]
) -> Dict[str, float]:
    """Measure categorization quality against expected results."""
    metrics = {}

    # Exact match fields
    for field in ['primary_product', 'product_version', 'article_type', 'severity']:
        metrics[f'{field}_match'] = 1.0 if predicted[field] == expected[field] else 0.0

    # Array overlap (Jaccard similarity)
    for field in ['platforms', 'components', 'key_topics', 'cross_references']:
        pred_set = set(predicted[field])
        exp_set = set(expected[field])
        if not pred_set and not exp_set:
            metrics[f'{field}_overlap'] = 1.0
        elif not pred_set or not exp_set:
            metrics[f'{field}_overlap'] = 0.0
        else:
            intersection = len(pred_set & exp_set)
            union = len(pred_set | exp_set)
            metrics[f'{field}_overlap'] = intersection / union if union > 0 else 0.0

    # Overall accuracy
    metrics['overall_accuracy'] = sum(metrics.values()) / len(metrics)

    return metrics
```

---

## Batch Processing

### Batch with Rate Limiting

```python
async def categorize_batch(
    articles: List[Dict[str, Any]],
    batch_size: int = 5,
    delay_between_batches: float = 2.0
) -> List[Dict[str, Any]]:
    """Categorize articles in batches with rate limiting."""
    results = []

    for i in range(0, len(articles), batch_size):
        batch = articles[i:i+batch_size]

        # Process batch in parallel
        tasks = [categorize_article(article) for article in batch]
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)

        # Handle results
        for article, result in zip(batch, batch_results):
            if isinstance(result, Exception):
                logger.error(f"Failed to categorize {article['id']}: {result}")
                results.append({'id': article['id'], 'error': str(result)})
            else:
                results.append(result)

        # Rate limiting delay
        if i + batch_size < len(articles):
            await asyncio.sleep(delay_between_batches)

    return results
```

---

## Model Selection

### Recommended Models

**Development/Testing (Fast)**:

- `qwen3:4b-instruct` - Fast, good quality
- `qwen3:1.7b-fp16` - Very fast, decent quality

**Production (Best Quality)**:

- `qwen3:30b-a3b-instruct-2507-q4_K_M` - Excellent quality, reasonable speed
- `qwen2.5-coder:1.5b` - For code-heavy content

**Embedding (Future RAG)**:

- `nomic-embed-text:137m-v1.5-fp16` - Fast, high quality embeddings

### Model Configuration

```python
# For development
DEV_MODEL = "qwen3:4b-instruct"
DEV_TEMPERATURE = 0.1
DEV_TIMEOUT = 60

# For production
PROD_MODEL = "qwen3:30b-a3b-instruct-2507-q4_K_M"
PROD_TEMPERATURE = 0.1
PROD_TIMEOUT = 120
```

---

## Prompt Versioning

### Track Prompt Changes

```python
# rag_pipeline/src/prompts/kb_categorization_prompt.py

PROMPT_VERSION = "1.1"
PROMPT_CHANGELOG = """
v1.1 (2024-10-31):
- Added explicit filtering rule for related_products
- Clarified prerequisites vs cross-references distinction
- Improved example for edge cases

v1.0 (2024-10-30):
- Initial categorization prompt
- 12 categorization dimensions
- Confidence scoring
"""

KB_CATEGORIZATION_PROMPT = f"""
[Prompt Version {PROMPT_VERSION}]

You are an expert at analyzing content...
"""
```

### Document Improvements

Create `PROMPT_IMPROVEMENTS.md` to track:

- Issue identified
- Solution implemented
- Before/after comparison
- Test results
- Impact assessment

---

## Best Practices Summary

### DO ✅

- Use local Ollama for development and testing
- Structure prompts clearly (Context → Instructions → Output Format)
- Request confidence scores
- Provide explicit filtering rules with examples
- Parse JSON from markdown code blocks
- Validate all responses before accepting
- Implement retry logic with exponential backoff
- Test prompts with real data, not synthetic
- Measure quality against manual categorization
- Version and document prompt changes
- Use low temperature (0.1) for deterministic results
- Batch requests with rate limiting

### DON'T ❌

- Use cloud APIs for development (expensive, rate-limited)
- Write vague or ambiguous instructions
- Accept responses without validation
- Skip confidence scoring
- Ignore parsing errors
- Use high temperature for categorization tasks
- Test only with synthetic data
- Make breaking changes without versioning
- Process all items in single batch
- Skip error handling and retries

---

## Example: Complete LLM Integration

```python
# 1. Define prompt
from src.prompts import KB_CATEGORIZATION_PROMPT, build_kb_categorization_prompt

# 2. Configure LLM
config = LLMConfig(
    llm_provider="ollama",
    llm_model="qwen3:30b-a3b-instruct-2507-q4_K_M",
    llm_temperature=0.1
)

# 3. Build prompt with article data
prompt = build_kb_categorization_prompt(
    title=article['title'],
    url=article['url'],
    kb_number=article['kb_number'],
    content=article['full_text']
)

# 4. Call LLM with retry
response = await call_llm_with_retry(prompt, max_retries=3)

# 5. Validate result
if response['confidence'] < 0.5:
    logger.warning(f"Low confidence: {response['confidence']}")

# 6. Save result
output = {
    **article,
    'categorization': response,
    'prompt_version': PROMPT_VERSION
}
```

---

**Version**: 1.0  
**Last Updated**: 2024-10-31  
**Status**: Production-Ready
