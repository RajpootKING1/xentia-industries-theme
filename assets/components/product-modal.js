/**
 * XENTIA INDUSTRIES - PRODUCT QUICK-VIEW & VARIANT SELECTOR MODAL
 * Version: 2.0.0 (Milestone 2 Foundation)
 * Authority: Step 7 of Milestone 2 Execution Prompt
 * 
 * Provides interactive product inspection, variant selection, price synchronization,
 * dynamic availability feedback, image updates, and direct cart/quote actions.
 */

import { shopifyClient, formatMoney } from '../api.js';
import { cartController } from '../cart.js';
import { getQuoteUrl } from './quote-hook.js';

class ProductModalController {
  constructor() {
    this.modal = null;
    this.currentProduct = null;
    this.selectedVariant = null;
    this._ensureModalElement();
  }

  /**
   * Create modal DOM structure if not present
   * @private
   */
  _ensureModalElement() {
    if (document.getElementById('xentia-product-modal')) {
      this.modal = document.getElementById('xentia-product-modal');
      return;
    }

    const modalMarkup = `
      <dialog id="xentia-product-modal" class="xentia-modal" aria-labelledby="modal-product-title" aria-modal="true">
        <div class="xentia-modal-backdrop" onclick="window.closeProductModal()"></div>
        <div class="xentia-modal-content card card-metallic">
          <button class="modal-close-btn" onclick="window.closeProductModal()" aria-label="Close dialog">&times;</button>
          <div id="modal-body" class="modal-body">
            <!-- Dynamically populated -->
          </div>
        </div>
      </dialog>
    `;

    document.body.insertAdjacentHTML('beforeend', modalMarkup);
    this.modal = document.getElementById('xentia-product-modal');

    // Close on Escape
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  /**
   * Open product modal by handle
   * @param {string} handle 
   */
  async open(handle) {
    this._ensureModalElement();
    const body = document.getElementById('modal-body');
    if (!body) return;

    // Loading skeleton in modal
    body.innerHTML = `
      <div class="flex items-center justify-center" style="min-height: 380px; width: 100%;">
        <div class="text-center">
          <div class="spinner-gold" style="margin: 0 auto var(--space-4) auto;"></div>
          <p style="color: var(--color-steel-silver);">Loading instrument specifications...</p>
        </div>
      </div>
    `;

    if (typeof this.modal.showModal === 'function') {
      try {
        this.modal.showModal();
      } catch (e) {}
    } else {
      this.modal.setAttribute('open', 'true');
    }

    try {
      const product = await shopifyClient.fetchProductByHandle(handle);
      if (!product) {
        throw new Error(`Product not found: ${handle}`);
      }

      this.currentProduct = product;
      this.selectedVariant = product.variants[0] || null;
      this._renderProductDetail();
    } catch (err) {
      console.error('[ProductModal] Error loading product:', err);
      body.innerHTML = `
        <div class="text-center" style="padding: var(--space-8);">
          <p style="color: var(--color-error); font-weight: var(--weight-bold); margin-bottom: var(--space-2);">Failed to Load Product</p>
          <p style="color: var(--color-steel-muted); font-size: var(--text-sm); margin-bottom: var(--space-4);">${err.message}</p>
          <button class="btn btn-secondary btn-sm" onclick="window.closeProductModal()">Close</button>
        </div>
      `;
    }
  }

  /**
   * Close the modal dialog
   */
  close() {
    if (this.modal) {
      if (typeof this.modal.close === 'function') {
        this.modal.close();
      } else {
        this.modal.removeAttribute('open');
      }
    }
  }

  /**
   * Render complete product content inside modal
   * @private
   */
  _renderProductDetail() {
    const product = this.currentProduct;
    const body = document.getElementById('modal-body');
    if (!product || !body) return;

    const variant = this.selectedVariant;
    const isAvailable = variant ? variant.availableForSale : product.availableForSale;
    const currentPrice = variant ? variant.price.formatted : product.price.formatted;
    const currentImage = variant?.image?.url || product.featuredImage?.url;
    const quoteUrl = getQuoteUrl(product, { variantTitle: variant?.title });

    body.innerHTML = `
      <div class="grid-2 modal-product-grid" style="gap: var(--space-8);">
        <!-- Image & Gallery Column -->
        <div class="modal-media-col">
          <div class="modal-image-wrapper">
            <img 
              id="modal-main-image" 
              src="${currentImage}" 
              alt="${product.title}" 
              class="modal-main-img"
            />
            <span id="modal-availability-badge" class="badge ${isAvailable ? 'badge-success' : 'badge-gold'} modal-badge">
              ${isAvailable ? 'In Stock (Sample)' : 'Custom Production'}
            </span>
          </div>

          ${product.images.length > 1 ? `
            <div class="modal-gallery-thumbs flex gap-2" style="margin-top: var(--space-3); overflow-x: auto;">
              ${product.images.map((img, idx) => `
                <button 
                  type="button" 
                  class="modal-thumb-btn ${img.url === currentImage ? 'active' : ''}" 
                  onclick="window.productModal.selectImage('${img.url}')"
                  aria-label="View image ${idx + 1}"
                >
                  <img src="${img.url}" alt="" style="width: 48px; height: 48px; object-fit: contain;">
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Info & Controls Column -->
        <div class="modal-info-col flex flex-col justify-between">
          <div>
            <div class="product-eyebrow" style="margin-bottom: var(--space-2);">
              <span>${product.productType || 'Surgical Instrument'}</span>
              <span style="margin: 0 var(--space-2); color: var(--color-steel-dark);">•</span>
              <span style="color: var(--color-steel-medium); font-family: monospace;">SKU: ${product.handle}</span>
            </div>

            <h2 id="modal-product-title" style="font-size: var(--text-2xl); color: var(--color-steel-pure); line-height: var(--leading-tight); margin-bottom: var(--space-3);">
              ${product.title}
            </h2>

            <!-- Price & Availability Summary -->
            <div class="flex items-baseline gap-3" style="margin-bottom: var(--space-4);">
              <span id="modal-price-display" style="font-size: var(--text-2xl); font-weight: var(--weight-bold); color: var(--color-gold-bright);">
                ${currentPrice}
              </span>
              <span style="font-size: var(--text-xs); color: var(--color-steel-muted);">USD / Factory Direct</span>
            </div>

            <!-- Description / Specifications -->
            <div class="modal-description" style="color: var(--color-steel-silver); font-size: var(--text-sm); line-height: var(--leading-relaxed); margin-bottom: var(--space-6); max-height: 180px; overflow-y: auto;">
              ${product.descriptionHtml || `<p>${product.description}</p>`}
            </div>

            <!-- Variant Selector (Step 7 requirement) -->
            ${product.variants.length > 1 ? `
              <div class="modal-variant-section" style="margin-bottom: var(--space-6);">
                <label for="modal-variant-select" class="form-label" style="font-weight: var(--weight-semibold); color: var(--color-steel-pure);">
                  Select Variant / Specification:
                </label>
                <select id="modal-variant-select" class="form-select" onchange="window.productModal.onVariantChange(this.value)">
                  ${product.variants.map(v => `
                    <option value="${v.id}" ${v.id === variant.id ? 'selected' : ''}>
                      ${v.title} — ${v.price.formatted} (${v.availableForSale ? 'In Stock' : 'Custom Production'})
                    </option>
                  `).join('')}
                </select>
              </div>
            ` : `
              <div class="modal-single-variant-info" style="margin-bottom: var(--space-4); font-size: var(--text-xs); color: var(--color-steel-medium);">
                Standard Specification: <strong>AISI 420 / German Grade Stainless Steel</strong>
              </div>
            `}
            <!-- Technical Metallurgy Specifications Matrix -->
            <div class="modal-spec-grid" role="region" aria-label="Technical Metallurgy Matrix" style="margin: var(--space-4) 0;">
              <div class="modal-spec-item">
                <span class="modal-spec-label">Alloy Grade</span>
                <span class="modal-spec-val">ASTM F899 / AISI 420</span>
              </div>
              <div class="modal-spec-item">
                <span class="modal-spec-label">Hardness</span>
                <span class="modal-spec-val">HRC 52–56 Cryo</span>
              </div>
              <div class="modal-spec-item">
                <span class="modal-spec-label">Sterilization</span>
                <span class="modal-spec-val">134°C Steam Autoclave</span>
              </div>
              <div class="modal-spec-item">
                <span class="modal-spec-label">Origin</span>
                <span class="modal-spec-val">Sialkot, Pakistan</span>
              </div>
            </div>
          </div>

          <!-- Modal Action CTAs -->
          <div id="modal-action-buttons" class="flex flex-col gap-3" style="margin-top: var(--space-4);">
            ${isAvailable ? `
              <button 
                type="button" 
                class="btn btn-primary btn-block" 
                onclick="window.productModal.handleAddToCart()"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                ADD SAMPLE TO CART
              </button>
              <div class="grid-2" style="gap: var(--space-2);">
                <button 
                  type="button" 
                  class="btn btn-secondary btn-block" 
                  onclick="window.productModal.handleBuyNow()"
                >
                  BUY NOW
                </button>
                <a 
                  id="modal-quote-link"
                  href="${quoteUrl}" 
                  class="btn btn-ghost-gold btn-block text-center"
                >
                  CUSTOM RFQ
                </a>
              </div>
            ` : `
              <a 
                id="modal-quote-link"
                href="${quoteUrl}" 
                class="btn btn-primary btn-block text-center"
              >
                REQUEST CUSTOM PRODUCTION QUOTE
              </a>
              <p style="font-size: 11px; color: var(--color-steel-muted); text-align: center; margin: 0;">
                Direct factory manufacturing in Sialkot, Pakistan. Minimum order quantities & custom branding apply.
              </p>
            `}

            <!-- Instant WhatsApp Inquiry Channel -->
            <a 
              href="https://wa.me/923497400818?text=Hello%20Xentia%2C%20I%20am%20inquiring%20about%20instrument%3A%20${encodeURIComponent(product.title)}%20(SKU%3A%20${encodeURIComponent(product.handle)})"
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn btn-ghost-gold btn-sm btn-block text-center flex items-center justify-center gap-2"
              aria-label="Direct WhatsApp inquiry for ${product.title}"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.983.538 1.838.82 2.796.82 3.183 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.766-5.769-5.766zm9.969 5.766c-.002 5.519-4.49 9.998-10.009 9.998-1.761 0-3.411-.462-4.851-1.272l-5.14 1.348 1.373-5.009c-.9-1.488-1.423-3.23-1.424-5.065.002-5.519 4.49-9.998 10.009-9.998 5.52 0 10.002 4.479 10.042 10z"/></svg>
              <span>WHATSAPP INQUIRY</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Handle variant change event
   * @param {string} variantId 
   */
  onVariantChange(variantId) {
    if (!this.currentProduct) return;
    const variant = this.currentProduct.variants.find(v => v.id === variantId);
    if (!variant) return;

    this.selectedVariant = variant;

    // 1. Update Price
    const priceElem = document.getElementById('modal-price-display');
    if (priceElem) priceElem.textContent = variant.price.formatted;

    // 2. Update Availability Badge
    const badge = document.getElementById('modal-availability-badge');
    if (badge) {
      if (variant.availableForSale) {
        badge.className = 'badge badge-success modal-badge';
        badge.textContent = 'In Stock (Sample)';
      } else {
        badge.className = 'badge badge-gold modal-badge';
        badge.textContent = 'Custom Production';
      }
    }

    // 3. Update Image if variant has one
    if (variant.image?.url) {
      this.selectImage(variant.image.url);
    }

    // 4. Update Quote Link
    const quoteLink = document.getElementById('modal-quote-link');
    if (quoteLink) {
      quoteLink.href = getQuoteUrl(this.currentProduct, { variantTitle: variant.title });
    }

    // 5. Update Action Buttons area
    const actionsArea = document.getElementById('modal-action-buttons');
    if (actionsArea) {
      const isAvailable = variant.availableForSale;
      const quoteUrl = getQuoteUrl(this.currentProduct, { variantTitle: variant.title });

      if (isAvailable) {
        actionsArea.innerHTML = `
          <button 
            type="button" 
            class="btn btn-primary btn-block" 
            onclick="window.productModal.handleAddToCart()"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            ADD SAMPLE TO CART
          </button>
          <div class="grid-2" style="gap: var(--space-2);">
            <button 
              type="button" 
              class="btn btn-secondary btn-block" 
              onclick="window.productModal.handleBuyNow()"
            >
              BUY NOW
            </button>
            <a 
              id="modal-quote-link"
              href="${quoteUrl}" 
              class="btn btn-ghost-gold btn-block text-center"
            >
              CUSTOM RFQ
            </a>
          </div>
        `;
      } else {
        actionsArea.innerHTML = `
          <a 
            id="modal-quote-link"
            href="${quoteUrl}" 
            class="btn btn-primary btn-block text-center"
          >
            REQUEST CUSTOM PRODUCTION QUOTE
          </a>
          <p style="font-size: 11px; color: var(--color-steel-muted); text-align: center; margin: 0;">
            Direct factory manufacturing in Sialkot, Pakistan. Minimum order quantities & custom branding apply.
          </p>
        `;
      }
    }
  }

  /**
   * Swap main image in modal
   * @param {string} url 
   */
  selectImage(url) {
    const mainImg = document.getElementById('modal-main-image');
    if (mainImg) mainImg.src = url;

    document.querySelectorAll('.modal-thumb-btn').forEach(btn => {
      const img = btn.querySelector('img');
      if (img && img.src === url) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Trigger Add to Cart from modal
   */
  async handleAddToCart() {
    if (!this.selectedVariant) return;
    try {
      await cartController.addItem(this.selectedVariant.id, 1, {
        title: this.selectedVariant.displayName || this.currentProduct.title,
        price: this.selectedVariant.price.formatted
      });
      this.close();
    } catch (err) {
      // Toast already shown by cartController
    }
  }

  /**
   * Trigger Buy Now from modal
   */
  async handleBuyNow() {
    if (!this.selectedVariant) return;
    await cartController.buyNow(
      this.selectedVariant.id,
      this.selectedVariant.availableForSale,
      this.currentProduct
    );
  }
}

export const productModal = new ProductModalController();

// Global window helpers for inline HTML listeners
window.productModal = productModal;
window.openProductModal = (handle) => productModal.open(handle);
window.closeProductModal = () => productModal.close();
