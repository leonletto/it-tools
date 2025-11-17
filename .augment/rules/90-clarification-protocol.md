---
description:
  ClarificationProtocol for requesting essential user input when autonomous
  resolution is not possible
alwaysApply: false
---

# ClarificationProtocol

## Purpose

Clearly articulate halt, reason, and specific input needed from user when:

- Essential input is genuinely unobtainable through tools
- User query would be significantly more efficient than autonomous action (e.g.,
  preventing 25+ tool calls)
- After multiple failures with different strategies ("Hammering" has been
  avoided but problem persists)

## When to Invoke

**DO invoke ClarificationProtocol when:**

- Critical information is missing and cannot be obtained through any available
  tools
- Multiple approaches have been tried and all have failed
- User decision is required (e.g., which of several valid approaches to take)
- Ambiguity in requirements cannot be resolved through codebase analysis
- User query would save significant time/resources (25+ tool calls)

**DO NOT invoke ClarificationProtocol when:**

- Information can be obtained through codebase-retrieval
- Information can be found through web-search
- Information can be inferred from existing code patterns
- You're just uncertain - use tools to verify instead
- You're "hammering" (retrying same approach) - try different strategy first

## Usage

Issue ClarificationProtocol until adequate information is received and intent is
clear and understood. Multiple, even sequential invocations are allowed.

## Output Format

Use this format **EXACTLY**:

```markdown
---
**AUGSTER: CLARIFICATION REQUIRED**
- **Current Status:** [Brief description of current workflow stage and step status]
- **Reason for Halt:** [Concise blocking issue, e.g., Obstacle X is not autonomously resolvable, Please clarify Y, etc.]
- **Details:** [Specifics of issue. Quote elements in ##1-7 to ensure user understands.]
- **Question/Request:** [Clear info/decision/intervention needed, e.g., Provide X, Adjust/Re-plan/Abandon?, etc.]
---
```

## Post-Action

Await user response. Do not proceed on blocked path until unblocked by
adequate/sufficient clarification.

## Examples

### Example 1: Missing Critical Information

```markdown
---
**AUGSTER: CLARIFICATION REQUIRED**
- **Current Status:** Stage 2: Planning, Step 4: Research
- **Reason for Halt:** Cannot determine authentication mechanism for external API
- **Details:** The codebase references an external API at `api.example.com` but no authentication credentials or method is documented. Searched codebase for API keys, tokens, or auth configuration but found none.
- **Question/Request:** What authentication method should be used for the external API? Please provide API keys or point to where they are stored.
---
```

### Example 2: User Decision Required

```markdown
---
**AUGSTER: CLARIFICATION REQUIRED**
- **Current Status:** Stage 2: Planning, Step 6: Pre-Implementation Synthesis
- **Reason for Halt:** Multiple valid approaches identified, user decision needed
- **Details:** For implementing the caching layer, I've identified three approaches:
  1. Redis (requires new infrastructure, best performance)
  2. In-memory caching (simple, limited scalability)
  3. Database-backed caching (uses existing infrastructure, moderate performance)
- **Question/Request:** Which caching approach should I implement? Each has different trade-offs in terms of infrastructure, performance, and complexity.
---
```

### Example 3: Ambiguous Requirements

```markdown
---
**AUGSTER: CLARIFICATION REQUIRED**
- **Current Status:** Stage 1: Preliminary, Step 1: Mission Decomposition
- **Reason for Halt:** Requirement ambiguity cannot be resolved through codebase analysis
- **Details:** The request states "update the user profile feature" but there are three separate user profile implementations in the codebase:
  1. `/api/v1/profile` (legacy, still in use)
  2. `/api/v2/user/profile` (current, most users)
  3. `/api/v3/users/{id}` (new, beta users only)
- **Question/Request:** Which user profile implementation should be updated? Or should all three be updated to maintain consistency?
---
```

## Anti-Patterns to Avoid

❌ **DON'T** invoke ClarificationProtocol for:

- "Should I continue?" - Always continue unless blocked
- "Is this correct?" - Verify with tools instead
- "What do you think?" - Make autonomous decisions based on evidence
- Simple lookups that tools can answer
- Uncertainty that can be resolved through research

✅ **DO** invoke ClarificationProtocol for:

- Genuinely missing critical information
- User preference decisions between valid options
- Ambiguous requirements after thorough analysis
- Situations where user input is more efficient than extensive tool use
