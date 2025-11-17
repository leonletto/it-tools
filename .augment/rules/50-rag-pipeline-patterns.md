---
description:
  RAG Pipeline development patterns, web scraping, content extraction, and LLM
  integration standards
alwaysApply: false
---

# RAG Pipeline Development Patterns

Standards for building RAG (Retrieval-Augmented Generation) pipelines, web
scraping systems, content extraction tools, and LLM integration.

---

## Core Architecture Principles

### Component Reusability

- **ALWAYS** check for existing components before building new ones
- Reuse proven components from working examples:
  - `BrowserAutomationTool` for browser lifecycle
  - `HTMLCache` for HTML caching
  - `HierarchicalConverter` for HTML→Markdown+JSON
  - `ContentFilter` for removing unwanted elements
  - `ChainAnalysisService` for LLM integration

### Configuration-Driven Design

- Create comprehensive configuration classes using `@dataclass`
- Include 50-100+ parameters for flexibility
- Implement validation in `__post_init__()` method
- Provide helper methods like `get_url()`, `to_dict()`
- Support multiple providers (e.g., Ollama and OpenAI for LLM)

**Example**:

```python
from dataclasses import dataclass
from typing import Literal, Optional

@dataclass
class ExtractionConfig:
    """Configuration for content extraction."""

    # Extraction parameters
    max_depth: int = 4
    max_pages: Optional[int] = None

    # Caching
    cache_enabled: bool = True
    cache_db_path: str = "cache/html_cache.db"
    cache_ttl_seconds: int = 2592000  # 30 days

    # LLM Integration
    llm_provider: Literal["openai", "ollama"] = "ollama"
    llm_base_url: Optional[str] = "http://localhost:11434"
    llm_model: str = "qwen3:30b-a3b-instruct-2507-q4_K_M"

    def __post_init__(self):
        """Validate configuration after initialization."""
        if self.max_depth < 0:
            raise ValueError(f"max_depth must be non-negative, got {self.max_depth}")
        if self.llm_provider not in ["openai", "ollama"]:
            raise ValueError(f"Invalid llm_provider: {self.llm_provider}")
```

---

## HTML Caching Patterns

### Shared Cache Database

- **ALWAYS** use the centralized cache classes from `src.cache`
- **NEVER** create duplicate cache implementations
- Default path: `cache/html_cache.db`
- Share the same database across all extraction tools

**Location**: `rag_pipeline/src/cache/html_cache.py`

- `CacheConfig` - Configuration dataclass
- `HTMLCache` - SQLite-based cache with compression

**Critical Rule**: When multiple tools extract from the same domain, share the
cache database to:

- Avoid re-fetching the same content
- Save bandwidth and time
- Enable fast iteration during development

### Cache Import & Configuration

```python
# ✅ CORRECT: Import from centralized location
from src.cache import HTMLCache, CacheConfig

# Configure cache
cache_config = CacheConfig(
    enabled=True,
    cache_db_path="cache/html_cache.db",  # Shared path
    ttl_seconds=2592000,  # 30 days (default: 86400)
    force_refresh=False,
    compression_level=6   # zlib compression (0-9)
)

# Create cache instance
cache = HTMLCache(cache_config)

# Use with context manager (automatically closes connection)
with HTMLCache(cache_config) as cache:
    # Get from cache
    html = cache.get(url)
    if html is None:
        # Cache miss - fetch from web
        html = await page.content()
        cache.set(url, html)
```

**❌ NEVER DO THIS**:

```python
# Creating custom cache class
class MyCustomCache:  # ❌ WRONG - use HTMLCache
    pass

# Duplicating cache implementation
def cache_html(url, html):  # ❌ WRONG - use HTMLCache.set()
    pass
```

### Cache Performance

- **Target**: 70%+ compression ratio
- **TTL**: 30 days default (2,592,000 seconds)
- **Hit Rate**: Aim for 97%+ on subsequent runs
- **Database Size**: Monitor and optimize for large extractions

---

## Browser Automation Patterns

### Browser Lifecycle Management

- Use `BrowserAutomationTool` context manager
- Always use `async with` for proper cleanup
- Configure browser type: `chromium` for headless, `firefox` for debugging
- Set appropriate timeouts: 30,000ms (30 seconds) default

```python
from src.browser_automation_tool import BrowserAutomationTool
from src.utils import Config

browser_config = Config(
    headless=True,
    browser_type='chromium',  # or 'firefox'
    output_dir='output/extraction',
    page_timeout=30000,
    debug=False
)

async with BrowserAutomationTool(browser_config) as browser:
    await browser.navigate(url)
    # Extract content
```

### Wait Strategies

- Use appropriate wait strategies for dynamic content:
  - `wait_for_selector()` - Wait for specific element
  - `wait_for_network_idle()` - Wait for network requests to complete
  - `asyncio.sleep()` - Fixed delays (use sparingly)

### Pagination Handling

- Extract pagination parameters from URL
- Calculate offset: `offset = (page_number - 1) * items_per_page`
- Track visited pages to avoid loops
- Respect rate limits with delays between requests

---

## Content Extraction Patterns

### Content Filtering

- **ALWAYS** create content filter presets for each target site
- Remove unwanted elements BEFORE parsing:
  - Navigation elements (`nav`, `header`, `footer`)
  - Cookie banners and consent dialogs
  - Social media widgets
  - Advertisement containers
  - Search bars and filters

```python
from src.extractors import ContentFilter

filter = ContentFilter(
    exclude_selectors=[
        'nav', 'header', 'footer', 'aside',
        '.cookie-banner', '.navigation', '.toc',
        'script', 'noscript'
    ]
)
result = filter.filter_html(html)
```

### Section Parsing

- Identify section headings (h1, h2, h3)
- Extract content between headings
- Preserve structure (lists, tables, code blocks)
- Track parent-child relationships

### Cross-Reference Extraction

- Use regex patterns to find references (e.g., KB article numbers)
- Extract from both text content and links
- Deduplicate references
- Track reference types (prerequisite, related, see_also)
- Follow references 1 level deep only (prevent infinite loops)

---

## LLM Integration Patterns

### Local Ollama Configuration

- **Prefer** local Ollama over cloud APIs for:
  - Cost savings (no API fees)
  - Data privacy (sensitive content)
  - Consistent availability
  - Faster iteration during development

### Prompt Design Principles

1. **Structured Instructions**: Clear, numbered sections
2. **Explicit Output Format**: Specify JSON structure exactly
3. **Validation Rules**: Include constraints and valid values
4. **Examples**: Provide concrete examples for edge cases
5. **Confidence Scoring**: Request confidence level (0.0-1.0)

**Example Prompt Structure**:

````python
CATEGORIZATION_PROMPT = """You are an expert at analyzing [domain] content.

**Input Data:**
Title: {title}
URL: {url}
Content: {content}

**Instructions:**
Extract the following information:

**1. FIELD_NAME**: Description of what to extract. Choose ONE from:
- option1 (description)
- option2 (description)

**2. FIELD_NAME**: List all [items] mentioned (array).

**Output Format:**
Return ONLY a valid JSON object:
```json
{{
  "field_name": "...",
  "field_array": [...],
  "confidence": 0.0
}}
````

**Confidence Score**: Rate 0.0-1.0 based on explicitness of information. """

````

### Response Parsing & Validation
```python
def parse_llm_response(response: str) -> Dict[str, Any]:
    """Parse and validate LLM response."""
    # Extract JSON from markdown code blocks
    json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # Try raw JSON
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON found in response")
        json_str = json_match.group(0)

    # Parse JSON
    result = json.loads(json_str)

    # Validate required fields
    required_fields = ['field1', 'field2', 'confidence']
    for field in required_fields:
        if field not in result:
            raise ValueError(f"Missing required field: {field}")

    # Validate confidence range
    if not (0 <= result['confidence'] <= 1):
        result['confidence'] = 0.5  # Default to medium confidence

    return result
````

### Error Handling & Retries

- Implement retry logic (3 attempts default)
- Handle timeout errors gracefully
- Validate responses before accepting
- Log failures for debugging
- Provide fallback mechanisms

---

## JSON Optimization Patterns

### Element Reference System

- Store full data once in metadata arrays
- Use references in DOM content to avoid duplication
- Achieve 70-80%+ size reduction

**Example**:

```json
{
  "tables": [{ "index": 0, "headers": ["col1", "col2"], "rows": [["a", "b"]] }],
  "dom_content": {
    "div_1": {
      "table_1": { "table_ref": 0 } // Reference instead of full data
    }
  }
}
```

### Compact Identifiers

- Use short IDs instead of full text
- Section paths: `["sec_0", "sec_1"]` not `["Introduction", "Getting Started"]`
- Heading references: `parent_heading_index: 7` not
  `parent_heading_text: "Setup Guide"`

### Distributed Output

- **Prefer** one JSON file per extracted item
- Create hierarchical directory structure
- Generate central metadata index
- Enables parallel processing and incremental updates

---

## Testing RAG Pipelines

### Sample Collection First

- Create sample collection script before full extraction
- Collect 10-200 samples for analysis
- Test with samples before full run
- Analyze structure, patterns, edge cases

### LLM Testing

- Create dedicated test script for LLM categorization
- Test with real samples, not synthetic data
- Measure accuracy against manual categorization
- Validate consistency across multiple runs
- Test timeout and error handling

### Performance Metrics

Track and document:

- Cache hit rate (target: 97%+)
- Extraction time per page
- JSON size reduction (target: 70%+)
- LLM response time
- LLM accuracy (target: 95%+)

---

## Documentation Standards

### Extraction System Documentation

For each extraction system, create these docs in `[project]/docs/`:

1. **Structure Analysis** (`*_STRUCTURE_ANALYSIS.md`)
   - Target website structure
   - Content sections and patterns
   - Metadata available
   - Cross-reference patterns

2. **Sample Analysis Results** (`*_SAMPLE_ANALYSIS_RESULTS.md`)
   - Sample collection summary
   - Quality assessment
   - Key findings
   - Cache performance

3. **User Guides** (separate guide per tool)
   - Installation and setup
   - Usage instructions
   - Command-line options
   - Troubleshooting

4. **Progress Tracking** (`*_EXTRACTION_PROGRESS.md`)
   - Phase completion status
   - Architecture decisions
   - Component inventory
   - Next steps

5. **Test Results** (`*_TEST_RESULTS.md`)
   - LLM accuracy metrics
   - Performance statistics
   - Quality assessment

### Documentation Placement

- **Code**: `[project]/examples/` for scripts
- **Documentation**: `[project]/docs/` for all markdown files
- **Never** put README files in `examples/` directory

---

## Configuration Files

### Extraction Config Pattern

```python
@dataclass
class ExtractionConfig:
    # Limits
    max_items: Optional[int] = None
    items_per_page: int = 100

    # Caching (shared with other tools)
    cache_enabled: bool = True
    cache_db_path: str = "cache/html_cache.db"
    cache_ttl_seconds: int = 2592000

    # LLM (support multiple providers)
    llm_enabled: bool = True
    llm_provider: Literal["openai", "ollama"] = "ollama"
    llm_base_url: Optional[str] = "http://localhost:11434"
    llm_model: str = "model-name"
    llm_temperature: float = 0.1
    llm_timeout: int = 120

    # Output
    output_dir: str = "output/extracted"
    output_structure: Literal["categorized", "flat", "hierarchical"] = "categorized"
    json_strategy: Literal["distributed", "single"] = "distributed"

    # Behavior
    skip_existing: bool = True
    wait_between_requests: float = 1.0
    max_retries: int = 3
```

---

## Common Patterns

### Orchestration Script Structure

```python
async def main():
    """Main entry point for extraction."""
    # 1. Parse arguments
    parser = argparse.ArgumentParser()
    # ... add arguments
    args = parser.parse_args()

    # 2. Create configuration
    config = ExtractionConfig(
        max_items=args.max_items,
        cache_enabled=not args.no_cache,
        # ... other config
    )

    # 3. Initialize components
    cache = HTMLCache(CacheConfig(...))
    async with BrowserAutomationTool(browser_config) as browser:
        # 4. Run extraction
        extractor = Extractor(config=config)
        results = await extractor.extract(browser)

        # 5. Process with LLM (if enabled)
        if config.llm_enabled:
            categorizer = LLMCategorizer(config)
            results = await categorizer.categorize(results)

        # 6. Save outputs
        output_manager = OutputManager(config)
        stats = output_manager.save(results)

        # 7. Display statistics
        print(f"Extracted: {stats['total']}")
        print(f"Cache hits: {stats['cache_hits']}")
```

### Error Handling Pattern

```python
async def extract_with_retry(
    url: str,
    max_retries: int = 3,
    wait_between: float = 2.0
) -> str:
    """Extract with exponential backoff retry."""
    for attempt in range(max_retries):
        try:
            return await extract_content(url)
        except TimeoutError as e:
            if attempt == max_retries - 1:
                raise
            wait_time = wait_between * (2 ** attempt)
            await asyncio.sleep(wait_time)
        except Exception as e:
            logger.error(f"Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                raise
```

---

## Best Practices Summary

### DO ✅

- Reuse existing components (`BrowserAutomationTool`, `HTMLCache`, etc.)
- Share cache databases across related tools
- Create comprehensive configuration classes
- Filter content before parsing
- Use element references to reduce JSON size
- Test LLM prompts with real samples
- Document extraction systems thoroughly
- Track performance metrics
- Implement retry logic
- Use local Ollama for development

### DON'T ❌

- Create duplicate cache implementations
- Hardcode configuration values
- Skip content filtering
- Duplicate data in JSON output
- Skip sample collection phase
- Put documentation in `examples/` directory
- Ignore cache performance
- Skip validation of LLM responses
- Use cloud APIs for development/testing
- Extract without rate limiting

---

## Example: Complete Extraction Flow

```python
# 1. Sample Collection (Phase 1)
python rag_pipeline/examples/sample_collector.py --max-items 10

# 2. Analyze samples and design prompt (Phase 2)
# Review output/samples/ and create categorization prompt

# 3. Test LLM categorization (Phase 2.5)
python rag_pipeline/examples/test_llm_categorization.py --article SAMPLE_ID

# 4. Implement extractors (Phase 3)
# - Configuration class
# - Search navigator
# - Content extractor
# - LLM categorizer
# - Cross-reference handler

# 5. Create main script (Phase 3)
python rag_pipeline/examples/main_extraction.py --max-items 100

# 6. Full extraction (Phase 4)
python rag_pipeline/examples/main_extraction.py

# 7. Generate embeddings (Phase 5)
python rag_pipeline/examples/generate_embeddings.py
```

---

## References

### Core Components (Centralized in `src/`)

**Cache System**:

- `rag_pipeline/src/cache/html_cache.py` - HTMLCache and CacheConfig classes
- `rag_pipeline/src/cache/__init__.py` - Public exports

**Browser Automation**:

- `rag_pipeline/src/browser_automation_tool.py` - Browser management

**Content Processing**:

- `rag_pipeline/src/extractors/hierarchical_converter.py` - Content conversion
- `rag_pipeline/src/extractors/content_filter.py` - Content filtering
- `rag_pipeline/src/extractors/hierarchical_docs_extractor.py` - Main extractor

**Configuration**:

- `rag_pipeline/src/extractors/extraction_config.py` - ExtractionConfig
- `rag_pipeline/src/extractors/kb_extraction_config.py` - KBExtractionConfig

**Prompts**:

- `rag_pipeline/src/prompts/kb_article_categorization_prompt.py` - LLM prompts

### Example Implementations

- `rag_pipeline/examples/omnissa_docs_extraction_hierarchical.py` -
  Production-ready hierarchical extraction
- `rag_pipeline/examples/kb_sample_collector.py` - Sample collection pattern
- `rag_pipeline/examples/test_kb_llm_categorization.py` - LLM testing pattern

### Documentation Templates

- `rag_pipeline/docs/KB_ARTICLE_STRUCTURE_ANALYSIS.md` - Structure analysis
  template
- `rag_pipeline/docs/KB_SAMPLE_ANALYSIS_RESULTS.md` - Sample analysis template
- `rag_pipeline/docs/KB_EXTRACTION_PROGRESS.md` - Progress tracking template

---

**Version**: 1.0  
**Last Updated**: 2024-10-31  
**Status**: Production-Ready
