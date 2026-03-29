# Linting and Formatting Guide

This document explains what linting and formatting are, why they're important, and how to use them in this project.

## What is Linting?

**Linting** is the process of analyzing your code to find potential bugs, errors, and code quality issues **before** you run the code.

### Think of it like a spell-checker for code:
- ✅ Catches typos in variable names
- ✅ Finds unused variables
- ✅ Warns about potential bugs
- ✅ Enforces coding best practices
- ✅ Helps maintain consistent code style

### Example:
```javascript
// Linter would catch this error:
const userName = "John";
console.log(userNam);  // ❌ Typo! Linter warns: "userNam is not defined"

// Or this:
const unusedVariable = "test";  // ❌ Linter warns: "unusedVariable is defined but never used"
```

### In This Project:
- **Tool:** ESLint
- **Config file:** `client-vite/eslint.config.js`
- **Run it:** `npm run lint` (from root) or `cd client-vite && npm run lint`

### What ESLint Checks:
- Syntax errors
- Unused variables
- Missing imports
- React best practices (hooks rules, etc.)
- Potential bugs

---

## What is Formatting?

**Formatting** is the process of making your code look consistent - spacing, indentation, quotes, semicolons, etc.

### Think of it like auto-formatting in Word:
- ✅ Consistent spacing
- ✅ Same quote style (single vs double)
- ✅ Consistent indentation
- ✅ Line breaks in the same places
- ✅ Makes code easier to read

### Example:

**Before formatting (inconsistent):**
```javascript
const name="John";
const age=25;
function greet(){
return `Hello, ${name}!`;
}
```

**After formatting (consistent):**
```javascript
const name = 'John';
const age = 25;

function greet() {
  return `Hello, ${name}!`;
}
```

### In This Project:
- **Tool:** Prettier
- **Config file:** `.prettierrc` in root directory
- **Run it:** `npm run format` (formats all files) or `npm run format:check` (checks only)

### What Prettier Formats:
- Indentation (spaces vs tabs)
- Line length
- Quote style (single vs double)
- Semicolons
- Spacing around operators
- Trailing commas

---

## Why Use Both?

**ESLint (Linting):**
- Focuses on **code correctness** and **logic**
- Catches bugs and errors
- Enforces best practices

**Prettier (Formatting):**
- Focuses on **code appearance** and **style**
- Makes code look consistent
- Handles spacing and formatting

**They work together:**
- ESLint: "This code has a bug!"
- Prettier: "This code looks messy!"

---

## How to Use

### Running Linting

**From root directory:**
```bash
npm run lint
```

**From client-vite directory:**
```bash
cd client-vite
npm run lint
```

**What happens:**
- ESLint analyzes all `.js` and `.jsx` files
- Shows errors and warnings in terminal
- Exits with error code if issues found (useful for CI/CD)

### Running Formatting

**Format all files (makes changes):**
```bash
npm run format
```

**Check formatting without changing files:**
```bash
npm run format:check
```

**What happens:**
- Prettier reads `.prettierrc` config
- Formats all matching files (`.js`, `.jsx`, `.json`, `.css`, `.md`)
- Skips files in `.prettierignore`

---

## Configuration Files

### ESLint Config (`client-vite/eslint.config.js`)
```javascript
export default defineConfig([
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,           // JavaScript best practices
      reactHooks.configs['recommended-latest'],  // React hooks rules
      reactRefresh.configs.vite,        // Vite-specific rules
    ],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
]);
```

**What this means:**
- Checks all `.js` and `.jsx` files
- Uses recommended JavaScript rules
- Enforces React hooks best practices
- Errors on unused variables (except constants)

### Prettier Config (`.prettierrc`)
```json
{
  "semi": true,              // Use semicolons
  "trailingComma": "es5",   // Trailing commas where valid in ES5
  "singleQuote": true,      // Use single quotes
  "printWidth": 80,         // Wrap lines at 80 characters
  "tabWidth": 2,            // 2 spaces for indentation
  "useTabs": false,         // Use spaces, not tabs
  "arrowParens": "avoid"    // Omit parens when possible: x => x
}
```

**What this means:**
- All code will use single quotes: `'hello'` not `"hello"`
- Lines wrap at 80 characters
- 2 spaces for indentation
- Semicolons at end of statements

---

## Common Issues and Fixes

### Issue: "ESLint found problems"
**Fix:** Read the error message, fix the code, or disable the rule if needed

### Issue: "Prettier formatting differs"
**Fix:** Run `npm run format` to auto-fix

### Issue: "Conflicts between ESLint and Prettier"
**Fix:** Usually not an issue in this project, but you can install `eslint-config-prettier` to disable conflicting rules

---

## Best Practices

1. **Run linting before committing:**
   ```bash
   npm run lint
   ```

2. **Format code before committing:**
   ```bash
   npm run format
   ```

3. **Set up your editor:**
   - Install ESLint extension
   - Install Prettier extension
   - Enable "format on save"

4. **In team projects:**
   - Everyone uses same config
   - Code looks consistent
   - Fewer merge conflicts
   - Easier code reviews

---

## Summary

- **Linting (ESLint):** Catches bugs and enforces best practices
- **Formatting (Prettier):** Makes code look consistent
- **Both together:** Clean, consistent, bug-free code
- **Run before committing:** `npm run lint && npm run format`

---

## Quick Reference

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check formatting (don't change files)
npm run format:check

# Both at once
npm run lint && npm run format
```

