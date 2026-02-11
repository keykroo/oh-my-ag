---
name: framer-motion-skill
description: Framer Motion utility skill for consistent UI transitions and spring animations in React.
---

# Framer Motion Skill

This skill provides a set of standardized Framer Motion configurations to ensure consistency across the WebDFY project.

## Components

### MotionBox
A wrapper around `motion.div` that applies the default `fadeInUp` animation and `springTransition`.

**Usage:**
```javascript
import { MotionBox } from '/Users/dianapazzzz/Desktop/webdfy-v1/oh-my-ag/.agent/skills/framer-motion-skill/motion-handler.js';

function MyComponent() {
  return (
    <MotionBox id="unique-component-id">
      <h1>Hello World</h1>
    </MotionBox>
  );
}
```

## Configuration

- **springTransition**: A high-stiffness spring for snappy interactions.
- **fadeInUp**: A standard entry animation.

## Guidelines
1. **Always use individual IDs**: Ensure every `MotionBox` or `motion` component has a unique ID to avoid layout sync issues.
2. **Standardize Transitions**: Default to `springTransition` for consistency.
3. **Fade Reveals**: Prefer `fadeInUp` for new section entries.
