---
type: "agent_requested"
description: "Markdown documentation standards, formatting rules, and linting best when editing md files"
---

# Markdown Standards

## Core Principles

### Readability First

- Write for humans first, tools second
- Balance line length with readability
- Use proper heading hierarchy
- Add blank lines for visual separation

### Consistency

- Follow markdownlint rules consistently
- Use same formatting patterns throughout
- Maintain uniform code block styling
- Apply consistent emphasis usage

### Maintainability

- Use semantic headings (not emphasis)
- Keep line lengths reasonable
- Specify code block languages
- Avoid duplicate heading names

## Markdownlint Configuration

### Configuration Files

- **`.markdownlint.json`** - Linting rules configuration
- **`.markdownlintignore`** - Files/directories to ignore
- **`output/`** - Always ignored (build artifacts)
- **`vendor/`** - Always ignored (dependencies)

### Standard Configuration

```json
{
  "default": true,
  "MD013": {
    "line_length": 120,
    "code_blocks": false,
    "tables": false
  },
  "MD033": false,
  "MD041": false
}
```

## Common Rules and Fixes

### MD013: Line Length

**Rule**: Lines should not exceed 120 characters

**Exceptions**:

- Code blocks (excluded)
- Tables (excluded)
- URLs (wrap in angle brackets)

**Fixes**:

```markdown
<!-- ❌ Bad: Long line -->

This is a very long line that exceeds 120 characters and should be broken up
into multiple lines for better readability.

<!-- ✅ Good: Wrapped line -->

This is a very long line that exceeds 120 characters and should be broken up
into multiple lines for better readability.

<!-- ❌ Bad: Bare URL -->

Visit https://very-long-url.example.com/path/to/resource

<!-- ✅ Good: Wrapped URL -->

Visit <https://very-long-url.example.com/path/to/resource>
```

### MD031: Blank Lines Around Fenced Code

**Rule**: Fenced code blocks must be surrounded by blank lines

**Fix**:

````markdown
<!-- ❌ Bad: No blank lines -->

Some text

```bash
code here
```
````

More text

<!-- ✅ Good: Blank lines added -->

Some text

```bash
code here
```

More text

### MD032: Blank Lines Around Lists

**Rule**: Lists must be surrounded by blank lines

**Fix**:

```markdown
<!-- ❌ Bad: No blank lines -->

Some text

- Item 1
- Item 2 More text

<!-- ✅ Good: Blank lines added -->

Some text

- Item 1
- Item 2

More text
```

### MD040: Fenced Code Language

**Rule**: Fenced code blocks must specify a language

**Common Languages**:

- `bash` - Shell commands
- `terraform` or `hcl` - Terraform configuration
- `json` - JSON data
- `yaml` - YAML configuration
- `go` - Go code
- `text` - Plain text output
- `diff` - Diff output

**Fix**:

````markdown
<!-- ❌ Bad: No language -->

```
terraform apply
```

<!-- ✅ Good: Language specified -->

```bash
terraform apply
```
````

### MD036: Emphasis as Heading

**Rule**: Don't use bold/italic as heading replacement

**Fix**:

```markdown
<!-- ❌ Bad: Bold as heading -->

**Error: "Profile not found"**

Some explanation text.

<!-- ✅ Good: Proper heading -->

### Error: "Profile not found"

Some explanation text.
```

### MD024: Duplicate Headings

**Rule**: Headings with same content should be unique

**Fixes**:

```markdown
<!-- ❌ Bad: Duplicate headings -->

## Examples

...

## Examples

<!-- ✅ Good: Unique headings -->

## Basic Examples

...

## Advanced Examples

<!-- ✅ Good: Add context -->

## Examples (list-profiles.sh)

...

## Examples (import-profiles.sh)
```

### MD012: Multiple Blank Lines

**Rule**: No multiple consecutive blank lines

**Fix**:

```markdown
<!-- ❌ Bad: Multiple blank lines -->

Some text

More text

<!-- ✅ Good: Single blank line -->

Some text

More text
```

### MD034: Bare URLs

**Rule**: URLs should be wrapped in angle brackets or links

**Fix**:

```markdown
<!-- ❌ Bad: Bare URL -->

Visit https://example.com

<!-- ✅ Good: Wrapped URL -->

Visit <https://example.com>

<!-- ✅ Good: Link format -->

Visit [Example Site](https://example.com)
```

## Tooling

### markdownlint-cli

**Installation**:

```bash
npm install -g markdownlint-cli
```

**Usage**:

```bash
# Check all Markdown files
markdownlint .

# Auto-fix issues
markdownlint . --fix

# Check specific files
markdownlint README.md docs/**/*.md
```

### prettier (Optional)

**Installation**:

```bash
npm install -g prettier
```

**Usage**:

```bash
# Format Markdown files
prettier --write "**/*.md" --prose-wrap always
```

### Makefile Targets

```makefile
# Run markdownlint
make lint-md

# Auto-fix Markdown issues
make lint-md-fix

# Generate detailed report
make lint-md-report

# Format Markdown with prettier
make fmt-md

# Run all linters (Go + Markdown)
make lint-all
```

## Workflow Integration

### Pre-Commit Checks

```bash
# Before committing
make lint-md          # Check for issues
make lint-md-fix      # Auto-fix what can be fixed
git add .
git commit -m "docs: update documentation"
```

### CI/CD Integration

GitHub Actions automatically runs markdownlint:

```yaml
- name: Run markdownlint
  uses: nosborn/github-action-markdown-cli@v3.3.0
  with:
    files: .
    config_file: .markdownlint.json
    ignore_files: .markdownlintignore
```

### Local Testing

Match GitHub Actions behavior locally:

```bash
make lint-md          # Same as CI
make lint-md-report   # Detailed breakdown
```

## Best Practices

### Heading Hierarchy

```markdown
# Document Title (H1) - Only one per document

## Major Section (H2)

### Subsection (H3)

#### Minor Section (H4)

##### Detail Section (H5)
```

### Code Block Guidelines

1. **Always specify language** for syntax highlighting
2. **Use `text` for plain output** (not no language)
3. **Use `bash` for shell commands**
4. **Use `hcl` or `terraform`** for Terraform configs
5. **Add blank lines** before and after code blocks

### URL Formatting

1. **Wrap in angle brackets** for inline URLs: `<https://example.com>`
2. **Use link format** for descriptive text:
   `[Description](https://example.com)`
3. **Never use bare URLs** without wrapping

### Emphasis Usage

1. **Use headings** for section titles (not bold)
2. **Use bold** for emphasis within text
3. **Use italic** for subtle emphasis or terms
4. **Use code formatting** for code/commands: `` `code` ``

### List Formatting

1. **Add blank lines** before and after lists
2. **Use consistent markers** (- or \* for unordered, 1. for ordered)
3. **Indent nested lists** with 2 or 4 spaces
4. **Keep list items concise**

## Common Patterns

### Error Messages

```markdown
<!-- ✅ Good: Proper heading -->

### Error: "Profile not found"

**Cause**: The profile ID doesn't exist in the system.

**Solution**: Verify the profile ID using `list-profiles.sh`.
```

### Command Examples

````markdown
<!-- ✅ Good: Language specified, blank lines -->

Run the following command:

```bash
terraform apply -var="profile_id=12345"
```
````

The output will show:

```text
(output here)
```

### Configuration Examples

````markdown
<!-- ✅ Good: HCL language, descriptive -->

Configure the provider:

```hcl
provider "wsone" {
  instance_url = "https://your-instance.awmdm.com"
  username     = var.username
  password     = var.password
}
```
````

### Multi-Step Instructions

````markdown
<!-- ✅ Good: Numbered list with blank lines -->

Follow these steps:

1. Install the provider

   ```bash
   make install
   ```

2. Configure authentication

   ```bash
   export USERNAME="your-username"
   export PASSWORD="your-password"
   ```

3. Run Terraform

   ```bash
   terraform init
   terraform apply
   ```
````

## Troubleshooting

### Issue: "Line too long"

**Solution**: Break long lines, wrap URLs in angle brackets

### Issue: "Missing code language"

**Solution**: Add language specifier to all code blocks

### Issue: "Emphasis as heading"

**Solution**: Convert bold text to proper headings (###)

### Issue: "Duplicate headings"

**Solution**: Make headings unique or add context

### Issue: "Multiple blank lines"

**Solution**: Remove extra blank lines (auto-fixable)

## References

- [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [CommonMark Spec](https://commonmark.org/)
