/**
 * XENTIA INDUSTRIES - ARCHITECTURAL HEADER & MEGA-MENU CONTROLLER
 * Version: 1.0.0 (Milestone 4 Execution)
 * Authority: /docs/HOMEPAGE-UX-ARCHITECTURE.md
 * 
 * Manages desktop 4-wing clinical mega-menu, mobile slide-out navigation drawer,
 * search focus routing, and accessible keyboard navigation (Esc/focus trapping).
 */

export class HeaderController {
  constructor() {
    this.megaMenuTrigger = null;
    this.megaMenu = null;
    this.mobileToggle = null;
    this.mobileDrawer = null;
    this.mobileBackdrop = null;
    this.mobileCloseBtn = null;
    this.megaMenuTimeout = null;
    this.isDrawerOpen = false;
    this.isMegaMenuOpen = false;
  }

  /**
   * Initialize all header triggers and keyboard handlers
   */
  init() {
    console.log('[HeaderController] Initializing Architectural Header & Mega-Menu...');

    // Desktop Mega Menu Elements
    this.megaMenuTrigger = document.getElementById('nav-products-trigger');
    this.megaMenu = document.getElementById('products-mega-menu');

    // Mobile Drawer Elements
    this.mobileToggle = document.getElementById('mobile-menu-toggle');
    this.mobileDrawer = document.getElementById('mobile-nav-drawer');
    this.mobileBackdrop = document.getElementById('mobile-drawer-backdrop');
    this.mobileCloseBtn = document.getElementById('mobile-drawer-close');

    // Setup interactions
    this._setupDesktopMegaMenu();
    this._setupMobileDrawer();
    this._setupSearchShortcut();
    this._setupGlobalKeyboard();

    // Setup dynamic active nav highlighting
    this._highlightActiveNav();
    window.addEventListener('popstate', () => this._highlightActiveNav());
    window.addEventListener('hashchange', () => this._highlightActiveNav());
  }

  /**
   * Desktop Mega-Menu Hover & Keyboard Focus
   * @private
   */
  _setupDesktopMegaMenu() {
    if (!this.megaMenuTrigger || !this.megaMenu) return;

    const navItem = this.megaMenuTrigger.closest('.nav-item-has-mega');
    if (!navItem) return;

    // Hover Enter
    navItem.addEventListener('mouseenter', () => {
      clearTimeout(this.megaMenuTimeout);
      this.openMegaMenu();
    });

    // Hover Leave (with 160ms grace period to avoid accidental closure)
    navItem.addEventListener('mouseleave', () => {
      this.megaMenuTimeout = setTimeout(() => {
        this.closeMegaMenu();
      }, 160);
    });

    // Click / Enter toggle for keyboard accessibility
    this.megaMenuTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.isMegaMenuOpen) {
        this.closeMegaMenu();
      } else {
        this.openMegaMenu();
      }
    });

    // Close when focus moves outside mega-menu
    navItem.addEventListener('focusout', (e) => {
      if (!navItem.contains(e.relatedTarget)) {
        this.closeMegaMenu();
      }
    });
  }

  /**
   * Open Desktop Mega-Menu
   */
  openMegaMenu() {
    if (!this.megaMenu || !this.megaMenuTrigger) return;
    this.isMegaMenuOpen = true;
    this.megaMenu.classList.add('is-open');
    this.megaMenuTrigger.setAttribute('aria-expanded', 'true');
  }

  /**
   * Close Desktop Mega-Menu
   */
  closeMegaMenu() {
    if (!this.megaMenu || !this.megaMenuTrigger) return;
    this.isMegaMenuOpen = false;
    this.megaMenu.classList.remove('is-open');
    this.megaMenuTrigger.setAttribute('aria-expanded', 'false');
  }

  /**
   * Mobile Slide-Out Drawer Setup
   * @private
   */
  _setupMobileDrawer() {
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => {
        this.toggleMobileDrawer();
      });
    }

    if (this.mobileCloseBtn) {
      this.mobileCloseBtn.addEventListener('click', () => {
        this.closeMobileDrawer();
      });
    }

    if (this.mobileBackdrop) {
      this.mobileBackdrop.addEventListener('click', () => {
        this.closeMobileDrawer();
      });
    }

    // Mobile Disciplines Accordion Toggle
    const discToggle = document.getElementById('mobile-disciplines-toggle');
    const discList = document.getElementById('mobile-disciplines-list');
    if (discToggle && discList) {
      discToggle.addEventListener('click', () => {
        const isExpanded = discToggle.getAttribute('aria-expanded') === 'true';
        discToggle.setAttribute('aria-expanded', String(!isExpanded));
        discList.classList.toggle('hidden', isExpanded);
      });
    }

    // Close drawer when any internal navigation link is clicked
    if (this.mobileDrawer) {
      this.mobileDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          this.closeMobileDrawer();
        });
      });
    }
  }

  /**
   * Toggle Mobile Drawer
   */
  toggleMobileDrawer() {
    if (this.isDrawerOpen) {
      this.closeMobileDrawer();
    } else {
      this.openMobileDrawer();
    }
  }

  /**
   * Open Mobile Drawer
   */
  openMobileDrawer() {
    if (!this.mobileDrawer) return;
    this.isDrawerOpen = true;
    this.mobileDrawer.classList.add('is-open');
    if (this.mobileBackdrop) this.mobileBackdrop.classList.add('is-open');
    if (this.mobileToggle) this.mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-nav-open');

    // Focus close button for accessibility
    if (this.mobileCloseBtn) {
      setTimeout(() => this.mobileCloseBtn.focus(), 100);
    }
  }

  /**
   * Close Mobile Drawer
   */
  closeMobileDrawer() {
    if (!this.mobileDrawer) return;
    this.isDrawerOpen = false;
    this.mobileDrawer.classList.remove('is-open');
    if (this.mobileBackdrop) this.mobileBackdrop.classList.remove('is-open');
    if (this.mobileToggle) this.mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-nav-open');
  }

  /**
   * Header Search Shortcut Button
   * @private
   */
  _setupSearchShortcut() {
    const searchBtn = document.getElementById('header-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const categoriesSection = document.getElementById('categories');
        const searchInput = document.getElementById('catalog-search-input');
        if (categoriesSection) {
          categoriesSection.scrollIntoView({ behavior: 'smooth' });
          if (searchInput) {
            setTimeout(() => searchInput.focus(), 400);
          }
        } else {
          window.location.href = 'index.html#categories';
        }
      });
    }
  }

  /**
   * Global Keyboard Handling (Escape closes mega-menu and mobile drawer)
   * @private
   */
  _setupGlobalKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isMegaMenuOpen) {
          this.closeMegaMenu();
          if (this.megaMenuTrigger) this.megaMenuTrigger.focus();
        }
        if (this.isDrawerOpen) {
          this.closeMobileDrawer();
          if (this.mobileToggle) this.mobileToggle.focus();
        }
      }
    });
  }

  /**
   * Dynamically highlight active navigation links based on current window.location
   * Synchronizes desktop navbar, mobile drawer, and mobile bottom app bar.
   * @private
   */
  _highlightActiveNav() {
    try {
      const pathname = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();

      // Determine active page key based on URL pathname and legacy hash anchors
      let activeKey = '';
      if (
        pathname.includes('wholesale') ||
        pathname.includes('custom-order') ||
        pathname.includes('custom-orders') ||
        hash === '#oem-showcase'
      ) {
        activeKey = 'wholesale';
      } else if (
        pathname.includes('surgical-set') ||
        pathname.includes('surgical-sets') ||
        hash === '#surgical-sets'
      ) {
        activeKey = 'sets';
      } else if (pathname.includes('about')) {
        activeKey = 'about';
      } else if (pathname.includes('contact')) {
        activeKey = 'contact';
      } else if (pathname.includes('faq')) {
        activeKey = 'faqs';
      } else if (pathname.includes('polic')) {
        activeKey = 'policies';
      } else if (
        pathname.includes('account') ||
        pathname.includes('login') ||
        pathname.includes('register')
      ) {
        activeKey = 'account';
      } else if (
        pathname.includes('/collection') ||
        pathname.includes('/product') ||
        pathname.includes('products-categories') ||
        pathname.includes('catalog') ||
        pathname.includes('shop')
      ) {
        activeKey = 'products';
      } else if (
        pathname === '/' ||
        pathname === '' ||
        pathname.endsWith('/index.html') ||
        pathname.endsWith('/')
      ) {
        activeKey = 'home';
      }

      // 1. Desktop Main Navigation
      const desktopNav = document.querySelector('.site-header nav');
      if (desktopNav) {
        const desktopLinks = desktopNav.querySelectorAll('.site-nav-link, a:not(.btn)');
        desktopLinks.forEach(link => {
          link.classList.remove('is-active', 'active');
          link.removeAttribute('aria-current');
          link.style.color = 'var(--color-steel-silver)';
          link.style.fontWeight = 'var(--weight-semibold)';
        });

        let targetLink = null;
        if (activeKey === 'wholesale') {
          targetLink = desktopNav.querySelector('.site-nav-wholesale, a[href*="wholesale"], a[href*="custom-order"]');
        } else if (activeKey === 'sets') {
          targetLink = desktopNav.querySelector('.site-nav-sets, a[href*="surgical-sets"]');
        } else if (activeKey === 'about') {
          targetLink = desktopNav.querySelector('.site-nav-about, a[href*="about"]');
        } else if (activeKey === 'contact') {
          targetLink = desktopNav.querySelector('.site-nav-contact, a[href*="contact"]');
        } else if (activeKey === 'faqs') {
          targetLink = desktopNav.querySelector('.site-nav-faqs, a[href*="faq"]');
        } else if (activeKey === 'products') {
          targetLink = desktopNav.querySelector('.site-nav-products, .nav-products-link, a[href*="products"], a[href*="collections"]');
        } else if (activeKey === 'home') {
          targetLink = desktopNav.querySelector('.site-nav-home, a[href="/"], a[href$="index.html"]');
        }

        if (targetLink) {
          targetLink.classList.add('is-active', 'active');
          targetLink.setAttribute('aria-current', 'page');
          targetLink.style.color = 'var(--color-gold-base)';
          targetLink.style.fontWeight = '700';

          // Highlight products chevron button if on products
          const chevronBtn = document.getElementById('nav-products-trigger');
          if (chevronBtn) {
            chevronBtn.style.color = activeKey === 'products' ? 'var(--color-gold-base)' : 'var(--color-steel-silver)';
          }
        }
      }

      // 2. Mobile Nav Drawer Links
      const mobileDrawer = document.getElementById('mobile-nav-drawer');
      if (mobileDrawer) {
        const mobileLinks = mobileDrawer.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
          link.classList.remove('is-active', 'active');
          link.removeAttribute('aria-current');
          link.style.color = '';
          link.style.fontWeight = '';
        });

        let targetMobileLink = null;
        if (activeKey === 'wholesale') {
          targetMobileLink = mobileDrawer.querySelector('a[href*="wholesale"], a[href*="custom-order"]');
        } else if (activeKey === 'sets') {
          targetMobileLink = mobileDrawer.querySelector('a[href*="surgical-sets"]');
        } else if (activeKey === 'about') {
          targetMobileLink = mobileDrawer.querySelector('a[href*="about"]');
        } else if (activeKey === 'contact') {
          targetMobileLink = mobileDrawer.querySelector('a[href*="contact"]');
        } else if (activeKey === 'faqs') {
          targetMobileLink = mobileDrawer.querySelector('a[href*="faq"]');
        } else if (activeKey === 'policies') {
          targetMobileLink = mobileDrawer.querySelector('a[href*="polic"]');
        } else if (activeKey === 'account') {
          targetMobileLink = mobileDrawer.querySelector('a[href*="account"], a[href*="login"]');
        } else if (activeKey === 'products') {
          targetMobileLink = mobileDrawer.querySelector('a[href*="products"], a[href*="collections"]');
        } else if (activeKey === 'home') {
          targetMobileLink = mobileDrawer.querySelector('a[href="/"], a[href$="index.html"]');
        }

        if (targetMobileLink) {
          targetMobileLink.classList.add('is-active', 'active');
          targetMobileLink.setAttribute('aria-current', 'page');
          targetMobileLink.style.color = 'var(--color-gold-base)';
          targetMobileLink.style.fontWeight = '700';
        }
      }

      // 3. Mobile Bottom App Bar
      const mobileAppBar = document.querySelector('.mobile-bottom-app-bar');
      if (mobileAppBar) {
        const appItems = mobileAppBar.querySelectorAll('.mobile-app-nav-item');
        appItems.forEach(item => item.classList.remove('active', 'is-active'));

        let targetAppItem = null;
        if (activeKey === 'wholesale') {
          targetAppItem = mobileAppBar.querySelector('a[href*="wholesale"], a.b2b-quote-action');
        } else if (activeKey === 'products' || activeKey === 'sets') {
          targetAppItem = mobileAppBar.querySelector('a[href*="product"], a[href*="collection"]');
        } else if (activeKey === 'account') {
          targetAppItem = mobileAppBar.querySelector('a[href*="account"]');
        } else if (activeKey === 'home') {
          targetAppItem = mobileAppBar.querySelector('a[href="/"], a[href$="index.html"]');
        }

        if (targetAppItem) {
          targetAppItem.classList.add('active', 'is-active');
        }
      }
    } catch (err) {
      console.warn('[HeaderController] Error updating active navigation highlighting:', err);
    }
  }
}

export const headerController = new HeaderController();

// Global handle
window.headerController = headerController;
