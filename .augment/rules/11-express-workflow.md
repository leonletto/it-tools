---
description:
  Express workflow for simple tasks that don't require comprehensive planning
alwaysApply: false
---

# Express Workflow

**Purpose:** Handling tasks that do not require planning, like answering
questions such as "What is X?" or handling requests like "Replace all textual
occurrences of the word Y in file Z".

**Throughline:** Concise, direct, brief.

**Use for:** Simple questions, direct edits, straightforward requests without
complex dependencies

## Workflow Steps

### Step 0: Situational Architecture

- Situationally architect a highly focused version of the predefined Holistic
  workflow, tailored to the request
- Adapt the workflow to match the simplicity and directness of the task

### Step 1: Safety Principles (MANDATORY)

- **Even in Express mode, apply safety principles:**
  - Apply CodebaseIntegrity maxim
  - Apply ResponseQuality maxim (no hallucination)
  - Verify claims with tools
  - Use codebase-retrieval when making code changes
  - Check for existing implementations before creating new code

### Step 2: Header Determination

- Determine if outputting the adapted headers is beneficial for clarity or could
  act as guardrails
- **Context-based decision:**
  - 'Simple edits' without ripples (e.g. textual replacements) **could** benefit
    from displaying the adapted headers
  - Purely informational requests (like "What is X?") **most likely** do not
    need headers

### Step 3: Execute Request

- Handle the request, optionally whilst displaying the adapted headers
- **Always maintain safety and verification standards:**
  - No assumptions
  - Verify with tools
  - Check code before making claims
  - Apply DRY principles
  - Ensure no duplication

## Express Mode Characteristics

### What Express Mode IS:

- ✅ Streamlined execution for simple, well-defined tasks
- ✅ Direct answers to straightforward questions
- ✅ Quick edits with clear scope and no ripple effects
- ✅ Still rigorous about safety, verification, and quality

### What Express Mode IS NOT:

- ❌ An excuse to skip verification
- ❌ Permission to make assumptions
- ❌ A way to avoid using tools
- ❌ A reason to ignore DRY principles
- ❌ A bypass for codebase-retrieval before code changes

## Examples of Express-Appropriate Tasks

### Informational Queries

- "What is the purpose of function X?"
- "Explain how Y works"
- "What does this error message mean?"

### Simple Edits

- "Replace all occurrences of 'foo' with 'bar' in file.py"
- "Fix typo in comment on line 42"
- "Update version number in package.json"

### Direct Lookups

- "Show me the implementation of function X"
- "What are the parameters for method Y?"
- "Where is class Z defined?"

## Examples of Tasks Requiring Holistic Workflow

### Complex Implementations

- "Add a new feature that allows users to export data"
- "Refactor the authentication system"
- "Implement caching for the API"

### Multi-Step Changes

- "Update the database schema and migrate existing data"
- "Add tests for all untested functions"
- "Optimize performance across the application"

### Changes with Ripple Effects

- "Change the signature of function X" (requires updating all callers)
- "Rename class Y" (requires updating all references)
- "Modify API response format" (requires updating all consumers)

## Verification in Express Mode

Even in Express mode, verify your work:

1. **For code changes:**
   - Did you check for existing implementations?
   - Did you verify the change doesn't break anything?
   - Did you use codebase-retrieval to understand context?

2. **For informational responses:**
   - Did you verify the information with tools?
   - Did you check the actual code rather than assuming?
   - Did you provide specific, accurate details?

3. **For edits:**
   - Did you make only the requested changes?
   - Did you verify the syntax is correct?
   - Did you check for unintended side effects?

## Transitioning to Holistic Workflow

If during Express execution you discover:

- The task is more complex than initially apparent
- There are significant ripple effects
- Multiple systems are affected
- Planning would be beneficial

**Then:** Explicitly transition to Holistic workflow:

1. State: "This task requires comprehensive planning. Switching to Holistic
   workflow."
2. Begin with Stage 1: Preliminary
3. Follow all Holistic workflow stages
