/* =====================================================================
   Ryan Kim — Portfolio Script (shared by every page)
   ---------------------------------------------------------------------
   1. Light / dark theme toggle (remembers your choice)
   2. Mobile hamburger menu
   3. Header shadow when scrolling
   4. Footer year
   5. Fade-in-on-scroll animations
   6. Project filters (projects page only)
   7. "Screenshot coming soon" fallback
   8. Placeholder links (# and [[...]]) don't jump or break
   ===================================================================== */

(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------------------------------------------------------------
     1. THEME TOGGLE
     - First visit: follows the device setting (light or dark).
     - After clicking the button: remembers the choice in localStorage.
     --------------------------------------------------------------- */
  const THEME_KEY = 'theme';
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const themeToggle = document.getElementById('theme-toggle');

  function getSavedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function saveTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage blocked — ignore */ }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      const next = theme === 'dark' ? 'light' : 'dark';
      themeToggle.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      themeToggle.setAttribute('title', 'Switch to ' + next + ' mode');
    }
  }

  const saved = getSavedTheme();
  applyTheme(saved === 'light' || saved === 'dark' ? saved : (systemDark.matches ? 'dark' : 'light'));

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      saveTheme(next);
    });
  }

  // If the visitor never picked a theme, follow their device when it changes
  function onSystemThemeChange(event) {
    if (!getSavedTheme()) applyTheme(event.matches ? 'dark' : 'light');
  }
  if (systemDark.addEventListener) systemDark.addEventListener('change', onSystemThemeChange);
  else if (systemDark.addListener) systemDark.addListener(onSystemThemeChange); // older Safari


  /* ---------------------------------------------------------------
     2. MOBILE MENU
     --------------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  function setMenu(open) {
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after choosing a link
    navLinks.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    // Close with the Escape key
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Close when clicking anywhere outside the nav
    document.addEventListener('click', function (event) {
      if (navLinks.classList.contains('is-open') && !event.target.closest('.nav')) setMenu(false);
    });

    // Close if the window is resized up to desktop width
    const desktop = window.matchMedia('(min-width: 761px)');
    const onResize = function (event) { if (event.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onResize);
    else if (desktop.addListener) desktop.addListener(onResize);
  }


  /* ---------------------------------------------------------------
     3. HEADER SHADOW ON SCROLL
     --------------------------------------------------------------- */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ---------------------------------------------------------------
     4. FOOTER YEAR
     --------------------------------------------------------------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();


  /* ---------------------------------------------------------------
     5. FADE-IN ON SCROLL
     Any element with class="reveal" fades up when it enters the screen.
     Items sitting side by side (e.g. cards in a grid) appear one after
     another for a gentle staggered effect.
     --------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  revealEls.forEach(function (el) {
    const siblings = Array.from(el.parentElement.children).filter(function (child) {
      return child.classList.contains('reveal');
    });
    if (siblings.length > 1) {
      const index = siblings.indexOf(el);
      el.style.setProperty('--reveal-delay', Math.min(index * 80, 400) + 'ms');
    }
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }


  /* ---------------------------------------------------------------
     6. PROJECT FILTERS (only runs on projects.html)
     A card matches when its data-category contains the button's
     data-filter word. "all" shows everything.
     --------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const filterStatus = document.getElementById('filter-status');
  const emptyState = document.getElementById('empty-state');

  function applyFilter(filter, label) {
    let shown = 0;

    projectCards.forEach(function (card) {
      const categories = (card.dataset.category || '').split(/\s+/);
      const matches = filter === 'all' || categories.indexOf(filter) !== -1;
      const wasHidden = card.hidden;

      card.hidden = !matches;

      if (matches) {
        shown++;
        card.classList.add('is-visible');
        // Small "pop in" animation for cards that were hidden
        if (wasHidden && !reduceMotion) {
          card.classList.remove('is-entering');
          void card.offsetWidth; // restarts the animation
          card.classList.add('is-entering');
        }
      }
    });

    if (emptyState) emptyState.hidden = shown !== 0;

    if (filterStatus) {
      const noun = shown === 1 ? 'project' : 'projects';
      filterStatus.textContent = 'Showing ' + shown + ' ' + noun + (filter === 'all' ? '' : ' in ' + label);
    }
  }

  // Remove the pop-in class when done so the hover lift works again
  projectCards.forEach(function (card) {
    card.addEventListener('animationend', function () { card.classList.remove('is-entering'); });
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      applyFilter(button.dataset.filter, button.textContent.trim());
    });
  });

  if (projectCards.length) applyFilter('all', 'All');


  /* ---------------------------------------------------------------
     7. SCREENSHOT FALLBACK
     Each <img> also has an onerror="" in the HTML. This is a backup
     for images that already failed before this script loaded.
     --------------------------------------------------------------- */
  document.querySelectorAll('.project-media img').forEach(function (img) {
    const markMissing = function () { img.parentElement.classList.add('is-missing'); };
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener('error', markMissing);
  });


  /* ---------------------------------------------------------------
     8. PLACEHOLDER LINKS
     Links that are still "#" or contain [[...]] do nothing when
     clicked (instead of jumping to the top or opening a broken page).
     They start working automatically once you put in a real URL.
     --------------------------------------------------------------- */
  document.querySelectorAll('a[href="#"], a[href*="[["], a[href*="%5B%5B"]').forEach(function (link) {
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('title', 'Coming soon');
    link.addEventListener('click', function (event) { event.preventDefault(); });
  });

})();
