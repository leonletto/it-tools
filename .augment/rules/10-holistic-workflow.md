---
description:
  Holistic workflow for complex tasks requiring comprehensive planning and
  implementation
alwaysApply: false
---

# Holistic Workflow

**Use for:** Complex tasks, new features, multi-step implementations,
refactoring requiring planning

**Throughline:** Comprehensive, Full-Spectrum, Complete

## Stage 1: Preliminary

**Objective:** Prepare for effective and accurate planning, ensuring all info is
present for robust and efficacious plan.

### Step 1: Mission Acknowledgment & Decomposition

- Ensure `## 1. Mission` is available, acknowledge it as the main/ultimate
  Mission to be accomplished
- Decompose the Mission into the Workload
- Output the result in `## 2. Mission Decomposition`

### Step 2: Pre-existing Tech Analysis

- **Crucial for accuracy:** Proactively search workspace files (ProvCTX and
  ObtaCTX) for relevant pre-existing elements
- Apply DRY principles - search for existing implementations before creating new
- Output in `## 3. Pre-existing Tech Analysis`

### Step 3: Preliminary Checkpoint

- Think critically and scrutinize: Preliminary stage's Objective achieved?
- If yes: Proceed to Planning stage

## Stage 2: Planning

**Objective:** Produce a comprehensive and 'appropriately complex' (per
AppropriateComplexity) plan to successfully execute the Workload to ultimately
accomplish the Mission.

**Guidance:** Your plan must be formed through adherence to ALL maxims. Apply
particularly deep/thorough PrimedCognition and PurposefulToolLeveraging.

### Step 4: Research

- Examine and evaluate all Preliminary output to ID ambiguity, info gaps,
  unknown vocabulary/libs/tech
- Use PurposefulToolLeveraging or ClarificationProtocol to resolve
  ambiguity/uncertainty
- **CRITICAL:** PARTICULARLY STRICT ADHERENCE TO EmpiricalRigor AND HIGH
  CONFIDENCE BOTH MANDATORY
- Output in `## 4. Research` (e.g. Using tool X to clarify Y, Using tool A to
  determine the best dependency to achieve B)

### Step 5: Tech to Introduce

- Briefly state **final** choices regarding **NEW** tech to add (researched
  in ## 4. Research)
- Output in `## 5. Tech to Introduce`
- Link to REQs identified in ## 1. Mission and ## 2. Mission Decomposition

### Step 6: Pre-Implementation Synthesis

- Synthesize a brief and high-level executive summary of how you envision
  fulfilling the Workload
- Reference elements from ##1-5
- Think of this as a quick mental practice-run of the Workload
- Output this executive summary in `## 6. Pre-Implementation Synthesis`

### Step 7: Impact Analysis

- Examine the executive summary you've just outputted in ## 6.
  Pre-Implementation Synthesis
- **Consider its impact:** Code signature changes requiring caller updates,
  ripple effects, performance implications, security risks, etc.
- Theorize and outline possible mitigations when theorized potential risks are
  actually encountered
- Output all of this in `## 7. Impact Analysis`
- Proactively perform an adversarial self-critique (Red Teaming) on your
  thoughts, appending this critique to ## 7. Impact Analysis
- Theorize additional solutions for any issues identified during this
  self-critique, also appending these to ## 7. Impact Analysis

### Step 8: Plan Attestation

- Perform the final attestation of the plan's integrity
- Conduct a thoughtful, holistic and critical review
- Certify that the synthesized plan (##1-7) and its corresponding Workload are
  coherent, robust, feasible, and free of unmitigated risks or assumptions
- **Upon successful attestation:** Proceed to Implementation stage
- **Should the plan fail this final scrutiny:** Autonomously start a new cycle
  of the OperationalLoop, revising the Mission based on the identified
  deficiencies. This autonomous recursion continues until the plan achieves a
  state worthy of attestation.

## Stage 3: Implementation

**Objective:** Flawlessly execute plan (##1-7) by iterating **ALL** ##2 items
with surgical precision, application of **ALL** maxims, maintained focus,
fulfilling (sub)tasks as detailed whilst considering/using tools on-the-fly per
PurposefulToolLeveraging. Continuously employ PrimedCognition.

**Guidance:**

- Whenever ambiguity/unexpected issues arise: resolve per Autonomy
- Whenever internal or task-trajectory-based uncertainty arises: Reaffirm
  trajectory by reconsulting plan (##1-7, esp. ##6)
- Maximize continuous, autonomous implementation per Autonomy
- **Reminder:** Use `PROGRESS.md` when appropriate

### Step 9: Implementation Execution

- **MANDATORY:** Apply TestDrivenDevelopment - Write tests FIRST for each item
  in ##2 before implementation
- Then iterate through each item ensuring item-completion (per [M]easurable)
  before proceeding to the next item
- Output in `##8. Implementation` followed by items as
  `##8.X.(Y, etc. Depending on task largeness/scope). [very brief description; e.g. creating service X, updating resolver Y, etc.]`

### Step 10: Cleanup Actions

- Perform a comprehensive double-check/final-pass of PurityAndCleanliness
- Ensure **ALL** generated code/artifacts are ready for the Verification stage
- Verify all obsolete imports, variables, and files are removed
- When **ANY** action is required: invoke and output in `##9. Cleanup Actions`
- (No such actions? State "N/A")

### Step 10a: Test Infrastructure

- **MANDATORY:** Create comprehensive test infrastructure per
  TestingInfrastructure standards
- Ensure all tests pass and generate test reports
- Output in `##9a. Test Infrastructure`

### Step 11: PROGRESS.md Cleanup

- Delete the `PROGRESS.md` 'living-document' if it exists (task is done,
  task-state file now redundant)

### Step 12: Implementation Checkpoint

- Think critically and scrutinize: Implementation's Objective achieved?
- If yes: Proceed
- If no: resolve per Autonomy reiterating Implementation until 'yes'

## Stage 4: Verification

**Objective:** Ensure the **ENTIRE** Mission, planned during ##1-7 and executed
during ##8-10, is accomplished with **FULL** and **UNEQUIVOCAL** adherence to
**ANY/ALL** maxims.

**Nuance:** Objectivity, transparency and honesty are **MANDATORY**, **VITAL**
and **NON-NEGOTIABLE**. DO NOT 'hide' failures in attempt to satisfy.

**Guidance:** Fulfil Verification stage's Objective based on **ALL** checks
defined below. Scrutinize each checklist-item, Output PASS, PARTIAL or FAIL.

### Verification Checklist Output Format:

```markdown
---

**AUGSTER: VERIFICATION**

- AppropriateComplexity: [Solution met AppropriateComplexity and deferred
  valuable ideas/suggestions earmarked for ##11? Output PASS/PARTIAL/FAIL].
- PlanExecution: [All ##2 items iterated and fully implemented in ##8 WITHOUT
  placeholders, truncation or "TODO"/"will implement later"/"in future update"
  references? Output PASS/PARTIAL/FAIL].
- ImpactHandled: [Resolved concerns/issues/remarks raised in ##7 (per
  Perceptivity)? Output PASS/PARTIAL/FAIL].
- AugsterStandards: [Generated code adheres to standards defined (esp. maxims
  and heuristics)? Output PASS/PARTIAL/FAIL].
- CleanupPerformed: [PurityAndCleanliness continuously enforced and final pass
  performed within ##9? Output PASS/PARTIAL/FAIL]
- CodebaseIntegrity: [Used codebase-retrieval before changes, understood
  existing patterns, checked for similar functions, verified dependencies?
  Output PASS/PARTIAL/FAIL].
- TestCoverage: [ALL tests passing? ANY failing test = FAIL. Functionality
  working as specified? Output PASS only if BOTH true, otherwise FAIL].
- FunctionalityVerification: [Code doing exactly what was requested? Working
  without crashes ≠ working correctly. Output PASS/FAIL].
- ResponseQuality: [No hallucination, verified all claims with tools, admitted
  uncertainties explicitly, provided specific error analysis? Output
  PASS/PARTIAL/FAIL]. `Final Outcome:` `Status:` [PASS | PARTIAL | FAIL]
  <!-- May only 'PASS' when **ALL** checks 'PASS' --> `Summary:` [Concise: e.g.,
  Task complete. | Critical fails: [List]. | PARTIAL: "Up to [Decomp Step X.Y]"
  or Remaining: [List unimplemented REQs/##1 steps].]
```

### Step 14: Conduct Verification

- Conduct VerificationChecklist then output results in `## 11. Verification`
- Match the OutputFormat **EXACTLY**

### Step 15: Final Verdict

- Render a final verdict by conducting a deep PrimedCognition cycle to
  scrutinize the VerificationChecklist within your ## 11. Verification report
- A unanimous `PASS` on all items certifies mission completion, authorizing you
  to proceed to Post-Implementation
- Any `FAIL` or `PARTIAL` result mandates corrective action: finish the current
  OperationalLoop cycle, then **AUTONOMOUSLY** formulate a new remedial Mission
  from the deficiencies and initiate a new OperationalLoop cycle with it
- This autonomous recursion continues until a flawless verification is achieved

## Stage 5: Post-Implementation

### Step 16: Suggestions

- Recall ideas/features/alternatives correctly earmarked and excluded from plan
  (##1-7) per AppropriateComplexity
- Output in `## 12. Suggestions`
- (No such ideas? State "N/A")

### Step 17: Summary

- Briefly restate rundown of how the Mission was accomplished
- Include any elements that were cleaned-up during ## 10. Cleanup Actions for
  future reference
- Output in `## 13. Summary`
