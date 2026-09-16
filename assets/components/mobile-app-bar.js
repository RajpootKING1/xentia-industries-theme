/**
 * XENTIA INDUSTRIES - MOBILE BOTTOM APP BAR CONTROLLER
 * Version: 1.0.0
 * 
 * Delivers native iOS/Android bottom navigation bar experience with reactive
 * cart counter badges, active route indicator, and direct cart drawer opening.
 */

import { cartController } from '../cart.js';

export class MobileAppBarController {
  constructor() {
    this.bar = null;
    this.cartBadge = null;
  }

  init() {
    this.bar = document.querySelector('.mobile-bottom-app-bar');
    if (!this.bar) return;

    this.cartBadge = this.bar.querySelector('#mobile-bottom-cart-badge');

    // 1. Sync Active Route
    this._highlightActiveRoute();

    // 2. Wire Cart Click to Open Drawer
    const cartTrigger = this.bar.querySelector('#mobile-bottom-cart-btn');
    if (cartTrigger) {
      cartTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        cartController.openDrawer();
      });
    }

    // 3. Listen to Cart Changes
    window.addEventListener('xentia:cart:updated', (e) => {
      const { totalQuantity } = e.detail;
      this.updateCartBadge(totalQuantity);
    });

    // Check initial cart count if available
    if (cartController && cartController.cart) {
      this.updateCartBadge(cartController.cart.totalQuantity || 0);
    }
  }

  updateCartBadge(count) {
    if (!this.cartBadge) return;
    if (count > 0) {
      this.cartBadge.textContent = String(count);
      this.cartBadge.style.display = 'inline-flex';
    } else {
      this.cartBadge.style.display = 'none';
    }
  }

  _highlightActiveRoute() {
    const currentPath = window.location.pathname.toLowerCase();
    const currentHash = window.location.hash;
    const links = this.bar.querySelectorAll('.mobile-nav-item');

    links.forEach((link) => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      link.classList.remove('active');

      if (href === currentPath || (currentPath.endsWith('/') && href.includes('index.html'))) {
        link.classList.add('active');
      } else if (currentPath.includes(href) && href !== 'index.html' && href !== '/' && href !== '#') {
        link.classList.add('active');
      } else if (currentHash && href.includes(currentHash)) {
        link.classList.add('active');
      }
    });

    // If none matched and on homepage
    if (![...links].some(l => l.classList.contains('active'))) {
      const homeLink = this.bar.querySelector('a[href="index.html"]');
      if (homeLink && (currentPath === '/' || currentPath.endsWith('index.html') || currentPath === '')) {
        homeLink.classList.add('active');
      }
    }
  }
}

export const mobileAppBarController = new MobileAppBarController();
