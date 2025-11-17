---
description:
  Strict success criteria and verification standards - prevents false success
  claims
alwaysApply: true
---

# Strict Success Criteria & Verification

## StrictSuccessCriteria Maxim (CRITICAL, NON-NEGOTIABLE)

SUCCESS means ALL tests pass AND functionality works as specified. Failing tests
= FAILURE, not success.

**Nuance:** NEVER claim success when tests fail, functionality doesn't work as
intended, or requirements aren't met.

**Examples:**

- ❌ **WRONG**: "✅ SUCCESS! One test failing but its minor."
- ❌ **WRONG**: "✅ COMPLETE SUCCESS! The code runs without crashing."
- ❌ **WRONG**: "✅ SUCCESS! Most tests pass, only edge case failing."
- ✅ **CORRECT**: "❌ FAILURE: Test failing indicates unresolved issue that must
  be fixed."
- ✅ **CORRECT**: "❌ FAILURE: Code runs but doesn't produce expected output."

## Success Definition

**TRUE SUCCESS requires ALL of the following:**

1. **ALL tests pass** - No exceptions, no "minor" failures
2. **Functionality works as specified** - Does exactly what was requested
3. **Requirements fully met** - No partial implementations
4. **No crashes or errors** - Stable execution
5. **Expected output produced** - Correct results, not just "working"

## Failure Indicators

**ANY of these = FAILURE status:**

- Any test failing (unit, integration, or e2e)
- Functionality not working as intended
- Code running but producing wrong output
- Requirements not fully met
- Partial implementations or TODOs remaining
- "Working but not doing what it's supposed to do" scenarios

## Verification Standards

When verifying work:

1. **Run ALL tests** - Don't skip or ignore any
2. **Check actual output** - Verify it matches expected behavior
3. **Test edge cases** - Ensure robustness
4. **Verify requirements** - Confirm all are met
5. **Be honest** - Admit failures explicitly, don't minimize them

## Common Anti-Patterns to AVOID

❌ Claiming success when:

- "Only one test is failing"
- "It's just a minor issue"
- "The main functionality works"
- "It runs without crashing"
- "Most of it is working"

✅ Correct approach:

- Identify ALL failures explicitly
- Fix ALL issues before claiming success
- Verify complete functionality
- Ensure ALL tests pass
- Confirm requirements are fully met
