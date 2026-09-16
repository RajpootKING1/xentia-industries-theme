/**
 * XENTIA INDUSTRIES - SHOPIFY CART CONTROLLER & BUY NOW ENGINE
 * Version: 2.0.0 (Milestone 2 Production Foundation)
 * Authority: /docs/SHOPIFY-SECURITY.md & /docs/ARCHITECTURE-DECISION.md
 * 
 * Provides native Shopify Storefront Cart management, persistent session state,
 * cart drawer orchestration, Buy Now checkout flow, and custom UI events.
 */

import { shopifyClient, formatMoney } from './api.js';
import { CONFIG } from './config.js';

const STORAGE_KEY_CART_ID = 'xentia_shopify_cart_id';

class CartController {
  constructor() {
    try {
      this.cartId = localStorage.getItem(STORAGE_KEY_CART_ID) || null;
    } catch (e) {
      this.cartId = null;
    }
    this.cart = null;
    this.isLoading = false;
    this.subscribers = new Set();
  }

  /**
   * Initialize cart on application boot
   */
  async init() {
    console.log('[CartController] Initializing Shopify Cart...');
    try {
      if (this.cartId) {
        // Attempt to fetch existing cart
        const existing = await shopifyClient.getCart(this.cartId);
        if (existing && existing.id) {
          this.cart = existing;
          this._notifyUpdate();
          return this.cart;
        } else {
          // Stale cart ID, clear and create fresh
          try { localStorage.removeItem(STORAGE_KEY_CART_ID); } catch(e){}
          this.cartId = null;
        }
      }
    } catch (err) {
      console.warn('[CartController] Error restoring existing cart, will create new on demand:', err);
      try { localStorage.removeItem(STORAGE_KEY_CART_ID); } catch(e){}
      this.cartId = null;
    }

    this._notifyUpdate();
    return null;
  }

  /**
   * Ensure a valid Shopify cart exists
   * @private
   */
  async _ensureCart() {
    if (this.cart && this.cartId) {
      return this.cartId;
    }
    const newCart = await shopifyClient.createCart([]);
    this.cart = newCart;
    this.cartId = newCart.id;
    try { localStorage.setItem(STORAGE_KEY_CART_ID, this.cartId); } catch(e){}
    return this.cartId;
  }

  /**
   * Get total number of items in cart
   * @returns {number}
   */
  getTotalQuantity() {
    return this.cart ? (this.cart.totalQuantity || 0) : 0;
  }

  /**
   * Get formatted subtotal
   * @returns {string}
   */
  getSubtotalFormatted() {
    if (!this.cart?.cost?.subtotalAmount) return '$0.00';
    return formatMoney(this.cart.cost.subtotalAmount.amount, this.cart.cost.subtotalAmount.currencyCode);
  }

  /**
   * Add item to Shopify Cart
   * @param {string} variantId - GraphQL ID of the product variant
   * @param {number} quantity - Quantity to add (default 1)
   * @param {Object} metadata - Optional title/price for toast feedback
   * @returns {Promise<Object>} Updated Cart
   */
  async addItem(variantId, quantity = 1, metadata = {}) {
    if (!variantId) {
      throw new Error('Valid Product Variant ID is required to add to cart.');
    }

    this.isLoading = true;
    this._dispatch('xentia:cart:loading', { isLoading: true });

    try {
      const cartId = await this._ensureCart();
      const updatedCart = await shopifyClient.addLinesToCart(cartId, [
        {
          merchandiseId: variantId,
          quantity: parseInt(quantity, 10) || 1
        }
      ]);

      this.cart = updatedCart;
      this._notifyUpdate();

      // Show instant visual confirmation
      const itemTitle = metadata.title || 'Surgical Instrument';
      this.showToast(`Added to Cart: ${itemTitle}`, 'success');

      // Dispatch item added event
      this._dispatch('xentia:cart:item-added', {
        variantId,
        quantity,
        cart: this.cart,
        metadata
      });

      // Automatically open the cart drawer for clear user confirmation
      this.openDrawer();

      return this.cart;
    } catch (error) {
      console.error('[CartController] Add item failed:', error);
      this.showToast(error.message || 'Failed to add item to cart', 'error');
      this._dispatch('xentia:cart:error', { error });
      throw error;
    } finally {
      this.isLoading = false;
      this._dispatch('xentia:cart:loading', { isLoading: false });
    }
  }

  /**
   * Update quantity of a line item
   * @param {string} lineId 
   * @param {number} quantity 
   * @returns {Promise<Object>}
   */
  async updateItemQuantity(lineId, quantity) {
    if (!this.cartId || !lineId) return;

    this.isLoading = true;
    this._dispatch('xentia:cart:loading', { isLoading: true });

    try {
      const q = parseInt(quantity, 10);
      let updatedCart;
      if (q <= 0) {
        updatedCart = await shopifyClient.removeCartLines(this.cartId, [lineId]);
      } else {
        updatedCart = await shopifyClient.updateCartLines(this.cartId, [
          { id: lineId, quantity: q }
        ]);
      }

      this.cart = updatedCart;
      this._notifyUpdate();
      return this.cart;
    } catch (error) {
      console.error('[CartController] Update quantity failed:', error);
      this.showToast(error.message || 'Failed to update item quantity', 'error');
      throw error;
    } finally {
      this.isLoading = false;
      this._dispatch('xentia:cart:loading', { isLoading: false });
    }
  }

  /**
   * Remove a line item from cart
   * @param {string} lineId 
   * @returns {Promise<Object>}
   */
  async removeItem(lineId) {
    return this.updateItemQuantity(lineId, 0);
  }

  /**
   * Accelerated Buy Now Flow
   * Creates a dedicated 1-click checkout session and redirects to Shopify Checkout
   * @param {string} variantId 
   * @param {boolean} isAvailable 
   * @param {Object} productInfo 
   */
  async buyNow(variantId, isAvailable = true, productInfo = {}) {
    if (!isAvailable) {
      this.showToast('This instrument is manufactured to order. Please request a custom production quote.', 'warning');
      window.location.href = `/wholesale-custom-orders.html?product=${encodeURIComponent(productInfo.handle || '')}&title=${encodeURIComponent(productInfo.title || '')}`;
      return;
    }

    if (!variantId) {
      this.showToast('Please select a valid variant first.', 'error');
      return;
    }

    this.showToast('Initiating secure Shopify Checkout...', 'info');

    try {
      // Create a fresh cart dedicated to this instant Buy Now transaction
      const instantCart = await shopifyClient.createCart([
        { merchandiseId: variantId, quantity: 1 }
      ]);

      if (instantCart && instantCart.checkoutUrl) {
        window.location.href = instantCart.checkoutUrl;
      } else {
        throw new Error('Checkout URL not returned by Shopify Storefront API.');
      }
    } catch (err) {
      console.error('[CartController] Buy Now error:', err);
      this.showToast(err.message || 'Failed to initialize checkout. Please try again.', 'error');
    }
  }

  /**
   * Proceed to Shopify Hosted Checkout for current cart
   */
  proceedToCheckout() {
    if (!this.cart || !this.cart.checkoutUrl) {
      this.showToast('Your cart is empty. Add instruments before checking out.', 'warning');
      return;
    }

    if (this.getTotalQuantity() === 0) {
      this.showToast('Your cart is currently empty.', 'warning');
      return;
    }

    window.location.href = this.cart.checkoutUrl;
  }

  /**
   * Open the Cart Drawer / Modal
   */
  openDrawer() {
    // 1. Check if official web component <shopify-cart> exists
    const webCart = document.getElementById('main-cart');
    if (webCart && typeof webCart.showModal === 'function') {
      try {
        webCart.showModal();
      } catch (e) {
        // If already open or native dialog error, ignore
      }
    }

    // 2. Also open custom backup drawer if present
    const customDrawer = document.getElementById('xentia-cart-drawer');
    if (customDrawer) {
      customDrawer.classList.add('is-open');
      document.body.classList.add('cart-drawer-open');
    }

    this._dispatch('xentia:cart:opened', { cart: this.cart });
  }

  /**
   * Close the Cart Drawer / Modal
   */
  closeDrawer() {
    const webCart = document.getElementById('main-cart');
    if (webCart && typeof webCart.close === 'function') {
      try {
        webCart.close();
      } catch (e) {}
    }

    const customDrawer = document.getElementById('xentia-cart-drawer');
    if (customDrawer) {
      customDrawer.classList.remove('is-open');
      document.body.classList.remove('cart-drawer-open');
    }

    this._dispatch('xentia:cart:closed', {});
  }

  /**
   * Internal notify update
   * @private
   */
  _notifyUpdate() {
    const qty = this.getTotalQuantity();
    const subtotal = this.getSubtotalFormatted();

    // Update any badge elements in DOM
    const badges = document.querySelectorAll('.cart-count-badge, #header-cart-count');
    badges.forEach(b => {
      b.textContent = qty > 0 ? String(qty) : '0';
      b.setAttribute('data-count', String(qty));
      if (qty > 0) {
        b.classList.remove('hidden');
        b.style.display = 'inline-flex';
      } else {
        b.style.display = 'none';
      }
    });

    this._dispatch('xentia:cart:updated', {
      cart: this.cart,
      totalQuantity: qty,
      subtotal
    });
  }

  /**
   * Dispatch custom DOM events on window
   * @private
   */
  _dispatch(eventName, detail = {}) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  /**
   * Lightweight accessible toast notification system
   */
  showToast(message, type = 'info') {
    let container = document.getElementById('xentia-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'xentia-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast-indicator"></span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }
}

export const cartController = new CartController();
