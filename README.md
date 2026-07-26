<div align="center">

# ✨ Nexus UI

### Premium navbar experience with real-time search, notification system & glass-morphism design

</div>

---

## 🎯 Overview

**Nexus UI** is a modern, production-ready navbar system built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step, no dependencies. It features:

- 🎨 **Glass-morphism design** with aurora gradient backgrounds
- 🔍 **Real-time search** with keyboard navigation and recents
- 🔔 **Notification dropdown** with filters and read/unread state
- 👤 **Profile menu** with usage stats and account actions
- 🖱️ **Custom magnetic cursor** that adapts to interactive elements
- 📱 **Fully responsive** with a beautiful full-screen mobile menu
- ♿ **Accessible** — keyboard-first, ARIA-compliant, reduced-motion aware
- ⚡ **Performance-optimized** — throttled scroll, IntersectionObserver, paused `rAF`

---

## 🖼️ Preview

![Preview](./public/Src/images/Preview-1.png)
![Preview](./public/Src/images/Preview-2.png)
![Preview](./public/Src/images/Preview-3.png)
![Preview](./public/Src/images/Preview-4.png)
![Preview](./public/Src/images/Preview-5.png)
![Preview](./public/Src/images/Preview-6.png)
![Preview](./public/Src/images/Preview-7.png)
![Preview](./public/Src/images/Preview-8.png)

---

## 🚀 Features

### Navigation
- Floating glass-morphism navbar with hide-on-scroll-down behavior
- Active link tracking via `IntersectionObserver`
- Magnetic hover effect on interactive elements
- Animated scroll progress indicator
- Custom theming (light/dark) with `localStorage` persistence

### Search (`⌘K` / `Ctrl+K` / `/`)
- Real-time fuzzy filtering with highlighted matches
- Keyboard navigation (↑/↓/Enter/Esc)
- Recent searches history (persisted)
- Categorized results: Pages, Quick Links, Actions
- Empty state with helpful fallback

### Notifications
- 5 notification types (mention, success, warning, alert, info)
- Filter tabs: All / Unread / Mentions
- Read/unread state with `localStorage` persistence
- Relative timestamps ("5m ago", "2h ago")
- Mark-all-read bulk action
- Live unread count badge

### Profile Menu
- Avatar with online status indicator
- Plan usage progress bar
- Quick links to Dashboard, Settings, Help
- Sign out action with destructive styling

### Mobile
- Full-screen menu with staggered link animations
- Slide-in numbered navigation
- Social links and prominent CTA
- Touch-optimized, dismissable via swipe-style backdrop

### Accessibility
- Skip-to-content link
- Full keyboard navigation
- `aria-expanded`, `aria-haspopup`, `role="dialog"` correctly set
- Focus-visible outlines
- `prefers-reduced-motion` respected throughout
- Screen-reader friendly

---

## 🛠️ Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Markup      | Semantic HTML5          |
| Styling     | CSS3 (custom properties, `color-mix`, `backdrop-filter`) |
| Scripting   | Vanilla JavaScript (ES2020+) |
| Fonts       | Inter, Space Grotesk (Google Fonts) |
| Icons       | Inline SVG              |
| Build       | None — drop-in ready    |

---

## 📂 Project Structure

```
nexus-ui/
├── index.html        # Markup & structure
├── style.css         # All styles, themes, animations
├── script.js         # Modular vanilla JS (IIFE)
└── README.md         # You are here
```

---

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/ItsWanheda/nexus-ui.git
   cd nexus-ui
   ```

2. **Open in browser**
   ```bash
   # macOS
   open index.html

   # Linux
   xdg-open index.html

   # Windows
   start index.html
   ```

   Or simply drag `index.html` into your browser. That's it — no build step required.

3. **Optional: serve locally**
   ```bash
   # Python 3
   python -m http.server 8000

   # Node (with npx)
   npx serve .
   ```

   Then visit `http://localhost:8000`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut          | Action                    |
|-------------------|---------------------------|
| `⌘ K` / `Ctrl K`  | Open / close search       |
| `/`               | Open search               |
| `Esc`             | Close any open overlay    |
| `↑` / `↓`         | Navigate search results   |
| `Enter`           | Open selected result      |

---

## 🎨 Customization

### Theme Colors

Edit CSS custom properties in `:root` inside `style.css`:

```css
:root {
  --primary:       #a78bfa;   /* Brand purple */
  --accent:        #ec4899;   /* Brand pink   */
  --grad-1:        linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
  /* ... */
}
```

### Notifications

Replace the `DEFAULT_NOTIFS` array in `script.js`:

```js
const DEFAULT_NOTIFS = [
  {
    id: 1,
    type: 'mention',           // mention | success | warning | alert | info
    icon: '@',
    title: '<strong>Sarah</strong> mentioned you',
    time: Date.now() - 5 * 60 * 1000,
    unread: true,
  },
  // ...
];
```

### Search Items

Add or remove items in the `SEARCH_INDEX` array:

```js
const SEARCH_INDEX = [
  { type: 'page',   icon: '🏠', title: 'Home',     desc: '...', href: '#home' },
  { type: 'quick',  icon: '🚀', title: 'Get Started', desc: '...', href: '#' },
  { type: 'action', icon: '⚙️', title: 'Settings', desc: '...', action: () => {...} },
];
```

### Storage Keys

All persistent data uses these `localStorage` keys:

| Key             | Purpose                       |
|-----------------|-------------------------------|
| `nexus-theme`   | Theme preference (`dark`/`light`) |
| `nexus-recents` | Recent search queries (array) |
| `nexus-notifs`  | Notification read state       |

---

## 🌐 Browser Support

| Browser          | Version | Notes                                  |
|------------------|---------|----------------------------------------|
| Chrome / Edge    | 90+     | Full support                           |
| Firefox          | 88+     | Full support                           |
| Safari           | 15.4+   | `backdrop-filter` supported            |
| Mobile Safari    | 15.4+   | Touch-optimized                        |
| IE 11            | ❌       | Not supported (uses modern CSS)        |

---

## ♿ Accessibility

This project targets **WCAG 2.1 AA** compliance:

- ✅ Keyboard accessible (no mouse required)
- ✅ Focus indicators on all interactive elements
- ✅ ARIA labels and live regions
- ✅ Color contrast ratios ≥ 4.5:1
- ✅ Reduced motion support
- ✅ Screen reader tested (VoiceOver, NVDA)

---

## ⚡ Performance

| Metric                          | Value              |
|---------------------------------|--------------------|
| First Contentful Paint          | < 0.5s             |
| Total JS size (minified)        | ~ 12 KB            |
| Total CSS size (minified)       | ~ 18 KB            |
| Lighthouse Performance Score    | 98 / 100           |
| Lighthouse Accessibility Score  | 100 / 100          |

### Optimization Techniques Used

- **Single rAF-throttled scroll listener** (replaces 3+ scroll handlers)
- **`IntersectionObserver`** for active-link tracking (zero work when idle)
- **Event delegation** for magnetic effects and dropdowns
- **Cursor `rAF` loop auto-pauses** when delta < 0.1px or tab is hidden
- **Debounced search** (80ms) to avoid filtering on every keystroke
- **`will-change` hints** on animated transforms only
- **`passive: true`** on all scroll/mouse listeners
- **No layout thrashing** — all reads before writes, batched in `rAF`

---

## 📜 License

MIT © [ItsWanheda](https://github.com/ItsWanhedaItsWanheda)
