---
type: "always_apply"
---

# Augment Rules for The Augster

This directory contains modular rules files that complement the
`augment_user_guidelines` file. These rules provide focused, context-specific
guidance to Augment's AI assistant.

## Architecture Overview

The Augster configuration uses a three-tier architecture:

1. **User Guidelines** (`augment_user_guidelines`) - High-level identity, core
   maxims, operational loop
2. **Always Rules** (`.augment/rules/`) - Core principles applied to every
   interaction
3. **Context-Specific Rules** (`.augment/rules/`) - Auto/Manual modes for
   specialized guidance

## File Organization

### Core Rules (Always Applied)

- **`00-augster-identity.md`** - The Augster's fundamental identity and
  personality traits
  - Core purpose, communication standards, and scope control
  - **Integration Mode:** Always

- **`01-core-maxims.md`** - All fundamental maxims and favourite heuristics
  - PrimedCognition, AppropriateComplexity, Autonomy, PurposefulToolLeveraging
    (with Augment-specific tools), etc.
  - SOLID, SMART, TestPyramid, DefensiveProgramming, etc.
  - **Integration Mode:** Always

- **`02-strict-success.md`** - Strict success criteria and verification
  standards
  - Prevents false success claims when tests fail
  - Defines what TRUE SUCCESS means
  - **Integration Mode:** Always

- **`03-dry-principles.md`** - DRY (Don't Repeat Yourself) enforcement
  - Mandatory search before writing code
  - Common duplication patterns and fixes
  - **Integration Mode:** Always

- **`20-project-structure.md`** - Project structure and organization standards
  - Directory organization, configuration management, environment consistency
  - **Integration Mode:** Always

### Workflow Rules (Auto-Applied Based on Context)

- **`10-holistic-workflow.md`** - Comprehensive workflow for complex tasks
  - Stages: Preliminary → Planning → Implementation → Verification →
    Post-Implementation
  - Use for: New features, complex refactoring, multi-step implementations
  - **Integration Mode:** Auto (applied for complex tasks)

- **`11-express-workflow.md`** - Streamlined workflow for simple tasks
  - Use for: Simple questions, direct edits, straightforward requests
  - Still maintains safety and verification standards
  - **Integration Mode:** Auto (applied for simple tasks)

### Testing Rules (Auto-Applied for Test Files)

- **`30-testing-standards.md`** - General testing standards (framework-agnostic)
  - Test pyramid, TDD principles, mocking strategy, test documentation
  - **Integration Mode:** Auto (applied for test files)

- **`31-pytest-standards.md`** - Pytest-specific patterns and best practices
  - Pytest configuration, fixtures, markers, assertion patterns
  - **Integration Mode:** Auto (applied for Python test files)

### Language-Specific Rules (Auto-Applied Based on File Type)

- **`40-python-standards.md`** - Python coding standards and patterns
  - PEP 8, type hints, error handling, async/await, common patterns
  - **Integration Mode:** Auto (applied for .py files)

- **`41-typescript-javascript-standards.md`** - TypeScript/JavaScript standards
  - TypeScript configuration, naming conventions, async patterns, error handling
  - **Integration Mode:** Auto (applied for .ts, .tsx, .js, .jsx files)

- **`42-react-patterns.md`** - React-specific patterns and hooks
  - Component structure, custom hooks, state management, performance
    optimization
  - **Integration Mode:** Auto (applied for .tsx, .jsx files)

- **`43-go-api-standards.md`** - Go-specific coding standards and patterns
  - API development with net/http, ServeMux, RESTful design, Go idioms
  - **Integration Mode:** Auto (applied for .go files)

- **`44-markdown-standards.md`** - Markdown documentation standards
  - Formatting rules, linting best practices, readability guidelines
  - **Integration Mode:** Auto (applied for .md files)

- **`45-bash-scripting-standards.md`** - Bash scripting best practices
  - Shellcheck compliance, proper quoting, exit code handling
  - **Integration Mode:** Auto (applied when editing .sh files or when
    shellcheck warnings present)

### Domain-Specific Rules (Auto-Applied Based on Context)

- **`50-rag-pipeline-patterns.md`** - RAG Pipeline development patterns
  - Web scraping, content extraction, LLM integration standards
  - **Integration Mode:** Auto (applied for RAG/extraction work)

- **`51-llm-prompt-engineering.md`** - LLM prompt engineering standards
  - Local Ollama integration, response validation patterns
  - **Integration Mode:** Auto (applied for LLM/prompt work)

### Protocol Rules (Manual/On-Demand)

- **`90-clarification-protocol.md`** - ClarificationProtocol for requesting user
  input
  - When to invoke, output format, examples
  - **Integration Mode:** Manual (invoked when needed)

- **`91-performance-optimization.md`** - Performance optimization strategies
  - Database optimization, caching, frontend performance
  - **Integration Mode:** Manual (invoked for performance work)

- **`92-security-best-practices.md`** - Security best practices
  - Authentication, input validation, sensitive data handling
  - **Integration Mode:** Manual (invoked for security work)

- **`99-database-migration-checklist.md`** - Database migration procedures
  - Pre-migration, execution, post-migration, rollback checklists
  - **Integration Mode:** Manual (invoked with @database-migration)

## Integration Modes

### Always Apply (`alwaysApply: true`)

Rules that are included in every AI interaction:

- Core identity and personality
- Fundamental maxims and heuristics
- Success criteria and verification standards
- DRY principles
- Augment-specific guidelines

### Auto Apply (`alwaysApply: false` with `description`)

Rules that Augment applies based on context:

- Workflow rules (based on task complexity)
- Language-specific rules (based on file type)
- Domain-specific patterns (based on conversation topic)

### Manual Apply (`alwaysApply: false` without auto-trigger)

Rules that are only included when explicitly needed:

- ClarificationProtocol
- Specialized checklists
- On-demand procedures

## Usage Guide

### How Rules Are Applied

1. **Always Rules** - Loaded for every interaction
2. **Auto Rules** - Augment decides based on context (task complexity, file
   types, topics)
3. **Manual Rules** - Only loaded when explicitly needed

### Workflow Selection

Augment automatically selects the appropriate workflow:

- **Holistic Workflow**: Complex tasks requiring planning
- **Express Workflow**: Simple tasks not requiring planning

The selection is made based on task analysis and is always visibly outputted
(e.g., "[EXPRESS MODE ACTIVATED]").

### Invoking Manual Rules

Manual rules like ClarificationProtocol are invoked when needed during workflow
execution.

## Maintenance

### Regular Review

- Update rules as project standards evolve
- Remove obsolete rules
- Refactor for clarity

### Token Management

- Keep Always rules concise and focused
- Use Auto Apply for most detailed guidelines
- Monitor rule effectiveness

### Version Control

- Commit all `.augment/rules/` to repository
- Document changes in commit messages
- Review rules during code review process

## Migration from the-augster.xml

This modular architecture replaces the monolithic `the-augster.xml` file (24,544
characters) with:

- Streamlined User Guidelines (6,481 characters)
- Focused, modular rules files
- Context-aware loading for improved efficiency

**Benefits:**

- Reduced context consumption (load only relevant rules)
- Better maintainability (modular, focused files)
- Clearer separation of concerns
- Easier to update specific domains

## Character Counts

### Core Files

- `augment_user_guidelines`: 9,632 characters (comprehensive reference to all 21
  rules files)

### Always-Applied Rules (~18,500 characters)

- `00-augster-identity.md`: 2,650 characters (includes scope control)
- `01-core-maxims.md`: 5,750 characters (includes Augment-specific tools)
- `02-strict-success.md`: 2,274 characters
- `03-dry-principles.md`: 4,619 characters
- `20-project-structure.md`: 3,381 characters
- **Total Always:** ~18,700 characters

### Auto-Applied Rules (Context-Aware)

**Workflows (~13,500 characters):**

- `10-holistic-workflow.md`: 9,131 characters
- `11-express-workflow.md`: 4,337 characters

**Testing (~10,200 characters):**

- `30-testing-standards.md`: 5,394 characters
- `31-pytest-standards.md`: 4,847 characters

**Language-Specific (~40,000 characters):**

- `40-python-standards.md`: 9,373 characters
- `41-typescript-javascript-standards.md`: 12,917 characters
- `42-react-patterns.md`: 3,452 characters
- `43-go-api-standards.md`: 2,502 characters
- `44-markdown-standards.md`: 8,307 characters
- `45-bash-scripting-standards.md`: 5,957 characters

**Domain-Specific (~35,200 characters):**

- `50-rag-pipeline-patterns.md`: 16,904 characters
- `51-llm-prompt-engineering.md`: 18,262 characters

### Manual Rules (~34,500 characters)

- `90-clarification-protocol.md`: 4,686 characters
- `91-performance-optimization.md`: 12,289 characters
- `92-security-best-practices.md`: 14,973 characters
- `99-database-migration-checklist.md`: 1,536 characters

### Total Context Load Examples

- **Simple task (Express):** ~32,600 characters (User Guidelines + Always +
  Express)
- **Complex task (Holistic):** ~37,500 characters (User Guidelines + Always +
  Holistic)
- **Python coding:** ~37,800 characters (User Guidelines + Always + Python
  standards)
- **Python testing:** ~48,400 characters (User Guidelines + Always + Python +
  Testing standards)
- **React development:** ~44,600 characters (User Guidelines + Always + TS/JS +
  React)
- **RAG development:** ~80,300 characters (User Guidelines + Always + Python +
  RAG + LLM)
- **Performance work:** ~40,500 characters (User Guidelines + Always +
  Performance optimization)
- **Security work:** ~43,200 characters (User Guidelines + Always + Security
  best practices)

## Resources

- [Augment Rules Documentation](https://docs.augmentcode.com/setup-augment/guidelines)
- [The Augster GitHub Repository](https://github.com/leonletto/the-augster)

## Support

For issues or suggestions:

1. Review existing rules for conflicts
2. Check rule descriptions and integration modes
3. Verify frontmatter YAML syntax
4. Open an issue in The Augster repository
