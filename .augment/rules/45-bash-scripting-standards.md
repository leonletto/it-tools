---
type: "auto_apply"
description:
  "editing or creating bash scripts, shell scripts, .sh files, or when
  shellcheck warnings are present"
---

# Bash Scripting Rules and Best Practices

## Core Principles

1. **Always use shellcheck-compliant code** - Follow shellcheck recommendations
2. **Declare before initialize** - Separate variable declaration from command
   substitution
3. **Quote everything** - Prevent word splitting and globbing issues
4. **Capture exit codes properly** - Don't rely on `$?` after multiple commands
5. **Use `find` instead of `ls`** - Better handling of special characters in
   filenames

---

## Rule 1: Declare Variables Before Command Substitution

### ❌ WRONG (Masks return values):

```bash
local result=$(some_command)
local file_count=$(find /path -type f | wc -l)
local disk_usage=$(df -h /root/.cache | tail -1 | awk '{print $3}')
```

### ✅ CORRECT:

```bash
local result
result=$(some_command)

local file_count
file_count=$(find /path -type f | wc -l)

local disk_usage
disk_usage=$(df -h /root/.cache | tail -1 | awk '{print $3}')
```

**Why:** Combining declaration and assignment masks the exit code of the command
substitution. If the command fails, you won't know.

---

## Rule 2: Capture Exit Codes Immediately

### ❌ WRONG (Exit code may be from wrong command):

```bash
local response=$(curl -s "http://example.com/api")
if [ $? -eq 0 ]; then
    echo "Success"
fi
```

### ✅ CORRECT:

```bash
local response
response=$(curl -s "http://example.com/api")
local exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo "Success"
fi
```

**Why:** `$?` contains the exit code of the most recent command. If you check it
later, it may reflect a different command's result.

---

## Rule 3: Quote Nested Command Substitutions

### ❌ WRONG (Breaks with spaces in paths):

```bash
local name=$(basename $(dirname $(dirname "$path")))
```

### ✅ CORRECT:

```bash
local name
name=$(basename "$(dirname "$(dirname "$path")")")
```

**Why:** Unquoted command substitutions break when paths contain spaces or
special characters.

---

## Rule 4: Quote Variables in JSON/Strings

### ❌ WRONG (Word splitting issues):

```bash
curl -d '{
    "model": "'$MODEL_NAME'",
    "input": "test"
}'
```

### ✅ CORRECT:

```bash
curl -d '{
    "model": "'"$MODEL_NAME"'",
    "input": "test"
}'
```

**Why:** Proper quoting prevents word splitting and ensures the variable is
treated as a single value.

---

## Rule 5: Use `find` Instead of `ls` for Parsing

### ❌ WRONG (Unreliable with special characters):

```bash
ls -la "$directory" | head -10
for file in $(ls *.txt); do
    process "$file"
done
```

### ✅ CORRECT:

```bash
# For listing with details:
find "$directory" -maxdepth 1 -type f -printf "%M %n %u %g %10s %TY-%Tm-%Td %TH:%TM %f\n" | head -10

# For iteration:
find . -name "*.txt" -type f -print0 | while IFS= read -r -d '' file; do
    process "$file"
done
```

**Why:** `ls` output varies by locale and doesn't handle filenames with
newlines, spaces, or special characters reliably.

---

## Rule 6: Proper Redirection with `find -exec`

### ❌ WRONG (Redirection in wrong place):

```bash
find "$path" -type f -name "*.json" -exec cat {} > /dev/null 2>/dev/null \;
```

### ✅ CORRECT:

```bash
find "$path" -type f -name "*.json" -exec cat {} \; > /dev/null 2>&1
```

**Why:** Redirection should be at the end of the entire `find` command, not
inside the `-exec` clause.

---

## Rule 7: Use Delimiters Other Than `/` in `sed`

### ❌ WRONG (Requires excessive escaping):

```bash
sed -i 's/\/home\/user\/path/\/new\/path/' file
```

### ✅ CORRECT:

```bash
sed -i 's|/home/user/path|/new/path|' file
```

**Why:** Using `|` or `#` as delimiter avoids the need to escape forward slashes
in paths.

---

## Rule 8: Multi-line String Insertion with `awk` Instead of `sed`

### ❌ WRONG (Complex and error-prone):

```bash
sed -i 's/export ZSH=/if [[ -r ... ]]; then\n  source ...\nfi\n\nexport ZSH=/' file
```

### ✅ CORRECT:

```bash
awk '
/^export ZSH=/ {
    print "if [[ -r \"${XDG_CACHE_HOME:-$HOME/.cache}/file.zsh\" ]]; then"
    print "  source \"${XDG_CACHE_HOME:-$HOME/.cache}/file.zsh\""
    print "fi"
    print ""
}
{print}
' input_file > output_file
```

**Why:** `awk` handles multi-line insertions more cleanly than trying to embed
`\n` in `sed` commands.

---

## Rule 9: Always Quote Array Expansions

### ❌ WRONG:

```bash
files=(file1.txt "file 2.txt" file3.txt)
process_files ${files[@]}
```

### ✅ CORRECT:

```bash
files=(file1.txt "file 2.txt" file3.txt)
process_files "${files[@]}"
```

**Why:** Unquoted array expansion causes word splitting on spaces.

---

## Rule 10: Use `[[` Instead of `[` for Conditionals

### ❌ ACCEPTABLE (but less robust):

```bash
if [ "$var" = "value" ]; then
    echo "match"
fi
```

### ✅ BETTER:

```bash
if [[ "$var" == "value" ]]; then
    echo "match"
fi
```

**Why:** `[[` is a bash keyword that provides:

- Pattern matching with `==`
- Regex matching with `=~`
- No word splitting on variables
- Logical operators `&&` and `||`

---

## Common Shellcheck Warnings and Fixes

| Code   | Warning                          | Fix                         |
| ------ | -------------------------------- | --------------------------- |
| SC2012 | Use find instead of ls           | Replace `ls` with `find`    |
| SC2155 | Declare and assign separately    | Split into two lines        |
| SC2181 | Check exit code directly         | Capture `$?` immediately    |
| SC2086 | Double quote to prevent globbing | Add quotes around variables |
| SC2046 | Quote to prevent word splitting  | Quote command substitutions |

---

## Testing Your Scripts

Always test bash scripts with:

```bash
# Syntax check
bash -n script.sh

# Shellcheck analysis
shellcheck script.sh

# Run with error checking
bash -x script.sh  # Debug mode
set -euo pipefail  # Strict mode in script
```

---

## References

- [ShellCheck Wiki](https://www.shellcheck.net/wiki/)
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- [Bash Pitfalls](https://mywiki.wooledge.org/BashPitfalls)
