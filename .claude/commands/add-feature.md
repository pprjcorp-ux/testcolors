description: Add a new feature to the codebase
model: claude-opus-4-5-20251101
argument-hint: [feature description]
allowed-tools: Read, Glob, Grep, Edit, Write, Bash

## Rules for Adding Features

1. **Understand First**: Read existing code before making changes. Never modify code you haven't read.

2. **Keep It Simple**: Implement only what is requested. No over-engineering or extra features.

3. **Follow Existing Patterns**: Match the code style, naming conventions, and architecture already in place.

4. **Write Tests**: All new functions MUST have unit tests. Run `npm test` after changes.

5. **Security**: Never introduce vulnerabilities (XSS, SQL injection, command injection, etc.).

6. **Small Changes**: Make minimal, focused changes. One feature per implementation.

7. **No Breaking Changes**: Ensure backward compatibility unless explicitly requested.

Add the feature described in $ARGUMENTS following these rules.
