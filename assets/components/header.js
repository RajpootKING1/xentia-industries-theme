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
}

export const headerController = new HeaderController();

// Global handle
window.headerController = headerController;
