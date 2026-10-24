---
name: review-variable-names
description: >-
  Use this skill when the user requests to review, inspect, or audit variable naming in the codebase.
  Supports flags --file=<path> and --source=<dir>. Enforces explicit and non-magic naming,
  UPPER_SNAKE_CASE for constants/fixed values, camelCase for function-scoped variables.
  Analyzes surrounding logic context to provide precise rename suggestions while strictly
  enforcing rename-only (never altering code logic or adding extra code).
---

# Skill: Variable Name Reviewer (`review-variable-names`)

This skill guides the Agent to scan, inspect, and evaluate the quality of variable names in the codebase (or within a specified scope), ensuring names are unambiguous, clear, and adhere to strict naming conventions.

---

## 1. Scope and Flag Resolution

Parse the user's prompt to determine the target files to inspect, respecting the following precedence:

| Flag / Parameter | Example | Target Scope | Precedence |
| :--- | :--- | :--- | :--- |
| `--file=<path>` | `--file=frontend/src/page/home.tsx` | Inspect **only** this single file | **Highest (Overrides `--source`)** |
| `--source=<dir>` | `--source=frontend/src/components` | Inspect all source files inside this directory | Secondary |
| *(None / Default)* | `review variable names` | Scan all project files from the workspace root | Default |

### Ignoring Files (`.gitignore` Reference)
Before discovering or scanning files:
1. **Read the project's `.gitignore` file** at the workspace root to identify and respect all ignored patterns (e.g., `node_modules/`, `dist/`, `build/`, `.next/`, `vendor/`, `.env*`, etc.).
2. **Always ignore internal/tooling directories**: `.git/`, `.gemini/`, `.agents/`.
3. Only inspect valid, tracked source files (e.g., `.ts`, `.tsx`, `.go`, `.js`, `.py`, etc.).

---

## 2. Review Criteria & Rules

When evaluating a variable, the Agent **MUST** inspect its assigned value and how it is used across the surrounding logic to understand its real business purpose before suggesting changes:

### A. Clarity & Explicitness (No MAGIC Names)
- ❌ **No confusing abbreviations:** `btnCls`, `chkData`, `tmpVal`, `authUsr` $\to$ Suggest `buttonClassName`, `isValidData`, `tempValue`, `authenticatedUser`.
- ❌ **No meaningless / overly generic names:** `data`, `item`, `res`, `obj`, `temp`, `val`, `flag` $\to$ Suggest entity-specific names like `taskList`, `missionItem`, `apiResponse`, `filterOption`.
- ❌ **No single-letter names:** `a`, `b`, `x`, `d` (Except standard loop indices `i`, `j` or math coordinates `x`, `y`).
- ❌ **Booleans must reflect state/condition:** Start with prefixes `is`, `has`, `can`, `should`, `open` (e.g., `isOpenCancelDialog`, `hasExpired`, `canSubmit`). Avoid ambiguous names like `cancelDialog`, `expired`.

### B. Constants & Fixed Values (`UPPER_SNAKE_CASE`)
- Any variable holding fixed configuration, global constants, or hardcoded strings/numbers that remain invariant across the lifecycle must be capitalized:
  - ❌ `const defaultPageSize = 10;` $\to$ `const DEFAULT_PAGE_SIZE = 10;`
  - ❌ `const apiTimeout = 5000;` $\to$ `const API_TIMEOUT_MS = 5000;`
  - ❌ `const maxRetries = 3;` $\to$ `const MAX_RETRIES = 3;`

### C. Local / Function-Scoped Variables (`camelCase`)
- Variables defined within functions, function parameters, and component states must strictly follow `camelCase`:
  - ❌ `open_cancel_dialog`, `OpenCancelDialog` $\to$ `openCancelDialog`
  - ❌ `remaining_seconds` $\to$ `remainingSeconds`

### D. Strict Rename-Only Constraint (No Logic Alterations)
> [!IMPORTANT]
> **MANDATORY CONSTRAINT (STRICT RENAME-ONLY RULE):**
> 1. **Rename Identifiers Only:** Only modify names of variables, constants, parameters, or identifiers to adhere to naming conventions.
> 2. **NO Logic Changes:** Strictly preserve 100% of the business logic, control flow, algorithmic structure, values, and program behavior.
> 3. **NO Extra Code or Refactoring:** Absolutely DO NOT add new features, refactor code structure, delete code, or introduce any extra code/dependencies outside of renaming.

---

## 3. Step-by-Step Execution Workflow

1. **Resolve Scope & Filter Files:**
   - Read `.gitignore` at project root.
   - Resolve target files based on `--file`, `--source`, or root scan, filtering out all ignored patterns.
2. **Inspect & Trace Logic:**
   - Read each target file using file inspection tools (`view_file`).
   - Trace variable declarations (`const`, `let`, `var`, parameters, states).
   - Check value assignments and how variables are consumed in conditions, JSX, function calls, or loops.
3. **Format and Present Results.**

---

## 4. Required Output Format

Group findings by relative file path using a clear Markdown header (`### 📁 <file_path>`), followed by an empty line. Each issue must clearly separate the line suggestion and the explanation on distinct lines:

```markdown
### 📁 <relative/path/to/file.ext>

- **Dòng <line_number>:** `<invalid_name>` ➔ `<suggested_name>`
  > "<Giải thích lý do không hợp lệ và tại sao tên mới rõ nghĩa, đúng mục đích hơn>"

- **Dòng <line_number>:** `<invalid_name>` ➔ `<suggested_name>`
  > "<Giải thích...>"
```

### Output Example:

### 📁 frontend/src/page/home/index.tsx

- **Dòng 21:** `openCancelAlertDialogTask` ➔ `openCancelTaskDialog`
  > "Tên biến đang bị đảo lộn thứ tự từ ('AlertDialogTask') gây khó hiểu. Biến này dùng để điều khiển trạng thái mở Dialog hủy nhiệm vụ, nên đổi thành 'openCancelTaskDialog' sẽ tự nhiên và rõ nghĩa hơn."

- **Dòng 45:** `max_retry` ➔ `MAX_RETRY_COUNT`
  > "Đây là hằng số cố định số lần thử lại tối đa, cần viết hoa theo chuẩn UPPER_SNAKE_CASE và thêm hậu tố '_COUNT' để thể hiện rõ đây là số lượng."

### 📁 frontend/src/components/progress-countdown.tsx

- **Dòng 14:** `diff` ➔ `remainingSeconds`
  > "Biến 'diff' quá chung chung. Trong ngữ cảnh logic tính khoảng thời gian còn lại tính bằng giây của đồng hồ đếm ngược, 'remainingSeconds' giúp người đọc hiểu ngay đơn vị và mục đích."

*(If all variables in the inspected scope are clean and valid, output: "Tất cả tên biến trong phạm vi kiểm tra đều đã hợp lệ và tường minh.")*

---

## 5. Output Language Requirement

> [!IMPORTANT]
> **Output the final review and explanations in Vietnamese (Tiếng Việt) for the user.**
