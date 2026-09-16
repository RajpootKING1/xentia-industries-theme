/**
 * XENTIA INDUSTRIES - REUSABLE PRODUCT CARD COMPONENT
 * Version: 2.0.0 (Milestone 2 Foundation)
 * Authority: Step 10 of Milestone 2 Execution Prompt
 * 
 * Renders normalized Shopify products with uncropped imagery,
 * availability indicators, accessible action CTAs, and custom quote routing.
 */

import { formatMoney } from '../api.js';
import { getQuoteUrl } from './quote-hook.js';

/**
 * Render a single reusable product card HTML string
 * @param {Object} product - Normalized product object
 * @returns {string} HTML markup
 */
export function renderProductCard(product) {
  if (!product) return '';

  const isAvailable = Boolean(product.availableForSale);
  const imageUrl = product.featuredImage?.url || 'Assets/product-images/hero_surgical_showcase.webp';
  const altText = product.featuredImage?.altText || product.title;
  const quoteUrl = getQuoteUrl(product);
  const primaryVariantId = product.selectedVariant?.id || '';

  const priceFormatted = product.price?.formatted || '$0.00';
  const priceDisplay = product.price?.rangeFormatted || priceFormatted;

  return `
    <article 
      class="card card-metallic card-interactive product-card flex flex-col justify-between" 
      data-handle="${product.handle}"
      data-product-id="${product.id}"
      data-available="${isAvailable}"
      role="region"
      aria-label="${product.title}"
    >
      <div>
        <!-- Uncropped Media Container -->
        <div class="product-media-wrapper" onclick="window.openProductModal('${product.handle}')" role="button" tabindex="0" aria-label="View specifications for ${product.title}">
          <img 
            src="${imageUrl}" 
            alt="${altText}" 
            loading="lazy" 
            class="product-image"
          />
          <!-- Availability Pill -->
          <span class="badge ${isAvailable ? 'badge-success' : 'badge-gold'} product-availability-badge">
            ${isAvailable ? 'In Stock (Sample)' : 'Custom Production'}
          </span>
          ${product.hasMultipleVariants ? '<span class="badge badge-steel product-variant-badge">Variants Available</span>' : ''}
          
          <!-- Quick Specification Trigger Button -->
          <button 
            type="button" 
            class="product-quick-view-btn" 
            onclick="event.stopPropagation(); window.openProductModal('${product.handle}')" 
            aria-label="Quick view specifications for ${product.title}"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <span>SPECS</span>
          </button>
        </div>

        <!-- Meta Eyebrow & Category -->
        <div class="product-eyebrow">
          <span>${product.productType || 'Precision Surgical Instrument'}</span>
        </div>

        <!-- Product Title -->
        <h3 class="product-title">
          <a href="javascript:void(0)" onclick="window.openProductModal('${product.handle}')" class="product-title-link">
            ${product.title}
          </a>
        </h3>

        <!-- Technical Metallurgy Micro-Badges Strip -->
        <div class="product-tech-badges flex items-center gap-1 flex-wrap" aria-label="Technical metallurgy specifications">
          <span class="product-tech-badge">ASTM F899 Steel</span>
          <span class="product-tech-badge">HRC 52–56</span>
          <span class="product-tech-badge">100% Optical QC</span>
        </div>

        <!-- Price Display -->
        <div class="product-price-wrapper">
          <span class="product-price">${priceDisplay}</span>
          ${isAvailable ? '<span class="product-price-subtext">Sample Price (USD)</span>' : '<span class="product-price-subtext">Factory Estimate</span>'}
        </div>

        ${!isAvailable ? `
          <div class="product-oem-notice">
            <span class="oem-dot"></span>
            <span>Manufactured to ASTM standards in Sialkot, Pakistan.</span>
          </div>
        ` : ''}
      </div>

      <!-- Action Buttons Area -->
      <div class="product-actions flex flex-col gap-2">
        ${isAvailable ? `
          <!-- Available Path: Add to Cart & Buy Now -->
          <button 
            type="button" 
            class="btn btn-primary btn-sm btn-block" 
            onclick="window.handleAddToCart('${primaryVariantId}', '${encodeURIComponent(product.title)}')"
            aria-label="Add ${product.title} sample to shopping cart"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            ADD SAMPLE TO CART
          </button>

          <div class="grid-2" style="gap: var(--space-2);">
            <button 
              type="button" 
              class="btn btn-secondary btn-sm" 
              onclick="window.handleBuyNow('${primaryVariantId}', true, '${product.handle}', '${encodeURIComponent(product.title)}')"
              aria-label="Buy ${product.title} now via direct checkout"
            >
              BUY NOW
            </button>
            <a 
              href="${quoteUrl}" 
              class="btn btn-ghost-gold btn-sm text-center"
              aria-label="Request custom bulk quote for ${product.title}"
            >
              BULK RFQ
            </a>
          </div>
        ` : `
          <!-- Unavailable / Custom Production Path -->
          <a 
            href="${quoteUrl}" 
            class="btn btn-primary btn-sm btn-block text-center"
            aria-label="Request custom production quote for ${product.title}"
          >
            REQUEST PRODUCTION QUOTE
          </a>

          <button 
            type="button" 
            class="btn btn-secondary btn-sm btn-block" 
            onclick="window.openProductModal('${product.handle}')"
            aria-label="View specifications for ${product.title}"
          >
            VIEW SPECIFICATIONS
          </button>
        `}
      </div>
    </article>
  `;
}

/**
 * Render a skeleton product card for loading state
 * @returns {string} HTML markup
 */
export function renderSkeletonProductCard() {
  return `
    <div class="card card-metallic skeleton-card" aria-busy="true" aria-label="Loading instrument details">
      <div class="skeleton" style="aspect-ratio: 1; border-radius: var(--radius-sm); margin-bottom: var(--space-4);"></div>
      <div class="skeleton" style="height: 14px; width: 40%; margin-bottom: var(--space-2);"></div>
      <div class="skeleton" style="height: 20px; width: 90%; margin-bottom: var(--space-2);"></div>
      <div class="skeleton" style="height: 20px; width: 70%; margin-bottom: var(--space-4);"></div>
      <div class="skeleton" style="height: 24px; width: 35%; margin-bottom: var(--space-6);"></div>
      <div class="skeleton" style="height: 38px; width: 100%; margin-bottom: var(--space-2);"></div>
      <div class="skeleton" style="height: 38px; width: 100%;"></div>
    </div>
  `;
}
