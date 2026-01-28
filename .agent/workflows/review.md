---
description: Full QA review pipeline — security audit (OWASP Top 10), performance analysis, accessibility check (WCAG 2.1 AA), and code quality review
---

1. Identify Review Scope
   Ask the user what to review: specific files, a feature branch, or the entire project. If a PR or branch is provided, diff against the base branch to scope the review.

2. Run Automated Security Checks
   // turbo
   Run available security tools: `npm audit` (Node.js), `bandit` (Python), or equivalent. Check for known vulnerabilities in dependencies. Flag any CRITICAL or HIGH findings.

3. Manual Security Review (OWASP Top 10)
   Review code for: injection (SQL, XSS, command), broken auth, sensitive data exposure, broken access control, security misconfig, insecure deserialization, known vulnerable components, insufficient logging.

4. Performance Analysis
   Check for: N+1 queries, missing indexes, unbounded pagination, memory leaks, unnecessary re-renders (React), missing lazy loading, large bundle sizes, unoptimized images.

5. Accessibility Review (WCAG 2.1 AA)
   Check for: semantic HTML, ARIA labels, keyboard navigation, color contrast ratios, focus management, screen reader compatibility, alt text on images.

6. Code Quality Review
   Check for: consistent naming, proper error handling, test coverage, TypeScript strict mode compliance, unused imports/variables, proper async/await usage, documentation for public APIs.

7. Generate QA Report
   Compile all findings into a prioritized report:
   - CRITICAL: Security breaches, data loss risks
   - HIGH: Blocks launch
   - MEDIUM: Fix this sprint
   - LOW: Backlog
   Each finding must include: file:line, description, and remediation code.
