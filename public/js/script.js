/* ==========================================================================
   Nexus UI — Enhanced Navbar Controller
   --------------------------------------------------------------------------
   - Performance: debounced scroll, IntersectionObserver, paused rAF
   - UX: real-time search filter, keyboard nav, recent searches
   - Accessibility: ARIA, focus management, keyboard shortcuts
   - Modular: each feature is an isolated module
   ========================================================================== */

(() => {
  'use strict';

  /* ============================================================
     1. ELEMENT CACHE & STATE
     ============================================================ */

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const els = {
    navbar:           $('#navbar'),
    hamburger:        $('#hamburger'),
    mobileMenu:       $('#mobileMenu'),
    mobileLinks:      $$('.mobile-link'),
    navLinks:         $$('.nav-link'),
    themeToggle:      $('#themeToggle'),
    searchToggle:     $('#searchToggle'),
    searchOverlay:    $('#searchOverlay'),
    searchInput:      $('#searchInput'),
    searchClear:      $('#searchClear'),
    searchRecent:     $('#searchRecentList'),
    searchRecentSec:  $('#searchRecentSection'),
    searchQuick:      $('#searchQuickList'),
    searchPages:      $('#searchPagesList'),
    searchActions:    $('#searchActionsList'),
    searchEmpty:      $('#searchEmpty'),
    searchEmptyQuery: $('#searchEmptyQuery'),
    scrollProgress:   $('#scrollProgress'),
    cursor:           $('#cursor'),
    cursorFollower:   $('#cursorFollower'),
    notifToggle:      $('#notificationToggle'),
    notifPanel:       $('#notificationPanel'),
    notifList:        $('#notificationList'),
    notifEmpty:       $('#notificationEmpty'),
    notifDot:         $('#notificationDot'),
    notifCount:       $('#notificationCount'),
    notifSubtitle:    $('#notificationSubtitle'),
    markAllRead:      $('#markAllRead'),
    clearRecent:      $('#clearRecent'),
    avatarToggle:     $('#avatarToggle'),
    profilePanel:     $('#profilePanel'),
  };

  const state = {
    mouseX: 0,
    mouseY: 0,
    followerX: 0,
    followerY: 0,
    cursorVisible: false,
    cursorRunning: false,
    lastScroll: 0,
    ticking: false,
    searchOpen: false,
    searchQuery: '',
    searchActiveIdx: -1,
    searchItems: [],
    notifFilter: 'all',
    notifications: [],
    openDropdown: null, // 'notif' | 'profile' | null
  };

  /* ============================================================
     2. UTILITIES
     ============================================================ */

  const STORAGE = {
    theme:      () => localStorage.getItem('nexus-theme'),
    setTheme:   v => localStorage.setItem('nexus-theme', v),
    recents:    () => JSON.parse(localStorage.getItem('nexus-recents') || '[]'),
    setRecents: v => localStorage.setItem('nexus-recents', JSON.stringify(v)),
    notifs:     () => JSON.parse(localStorage.getItem('nexus-notifs') || 'null'),
    setNotifs:  v => localStorage.setItem('nexus-notifs', JSON.stringify(v)),
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function debounce(fn, wait = 150) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  function highlight(text, query) {
    if (!query) return escapeHTML(text);
    const safe = escapeHTML(text);
    const safeQ = escapeHTML(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return safe.replace(new RegExp(`(${safeQ})`, 'gi'), '<mark>$1</mark>');
  }

  function relativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const min = 60 * 1000, hr = 60 * min, day = 24 * hr;
    if (diff < min) return 'just now';
    if (diff < hr)  return `${Math.floor(diff / min)}m ago`;
    if (diff < day) return `${Math.floor(diff / hr)}h ago`;
    if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  /* ============================================================
     3. CUSTOM CURSOR (pause when hidden)
     ============================================================ */

  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (!els.cursor || !els.cursorFollower) return;

    document.addEventListener('mousemove', e => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;

      // Instant position for the small dot
      els.cursor.style.transform =
        `translate3d(${state.mouseX}px, ${state.mouseY}px, 0) translate(-50%, -50%)`;

      if (!state.cursorVisible) {
        state.cursorVisible = true;
        document.body.classList.remove('cursor-hidden');
      }

      if (!state.cursorRunning) {
        state.cursorRunning = true;
        animateFollower();
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      state.cursorVisible = false;
      document.body.classList.add('cursor-hidden');
    });
    document.addEventListener('mouseenter', () => {
      state.cursorVisible = true;
      document.body.classList.remove('cursor-hidden');
    });

    document.addEventListener('visibilitychange', () => {
      // Stop rAF loop when tab is hidden
      if (document.hidden) state.cursorRunning = false;
    });

    // Hover state
    document.addEventListener('mouseover', e => {
      if (e.target.closest('a, button, [data-magnetic], input, textarea, select, [role="menuitem"]')) {
        els.cursorFollower.classList.add('hover');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a, button, [data-magnetic], input, textarea, select, [role="menuitem"]')) {
        els.cursorFollower.classList.remove('hover');
      }
    });
  }

  function animateFollower() {
    if (!state.cursorRunning) return;

    const dx = state.mouseX - state.followerX;
    const dy = state.mouseY - state.followerY;

    state.followerX += dx * 0.15;
    state.followerY += dy * 0.15;

    els.cursorFollower.style.transform =
      `translate3d(${state.followerX}px, ${state.followerY}px, 0) translate(-50%, -50%)`;

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      requestAnimationFrame(animateFollower);
    } else {
      state.cursorRunning = false;
    }
  }

  /* ============================================================
     4. MAGNETIC EFFECT (delegated, throttled)
     ============================================================ */

  function initMagnetic() {
    if (prefersReducedMotion) return;

    document.addEventListener('mousemove', e => {
      const target = e.target.closest('[data-magnetic]');
      if (!target || target.contains(e.target) === false) return;
      // Above only sets target if mouse is inside it

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      target.style.setProperty('--mx', `${x * 0.2}px`);
      target.style.setProperty('--my', `${y * 0.2}px`);
      target.style.transform = `translate(var(--mx, 0), var(--my, 0))`;
    }, { passive: true });

    document.addEventListener('mouseleave', e => {
      const target = e.target.closest?.('[data-magnetic]');
      if (target && !target.contains(e.relatedTarget)) {
        target.style.transform = '';
      }
    }, true);
  }

  /* ============================================================
     5. NAVBAR SCROLL (single rAF-throttled handler)
     ============================================================ */

  function initScrollEffects() {
    const onScroll = () => {
      state.lastScroll = window.pageYOffset;

      // Scrolled state
      els.navbar.classList.toggle('scrolled', state.lastScroll > 20);

      // Hide-on-scroll-down (only if user has scrolled past hero)
      const goingDown = state.lastScroll > state._prevScroll;
      if (goingDown && state.lastScroll > 200) {
        els.navbar.classList.add('hidden');
      } else if (!goingDown) {
        els.navbar.classList.remove('hidden');
      }
      state._prevScroll = state.lastScroll;

      // Scroll progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (state.lastScroll / docHeight) * 100 : 0;
      els.scrollProgress.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', () => {
      if (!state.ticking) {
        requestAnimationFrame(() => {
          onScroll();
          state.ticking = false;
        });
        state.ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================================
     6. ACTIVE LINK SYNC (IntersectionObserver)
     ============================================================ */

  function initActiveLinks() {
    const sections = $$('section[id]');
    if (!sections.length) return;

    const setActive = (id) => {
      [...els.navLinks, ...els.mobileLinks].forEach(l => {
        const href = l.getAttribute('href')?.replace('#', '');
        l.classList.toggle('active', href === id);
      });
    };

    const observer = new IntersectionObserver((entries) => {
      // Pick the entry that is most visible
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible) setActive(visible.target.id);
    }, {
      rootMargin: '-30% 0px -50% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    sections.forEach(s => observer.observe(s));

    // Click handler (set immediately on click for snappier feel)
    els.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const id = link.getAttribute('href')?.replace('#', '');
        if (id) setActive(id);
      });
    });
  }

  /* ============================================================
     7. THEME TOGGLE
     ============================================================ */

  function initTheme() {
    const saved = STORAGE.theme();
    const initial = saved || 'dark';
    document.documentElement.setAttribute('data-theme', initial);

    els.themeToggle?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      STORAGE.setTheme(next);
    });
  }

  /* ============================================================
     8. SEARCH OVERLAY (real-time + keyboard nav)
     ============================================================ */

  // Searchable items registry
  const SEARCH_INDEX = [
    // Pages
    { type: 'page', icon: '🏠', title: 'Home', desc: 'Back to landing', href: '#home', keys: 'g h' },
    { type: 'page', icon: '⚡', title: 'Features', desc: 'Explore what we offer', href: '#features', keys: 'g f' },
    { type: 'page', icon: '💎', title: 'Pricing', desc: 'Plans for every team', href: '#pricing', keys: 'g p' },
    { type: 'page', icon: '👥', title: 'About', desc: 'Our story and mission', href: '#about', keys: 'g a' },
    { type: 'page', icon: '📝', title: 'Blog', desc: 'News and tutorials', href: '#blog', keys: 'g b' },
    // Quick links
    { type: 'quick', icon: '🚀', title: 'Getting Started', desc: 'Set up in 5 minutes', href: '#', keys: 'g s' },
    { type: 'quick', icon: '📚', title: 'Documentation', desc: 'API and guides', href: '#', keys: 'g d' },
    { type: 'quick', icon: '🎨', title: 'Templates', desc: 'Pre-built designs', href: '#', keys: 'g t' },
    { type: 'quick', icon: '💬', title: 'Community', desc: 'Join the Discord', href: '#', keys: 'g c' },
    // Actions
    { type: 'action', icon: '⚙️', title: 'Open Settings', desc: 'Preferences and config', href: '#', action: () => alert('Settings opened!') },
    { type: 'action', icon: '🌙', title: 'Toggle Theme', desc: 'Switch light/dark mode', href: '#', action: () => els.themeToggle?.click() },
    { type: 'action', icon: '🔔', title: 'View Notifications', desc: 'See all alerts', href: '#', action: () => { closeSearch(); els.notifToggle?.click(); } },
    { type: 'action', icon: '👤', title: 'Open Profile', desc: 'Account menu', href: '#', action: () => { closeSearch(); els.avatarToggle?.click(); } },
  ];

  function renderSearchItems(items, query = '') {
    const renderList = (list, container) => {
      if (!container) return;
      container.innerHTML = items
        .filter(i => i.type === list)
        .map((item, idx) => {
          const globalIdx = items.indexOf(item);
          return `
            <button type="button" class="search-item" data-idx="${globalIdx}" data-href="${escapeHTML(item.href)}">
              <div class="search-item-icon">${item.icon}</div>
              <div class="search-item-body">
                <div class="search-item-title">${highlight(item.title, query)}</div>
                ${item.desc ? `<div class="search-item-desc">${highlight(item.desc, query)}</div>` : ''}
              </div>
              ${item.keys ? `<span class="search-item-kbd">${item.keys}</span>` : ''}
            </button>
          `;
        }).join('');
    };

    renderList('recent', els.searchRecent);
    renderList('quick', els.searchQuick);
    renderList('page', els.searchPages);
    renderList('action', els.searchActions);

    // Show/hide sections based on results
    const hasResults = items.length > 0;
    const showSection = (container, type) => {
      const section = container?.closest('.search-section');
      if (section) section.hidden = !items.some(i => i.type === type);
    };

    if (!query) {
      // Default state: show recents (if any) + quick + pages + actions
      const recents = STORAGE.recents();
      if (recents.length) {
        els.searchRecentSec.hidden = false;
        els.searchRecent.innerHTML = recents.map((r, idx) => `
          <button type="button" class="search-item" data-recent="${escapeHTML(r.title)}">
            <div class="search-item-icon">🕘</div>
            <div class="search-item-body">
              <div class="search-item-title">${escapeHTML(r.title)}</div>
              ${r.desc ? `<div class="search-item-desc">${escapeHTML(r.desc)}</div>` : ''}
            </div>
          </button>
        `).join('');
      } else {
        els.searchRecentSec.hidden = true;
      }
      showSection(els.searchQuick, 'quick');
      showSection(els.searchPages, 'page');
      showSection(els.searchActions, 'action');
    } else {
      els.searchRecentSec.hidden = true;
      showSection(els.searchQuick, 'quick');
      showSection(els.searchPages, 'page');
      showSection(els.searchActions, 'action');
    }

    // Empty state
    const noResults = !hasResults;
    els.searchEmpty.hidden = !noResults;
    if (noResults && query) {
      els.searchEmptyQuery.textContent = query;
    }

    // Hide all sections if no results
    if (noResults) {
      $$('.search-section', els.searchOverlay).forEach(s => {
        if (s !== els.searchEmpty.closest('.search-section')) s.hidden = true;
      });
    } else if (!query) {
      $$('.search-section', els.searchOverlay).forEach(s => s.hidden = false);
    }

    // Cache items for keyboard nav
    state.searchItems = Array.from($$('.search-item', els.searchOverlay));
    state.searchActiveIdx = state.searchItems.length ? 0 : -1;
    updateActiveSearchItem();
  }

  function updateActiveSearchItem() {
    state.searchItems.forEach((item, i) => {
      item.classList.toggle('active', i === state.searchActiveIdx);
    });

    // Scroll into view
    const active = state.searchItems[state.searchActiveIdx];
    if (active) {
      active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function performSearch(query) {
    state.searchQuery = query;

    if (!query.trim()) {
      renderSearchItems(SEARCH_INDEX);
      return;
    }

    const q = query.toLowerCase().trim();
    const results = SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) ||
      (item.desc && item.desc.toLowerCase().includes(q))
    );

    renderSearchItems(results, query);
  }

  function executeSearchItem(item) {
    if (!item) return;

    // Mark as recent (skip actions)
    const title = item.querySelector('.search-item-title')?.textContent || '';
    const desc = item.querySelector('.search-item-desc')?.textContent || '';
    if (!item.dataset.href || item.dataset.href === '#') {
      // Action — find in index and run
      const actionTitle = item.querySelector('.search-item-title')?.textContent;
      const idx = SEARCH_INDEX.findIndex(i => i.title === actionTitle && i.action);
      if (idx >= 0 && SEARCH_INDEX[idx].action) {
        SEARCH_INDEX[idx].action();
      }
    } else {
      // Add to recents
      const recents = STORAGE.recents().filter(r => r.title !== title);
      recents.unshift({ title, desc });
      STORAGE.setRecents(recents.slice(0, 5));
    }

    // Navigate if href is not '#'
    const href = item.dataset.href;
    if (href && href !== '#') {
      const target = $(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    closeSearch();
  }

  function openSearch() {
    if (state.searchOpen) return;
    state.searchOpen = true;

    els.searchOverlay.hidden = false;
    // Force reflow for transition
    els.searchOverlay.offsetHeight; // eslint-disable-line
    els.searchOverlay.classList.add('active');
    els.searchToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Reset
    els.searchInput.value = '';
    els.searchClear.hidden = true;
    renderSearchItems(SEARCH_INDEX);

    setTimeout(() => els.searchInput.focus(), 200);
  }

  function closeSearch() {
    if (!state.searchOpen) return;
    state.searchOpen = false;

    els.searchOverlay.classList.remove('active');
    els.searchToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    setTimeout(() => {
      if (!state.searchOpen) els.searchOverlay.hidden = true;
    }, 300);
  }

  function initSearch() {
    els.searchToggle?.addEventListener('click', openSearch);

    // Close handlers
    els.searchOverlay.addEventListener('click', e => {
      if (e.target.matches('[data-close-search]') || e.target === els.searchOverlay) closeSearch();
    });

    // Input
    const debouncedSearch = debounce(performSearch, 80);
    els.searchInput?.addEventListener('input', e => {
      els.searchClear.hidden = !e.target.value;
      debouncedSearch(e.target.value);
    });

    // Clear button
    els.searchClear?.addEventListener('click', () => {
      els.searchInput.value = '';
      els.searchClear.hidden = true;
      els.searchInput.focus();
      performSearch('');
    });

    // Clear recents
    els.clearRecent?.addEventListener('click', () => {
      STORAGE.setRecents([]);
      renderSearchItems(SEARCH_INDEX);
    });

    // Click on item
    els.searchOverlay.addEventListener('click', e => {
      const item = e.target.closest('.search-item');
      if (item) executeSearchItem(item);
    });

    // Recent items use a different data attribute for direct re-execution
    els.searchRecent?.addEventListener('click', e => {
      const item = e.target.closest('[data-recent]');
      if (item) {
        const title = item.dataset.recent;
        const recents = STORAGE.recents();
        const found = recents.find(r => r.title === title);
        if (found) {
          // Re-run search by typing
          els.searchInput.value = title;
          els.searchClear.hidden = false;
          performSearch(title);
        }
      }
    });
  }

  /* ============================================================
     9. NOTIFICATION DROPDOWN
     ============================================================ */

  const DEFAULT_NOTIFS = [
    {
      id: 1,
      type: 'mention',
      icon: '@',
      title: '<strong>Sarah Chen</strong> mentioned you in <span class="tag">Design Review</span>',
      time: Date.now() - 5 * 60 * 1000,
      unread: true,
    },
    {
      id: 2,
      type: 'success',
      icon: '✓',
      title: 'Deployment to <strong>production</strong> completed successfully',
      time: Date.now() - 32 * 60 * 1000,
      unread: true,
    },
    {
      id: 3,
      type: 'alert',
      icon: '!',
      title: 'API rate limit exceeded on <strong>api.nexus.io</strong>',
      time: Date.now() - 2 * 60 * 60 * 1000,
      unread: true,
    },
    {
      id: 4,
      type: 'info',
      icon: 'i',
      title: 'New team member <strong>Alex Rivera</strong> joined your workspace',
      time: Date.now() - 5 * 60 * 60 * 1000,
      unread: false,
    },
    {
      id: 5,
      type: 'warning',
      icon: '⚠',
      title: 'Storage usage at <strong>85%</strong> of your plan limit',
      time: Date.now() - 24 * 60 * 60 * 1000,
      unread: false,
    },
    {
      id: 6,
      type: 'mention',
      icon: '@',
      title: '<strong>Marcus</strong> replied to your comment on <span class="tag">#frontend</span>',
      time: Date.now() - 2 * 24 * 60 * 60 * 1000,
      unread: false,
    },
  ];

  function loadNotifications() {
    const saved = STORAGE.notifs();
    state.notifications = saved || DEFAULT_NOTIFS;
    if (!saved) STORAGE.setNotifs(state.notifications);
  }

  function saveNotifications() {
    STORAGE.setNotifs(state.notifications);
  }

  function renderNotifications() {
    const filtered = state.notifications.filter(n => {
      if (state.notifFilter === 'unread') return n.unread;
      if (state.notifFilter === 'mentions') return n.type === 'mention';
      return true;
    });

    if (!filtered.length) {
      els.notifList.hidden = true;
      els.notifEmpty.hidden = false;
    } else {
      els.notifList.hidden = false;
      els.notifEmpty.hidden = true;
      els.notifList.innerHTML = filtered.map(n => `
        <div class="notification-item ${n.unread ? 'unread' : ''}" role="listitem" data-id="${n.id}" tabindex="0">
          <div class="notification-icon ${n.type}" aria-hidden="true">${n.icon}</div>
          <div class="notification-body">
            <div class="notification-text">${n.title}</div>
            <div class="notification-time">
              <span>${relativeTime(n.time)}</span>
              ${n.unread ? '<span class="dot" aria-hidden="true"></span><span>New</span>' : ''}
            </div>
          </div>
        </div>
      `).join('');
    }

    // Update header
    const unreadCount = state.notifications.filter(n => n.unread).length;
    els.notifSubtitle.textContent = unreadCount > 0
      ? `${unreadCount} unread`
      : 'All caught up';

    // Update count badge
    if (unreadCount > 0) {
      els.notifCount.textContent = unreadCount > 9 ? '9+' : unreadCount;
      els.notifCount.hidden = false;
      els.notifDot.style.display = 'none';
    } else {
      els.notifCount.hidden = true;
      els.notifDot.style.display = 'none';
    }
  }

  function toggleNotificationPanel(force) {
    const willOpen = force ?? !els.notifPanel.classList.contains('open');

    closeAllDropdowns();

    if (willOpen) {
      els.notifPanel.hidden = false;
      els.notifPanel.offsetHeight; // eslint-disable-line
      els.notifPanel.classList.add('open');
      els.notifToggle.setAttribute('aria-expanded', 'true');
      state.openDropdown = 'notif';
    } else {
      closeNotificationPanel();
    }
  }

  function closeNotificationPanel() {
    els.notifPanel.classList.remove('open');
    els.notifToggle.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      if (!els.notifPanel.classList.contains('open')) els.notifPanel.hidden = true;
    }, 200);
    if (state.openDropdown === 'notif') state.openDropdown = null;
  }

  function initNotifications() {
    loadNotifications();
    renderNotifications();

    els.notifToggle?.addEventListener('click', e => {
      e.stopPropagation();
      toggleNotificationPanel();
    });

    // Filter tabs
    $$('.notif-filter').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.notif-filter').forEach(t => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        state.notifFilter = tab.dataset.filter;
        renderNotifications();
      });
    });

    // Mark all read
    els.markAllRead?.addEventListener('click', () => {
      state.notifications.forEach(n => n.unread = false);
      saveNotifications();
      renderNotifications();
    });

    // Click on notification
    els.notifList?.addEventListener('click', e => {
      const item = e.target.closest('.notification-item');
      if (!item) return;
      const id = Number(item.dataset.id);
      const notif = state.notifications.find(n => n.id === id);
      if (notif && notif.unread) {
        notif.unread = false;
        saveNotifications();
        renderNotifications();
      }
    });

    // Keyboard support
    els.notifList?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.target.click();
      }
    });
  }

  /* ============================================================
     10. PROFILE DROPDOWN
     ============================================================ */

  function toggleProfilePanel(force) {
    const willOpen = force ?? !els.profilePanel.classList.contains('open');

    closeAllDropdowns();

    if (willOpen) {
      els.profilePanel.hidden = false;
      els.profilePanel.offsetHeight; // eslint-disable-line
      els.profilePanel.classList.add('open');
      els.avatarToggle.setAttribute('aria-expanded', 'true');
      state.openDropdown = 'profile';
    } else {
      closeProfilePanel();
    }
  }

  function closeProfilePanel() {
    els.profilePanel.classList.remove('open');
    els.avatarToggle.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      if (!els.profilePanel.classList.contains('open')) els.profilePanel.hidden = true;
    }, 200);
    if (state.openDropdown === 'profile') state.openDropdown = null;
  }

  function initProfile() {
    els.avatarToggle?.addEventListener('click', e => {
      e.stopPropagation();
      toggleProfilePanel();
    });
  }

  /* ============================================================
     11. DROPDOWN COORDINATION
     ============================================================ */

  function closeAllDropdowns() {
    closeNotificationPanel();
    closeProfilePanel();
  }

  function initGlobalDropdowns() {
    // Close on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.notification-panel, .notification-btn')) {
        if (state.openDropdown === 'notif') closeNotificationPanel();
      }
      if (!e.target.closest('.profile-panel, .avatar-btn')) {
        if (state.openDropdown === 'profile') closeProfilePanel();
      }
    });

    // Close on resize
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 1100) closeAllDropdowns();
    }, 150));
  }

  /* ============================================================
     12. MOBILE MENU
     ============================================================ */

  function toggleMobileMenu() {
    const isOpen = els.mobileMenu.classList.contains('active');
    if (isOpen) closeMobileMenu();
    else openMobileMenu();
  }

  function openMobileMenu() {
    closeAllDropdowns();
    if (state.searchOpen) closeSearch();

    els.hamburger.classList.add('active');
    els.hamburger.setAttribute('aria-expanded', 'true');
    els.mobileMenu.classList.add('active');
    els.mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    els.hamburger.classList.remove('active');
    els.hamburger.setAttribute('aria-expanded', 'false');
    els.mobileMenu.classList.remove('active');
    els.mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initMobileMenu() {
    els.hamburger?.addEventListener('click', toggleMobileMenu);

    els.mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(closeMobileMenu, 100);
      });
    });
  }

  /* ============================================================
     13. GLOBAL KEYBOARD SHORTCUTS
     ============================================================ */

  function initKeyboard() {
    document.addEventListener('keydown', e => {
      // Ignore when typing in inputs (except our search input itself)
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      const isSearchInput = document.activeElement === els.searchInput;

      // Cmd/Ctrl + K → open search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (state.searchOpen) closeSearch();
        else openSearch();
        return;
      }

      // ESC
      if (e.key === 'Escape') {
        if (state.searchOpen) { closeSearch(); return; }
        if (els.mobileMenu.classList.contains('active')) { closeMobileMenu(); return; }
        if (state.openDropdown) { closeAllDropdowns(); return; }
      }

      // Slash to open search (when not typing)
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        openSearch();
        return;
      }

      // Search navigation
      if (state.searchOpen && isSearchInput) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          state.searchActiveIdx = Math.min(state.searchActiveIdx + 1, state.searchItems.length - 1);
          updateActiveSearchItem();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          state.searchActiveIdx = Math.max(state.searchActiveIdx - 1, 0);
          updateActiveSearchItem();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const item = state.searchItems[state.searchActiveIdx];
          if (item) executeSearchItem(item);
        }
      }
    });
  }

  /* ============================================================
     14. SMOOTH SCROLL FOR ANCHORS
     ============================================================ */

  function initSmoothScroll() {
    document.addEventListener('click', e => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href === '#' || href.length < 2) return;

      const target = $(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ============================================================
     15. FEATURE CARD SPOTLIGHT
     ============================================================ */

  function initSpotlight() {
    if (prefersReducedMotion) return;

    $$('.feature-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }

  /* ============================================================
     16. INTERSECTION OBSERVER FOR REVEAL ANIMATIONS
     ============================================================ */

  function initReveal() {
    const targets = $$('.feature-card, .hero-badge, .hero-title, .hero-desc, .hero-actions, .hero-stats');
    if (!targets.length || prefersReducedMotion) return;

    targets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  /* ============================================================
     17. AURORA PARALLAX (throttled)
     ============================================================ */

  function initAuroraParallax() {
    if (prefersReducedMotion) return;

    const blobs = $$('.aurora-blob');
    if (!blobs.length) return;

    let pendingX = 0, pendingY = 0, scheduled = false;

    document.addEventListener('mousemove', e => {
      pendingX = (e.clientX / window.innerWidth - 0.5) * 30;
      pendingY = (e.clientY / window.innerHeight - 0.5) * 30;

      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(() => {
          blobs.forEach((blob, i) => {
            const factor = (i + 1) * 0.5;
            blob.style.transform =
              `translate(${pendingX * factor}px, ${pendingY * factor}px)`;
          });
          scheduled = false;
        });
      }
    }, { passive: true });
  }

  /* ============================================================
     18. INIT
     ============================================================ */

  function init() {
    initCursor();
    initMagnetic();
    initScrollEffects();
    initActiveLinks();
    initTheme();
    initSearch();
    initNotifications();
    initProfile();
    initGlobalDropdowns();
    initMobileMenu();
    initKeyboard();
    initSmoothScroll();
    initSpotlight();
    initReveal();
    initAuroraParallax();

    // First-render
    state._prevScroll = window.pageYOffset;
  }

  // Wait for fonts/DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Friendly console banner
  console.log(
    '%c✨ Nexus UI Ready %cv3.0',
    'background: linear-gradient(135deg, #a78bfa, #ec4899); color: white; padding: 8px 16px; border-radius: 8px 0 0 8px; font-weight: bold;',
    'background: #0c0c14; color: #a78bfa; padding: 8px 16px; border-radius: 0 8px 8px 0; font-weight: bold;'
  );
  console.log('%cKeyboard shortcuts: ⌘K / Ctrl+K · / · ESC', 'color: rgba(255,255,255,0.5); font-style: italic;');
})();