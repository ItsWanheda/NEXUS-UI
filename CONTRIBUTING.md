<div align="center">

# 🤝 Contributing to Nexus UI

Thanks for your interest in contributing! 🎉
Every contribution — from typo fixes to new features — is appreciated.

</div>

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [How to Contribute](#-how-to-contribute)
- [Pull Request Process](#-pull-request-process)
- [Commit Conventions](#-commit-conventions)
- [Style Guide](#-style-guide)
- [Reporting Bugs](#-reporting-bugs)
- [Suggesting Features](#-suggesting-features)

---

## 📜 Code of Conduct

By participating, you agree to be respectful and constructive.
Be kind. Assume good intent. No harassment, no trolling.

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/your-username/NEXUS-UI.git
cd NEXUS-UI
```

### 2. Open in Browser

That's it — no build step! Just open `index.html`.

For a local server (optional):

```bash
python -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000`.

### 3. Make Changes

Edit `index.html`, `style.css`, or `script.js` and refresh the browser.

---

## 🛠️ How to Contribute

| Type | How |
|------|-----|
| 🐛 **Bug fix** | Open an issue first, then submit a PR |
| ✨ **New feature** | Open an issue to discuss before coding |
| 📝 **Docs** | Edit `README.md` directly and submit a PR |
| 🎨 **Styling tweaks** | Open a PR with screenshots/GIFs |
| ⚡ **Performance** | Profile before/after and include numbers |

---

## 🔄 Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/awesome-feature
   ```

2. **Make your changes** — keep commits atomic (see conventions below).

3. **Test locally**:
   - Open in Chrome, Firefox, and Safari
   - Test mobile viewport (DevTools → responsive mode)
   - Test keyboard navigation (Tab, ⌘K, Esc, /)
   - Test with `prefers-reduced-motion` enabled

4. **Update docs** if you changed public-facing behavior.

5. **Push & open a PR**:
   ```bash
   git push origin feat/awesome-feature
   ```
   Then open a PR on GitHub against `main`.

6. **Fill out the PR template** — describe what, why, and how.

7. **Wait for review** — maintainers will respond within a few days.

---

## 📝 Commit Conventions

We use [**Gitmoji**](https://gitmoji.dev/) + Conventional Commits.

### Format

```
<emoji> <type>: <short description>

[optional body]

[optional footer]
```

### Common Types

| Emoji | Type | Example |
|-------|------|---------|
| ✨ | `feat` | ✨ feat: add keyboard shortcut for notifications |
| 🐛 | `fix` | 🐛 fix: close dropdown on outside click |
| 📝 | `docs` | 📝 docs: update installation steps |
| 💄 | `style` | 💄 style: improve focus-visible outlines |
| ♻️ | `refactor` | ♻️ refactor: extract cursor logic to module |
| ⚡ | `perf` | ⚡ perf: throttle scroll handler with rAF |
| ✅ | `test` | ✅ test: add unit tests for search filter |
| 🔧 | `chore` | 🔧 chore: update .gitignore |
| ♿ | `a11y` | ♿ a11y: add skip-to-content link |

### Examples

```bash
git commit -m "✨ feat: add export-to-JSON for notifications"
git commit -m "🐛 fix: search overlay not closing on mobile"
git commit -m "📝 docs: add customization section to README"
git commit -m "⚡ perf: replace scroll listener with IntersectionObserver"
```

---

## 🎨 Style Guide

### JavaScript

- **Vanilla ES2020+** — no frameworks, no build step
- **IIFE wrapper** to avoid polluting `window`
- **`const` by default**, `let` only when reassignment is needed
- **Named functions** over anonymous arrows for top-level handlers
- **Comment the *why***, not the *what*

```js
// ✅ Good
function openSearch() {
  if (state.searchOpen) return; // Prevent double-open
  // ...
}

// ❌ Avoid
const openSearch = () => { /* ... */ };
```

### CSS

- **Custom properties** for all theme values (no hardcoded colors)
- **BEM-ish naming** (`.notification-item`, `.notification-item--unread`)
- **Mobile-first** media queries
- **Group properties** logically: position → box → typography → visual

```css
/* ✅ Good */
.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  transition: background 0.15s;
}
```

### HTML

- **Semantic tags** — `<nav>`, `<main>`, `<section>`, `<article>`
- **ARIA only when needed** — prefer native semantics first
- **Always include `alt`** for images, `aria-label` for icon-only buttons

---

## 🐛 Reporting Bugs

Found a bug? Please open an [issue](../../issues) with:

- **Clear title** — `Search overlay doesn't close on Escape`
- **Steps to reproduce** — numbered list
- **Expected vs actual** behavior
- **Screenshots / GIFs** — if visual
- **Browser + version** — e.g., Chrome 120, Safari 17
- **Device** — desktop / mobile / tablet

**Template:**

```markdown
**Describe the bug**
A clear description.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable.

**Environment:**
- Browser: [e.g., Chrome 120]
- Device: [e.g., iPhone 14, Windows 11]
- Screen size: [e.g., 1920x1080]
```

---

## 💡 Suggesting Features

Have an idea? Open an issue with the **`enhancement`** label.

Include:

- **Problem** — what user pain does this solve?
- **Solution** — your proposed approach
- **Alternatives** — what else you considered
- **Mockups / examples** — links to similar implementations
- **Willingness** — would you like to implement it yourself?

---

## 🏷️ Issue Labels

| Label | Purpose |
|-------|---------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `docs` | Documentation improvements |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `priority: high` | Critical / blocking |
| `wontfix` | Will not be addressed |

---

## ❓ Questions?

- 💬 Open a [Discussion](../../discussions)
- 🐦 Tag maintainers in your PR
- 📧 Check the [README](./README.md) first

---

<div align="center">

**Happy hacking! 🚀**

Made with ❤️ by the Nexus UI community.

</div>
