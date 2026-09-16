/**
 * XENTIA INDUSTRIES - MAIN ENTRYPOINT & STOREFRONT ORCHESTRATOR
 * Version: 2.0.0 (Milestone 2 Production Foundation)
 * Authority: /docs/ARCHITECTURE-DECISION.md & Milestone 2 Specification
 * 
 * Orchestrates Storefront API data layer, collection filtering, real-time search,
 * product card rendering, variant selector modal, and native Shopify cart transitions.
 */

import { CONFIG } from './config.js';
import { shopifyClient } from './api.js';
import { cartController } from './cart.js';
import { renderProductCard, renderSkeletonProductCard, renderPlaceholderProductCard } from './product-card.js';
import { productModal } from './product-modal.js';
import { CollectionFilterController } from './collection-filter.js';
import { getQuoteUrl, navigateToQuote } from './quote-hook.js';
import { loaderController } from './loader.js';
import { headerController } from './header.js';
import { heroController } from './hero.js';
import { OEMTabsController } from './oem-tabs.js';
import { SurgicalSetsController } from './surgical-sets.js';
import { ContactFormController } from './contact-form.js';
import { mobileAppBarController } from './mobile-app-bar.js';

// Boot preloader immediately if not in Shopify designMode
if (!window.Shopify || !window.Shopify.designMode) {
  loaderController.init();
}

// ============================================================================
// GLOBAL APPLICATION STATE
// ============================================================================
const AppState = {
  allProducts: [],
  filteredProducts: [],
  activeCollection: 'all',
  searchQuery: '',
  currentSort: 'best-selling',
  availability: 'all',
  isLoading: false,
};

// ============================================================================
// BOOTSTRAP ORCHESTRATOR
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Xentia Storefront] Bootstrapping Storefront v2.1.0');

  try {
    // 0. Initialize Architectural Header & 4-Wing Mega-Menu
    headerController.init();

    // 1. Initialize Hero Section & Video Controller
    heroController.init();

    // 1.5. Initialize Custom OEM/ODM Showcase Tabs
    const oemTabs = new OEMTabsController({ containerId: 'oem-showcase' });
    oemTabs.init();
    window.oemTabsController = oemTabs;

    // 1.6. Initialize Surgical Sets Showcase & Modular Tray Configurator
    const surgicalSets = new SurgicalSetsController({ sectionId: 'surgical-sets' });
    surgicalSets.init();
    window.surgicalSetsController = surgicalSets;

    // 2. Initialize Shopify Cart
    await cartController.init();

    // 2. Setup Header Cart Button & Badges
    setupCartTriggers();

    // 3. Initialize Collection & Filter Navigation
    const filterController = new CollectionFilterController({
      containerId: 'catalog-filter-container',
      onFilterChange: handleFilterChange
    });
    await filterController.init();
    window.filterController = filterController;

    // Global helper for Specialty Category Explorer and Mega-Menu clicks
    window.filterBySpecialty = (handle) => {
      if (window.filterController) {
        window.filterController.setCollection(handle);
      }
      const catalogSection = document.getElementById('categories');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // 4. Fetch and Render Live Products
    await loadCatalog();

    // 5. Update Live Status Pill
    updateStatusPill();

    // 6. Initialize Contact Form Controller
    const contactForm = new ContactFormController({ formId: 'contact-inquiry-form' });
    contactForm.init();
    window.contactFormController = contactForm;

    // 7. Initialize Native Mobile App Bar
    mobileAppBarController.init();

  } catch (bootErr) {
    console.error('[Xentia Storefront] Bootstrap error (page will still display):', bootErr);
    // Ensure the loader is dismissed even if bootstrap fails
    if (typeof loaderController !== 'undefined' && !loaderController.isDismissed) {
      loaderController.dismiss();
    }
  }
});


/**
 * Wire cart triggers and event listeners
 */
function setupCartTriggers() {
  const cartBtn = document.getElementById('open-cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cartController.openDrawer();
    });
  }

  // Listen to Cart Updates to sync UI
  window.addEventListener('xentia:cart:updated', (e) => {
    const { totalQuantity, subtotal } = e.detail;
    const badge = document.getElementById('header-cart-count');
    if (badge) {
      badge.textContent = totalQuantity > 0 ? String(totalQuantity) : '0';
      badge.style.display = totalQuantity > 0 ? 'inline-flex' : 'none';
    }
  });
}

/**
 * Fetch products from live Shopify Storefront API
 */
async function loadCatalog() {
  const grid = document.getElementById('live-products-grid');
  if (!grid) return;

  AppState.isLoading = true;
  grid.innerHTML = Array(8).fill(renderSkeletonProductCard()).join('');

  try {
    // Fetch all live products (Storefront API supports up to 50 per page, plus pagination)
    const { products } = await shopifyClient.fetchProducts({ first: 50, sortKey: 'BEST_SELLING' });
    AppState.allProducts = products;
    applyFiltersAndRender();
  } catch (error) {
    console.error('[Xentia Storefront] Failed to load catalog:', error);
    grid.innerHTML = `
      <div class="card card-metallic text-center" style="grid-column: 1 / -1; padding: var(--space-8);">
        <p style="color: var(--color-error); font-weight: var(--weight-bold); font-size: var(--text-lg); margin-bottom: var(--space-2);">
          Live Catalog Sync Interrupted
        </p>
        <p style="font-size: var(--text-sm); color: var(--color-steel-muted); max-width: 500px; margin: 0 auto var(--space-4) auto;">
          Unable to connect to Shopify Storefront API. Please verify network access or retry.
        </p>
        <button class="btn btn-secondary btn-sm" onclick="window.reloadCatalog()">
          RETRY SYNC
        </button>
      </div>
    `;
  } finally {
    AppState.isLoading = false;
  }
}

/**
 * Handle filter change from CollectionFilterController
 */
function handleFilterChange({ collectionHandle, searchQuery, sort, availability }) {
  AppState.activeCollection = collectionHandle;
  AppState.searchQuery = searchQuery;
  AppState.currentSort = sort;
  if (availability !== undefined) {
    AppState.availability = availability;
  }
  applyFiltersAndRender();
}

/**
 * Filter, sort, and render products
 */
function applyFiltersAndRender() {
  const grid = document.getElementById('live-products-grid');
  const countIndicator = document.getElementById('catalog-products-count');
  if (!grid) return;

  let list = [...AppState.allProducts];

  // 1. Filter by collection
  if (AppState.activeCollection !== 'all') {
    list = list.filter(p => {
      // Check if product belongs to collection handle
      return p.collections.some(c => c.handle === AppState.activeCollection);
    });
  }

  // 1.5. Filter by stock availability
  if (AppState.availability === 'in-stock') {
    list = list.filter(p => Boolean(p.availableForSale));
  } else if (AppState.availability === 'custom') {
    list = list.filter(p => !p.availableForSale);
  }

  // 2. Filter by search query
  if (AppState.searchQuery) {
    const q = AppState.searchQuery.toLowerCase();
    list = list.filter(p => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }

  // 3. Sort
  switch (AppState.currentSort) {
    case 'price-asc':
      list.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price.amount - a.price.amount);
      break;
    case 'title-asc':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      list.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'best-selling':
    default:
      // Preserve default Storefront order
      break;
  }

  AppState.filteredProducts = list;

  // Update counter in UI
  if (countIndicator) {
    countIndicator.textContent = `Showing ${list.length} ${list.length === 1 ? 'Instrument' : 'Instruments'}`;
  }

  // 4. Render
  // MODE 1: MASTER CATEGORY SHOWCASE (When All Instruments selected and no search query)
  if (AppState.activeCollection === 'all' && !AppState.searchQuery) {
    const categories = CONFIG.categories || [];
    let showcaseHTML = '<div class="categories-showcase-flow" style="grid-column: 1 / -1; width: 100%;">';

    categories.forEach(cat => {
      // Find matching products
      let matching = AppState.allProducts.filter(p => {
        const handleMatch = p.collections && p.collections.some(c => c.handle === cat.handle || c.handle.includes(cat.handle.split('-')[0]));
        const typeMatch = p.productType && p.productType.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0]);
        return handleMatch || typeMatch;
      });

      if (AppState.availability === 'in-stock') {
        matching = matching.filter(p => Boolean(p.availableForSale));
      } else if (AppState.availability === 'custom') {
        matching = matching.filter(p => !p.availableForSale);
      }

      const liveCount = matching.length;
      const renderedLive = matching.slice(0, 5);
      const neededPlaceholders = 5 - renderedLive.length;

      showcaseHTML += `
        <section class="category-section-block" style="margin-bottom: var(--space-10);">
          <div class="category-header-bar">
            <div class="category-header-info">
              <div class="category-meta-badge">
                <span class="category-badge-dot"></span>
                <span class="category-badge-text">CLINICAL DISCIPLINE</span>
                ${liveCount > 0 ? `<span class="category-badge-count">${liveCount} In-Stock Products</span>` : '<span class="category-badge-count pending">OEM Production on Demand</span>'}
              </div>
              <h2 class="category-title">${cat.name}</h2>
              <p class="category-subtext">Certified surgical instrumentation forged from German DIN 1.4021 stainless steel.</p>
            </div>
            <div class="category-header-actions">
              <button type="button" class="btn btn-secondary btn-view-more" onclick="window.filterBySpecialty('${cat.handle}')" aria-label="View all ${cat.name} instruments">
                <span>VIEW MORE</span>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="category-products-row-container">
            <div class="category-products-row">
              ${renderedLive.map(p => renderProductCard(p)).join('')}
              ${Array.from({ length: neededPlaceholders }).map((_, i) => renderPlaceholderProductCard(cat.name, cat.handle, i + 1)).join('')}
            </div>
          </div>
        </section>
      `;
    });

    showcaseHTML += '</div>';
    grid.innerHTML = showcaseHTML;
    return;
  }

  // MODE 2: SPECIFIC CATEGORY OR SEARCH RESULTS GRID
  if (list.length === 0) {
    const activeCat = (CONFIG.categories || []).find(c => c.handle === AppState.activeCollection);
    const catName = activeCat ? activeCat.name : 'Selected Discipline';

    grid.innerHTML = `
      <div class="empty-category-showcase" style="grid-column: 1 / -1; width: 100%;">
        <div class="catalog-empty text-center" style="padding: var(--space-8) var(--space-4); margin-bottom: var(--space-8); background: rgba(255,255,255,0.02); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: var(--radius-md);">
          <span class="badge-pill" style="margin-bottom: var(--space-2);">CUSTOM PRODUCTION READY</span>
          <p style="color: var(--color-steel-white); font-size: var(--text-lg); font-weight: 600; margin-bottom: var(--space-2);">
            Active catalog listings for ${catName} are currently being published from the Sialkot factory floor.
          </p>
          <p style="color: var(--color-steel-medium); font-size: var(--text-sm); max-width: 620px; margin: 0 auto var(--space-4) auto;">
            We forge complete custom sets and precision OEM instruments to your exact dimensional blueprints and DIN 1.4021 metallurgical specifications.
          </p>
          <div style="display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap;">
            <a href="wholesale-custom-orders.html?specialty=${AppState.activeCollection}" class="btn btn-primary btn-sm">
              REQUEST CUSTOM OEM PRODUCTION RUN
            </a>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.filterBySpecialty('all')">
              &larr; BACK TO ALL CATEGORIES
            </button>
          </div>
        </div>

        <div class="category-products-row-container">
          <div class="category-products-row">
            ${Array.from({ length: 5 }).map((_, i) => renderPlaceholderProductCard(catName, AppState.activeCollection, i + 1)).join('')}
          </div>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: center;">
      <button type="button" class="btn btn-secondary btn-sm" onclick="window.filterBySpecialty('all')">
        &larr; BACK TO ALL CATEGORIES
      </button>
      <span style="font-size: var(--text-xs); color: var(--color-steel-muted);">${list.length} Instruments Found</span>
    </div>
    ${list.map(p => renderProductCard(p)).join('')}
  `;
}

/**
 * Update the Live Status Pill in Hero
 */
function updateStatusPill() {
  const statusText = document.getElementById('shopify-status-text');
  if (statusText) {
    statusText.textContent = `Shopify Live: ${CONFIG.shopify.storeDomain}`;
  }
}

// ============================================================================
// GLOBAL ACTIONS & EVENT HANDLERS (Invoked by inline HTML)
// ============================================================================

window.handleAddToCart = async function(variantId, encodedTitle) {
  const title = decodeURIComponent(encodedTitle || '');
  try {
    await cartController.addItem(variantId, 1, { title });
  } catch (err) {
    // Handled in cartController
  }
};

window.handleBuyNow = async function(variantId, isAvailable, handle, encodedTitle) {
  const title = decodeURIComponent(encodedTitle || '');
  await cartController.buyNow(variantId, isAvailable, { handle, title });
};

window.openProductModal = function(handle) {
  productModal.open(handle);
};

window.closeProductModal = function() {
  productModal.close();
};

window.cartController = cartController;

window.reloadCatalog = function() {
  loadCatalog();
};

window.resetCatalogFilters = function() {
  AppState.searchQuery = '';
  AppState.activeCollection = 'all';
  AppState.currentSort = 'best-selling';
  
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) sortSelect.value = 'best-selling';

  // Trigger tab visual reset
  const tabs = document.querySelectorAll('.tab-pill');
  tabs.forEach(t => {
    const isAll = t.getAttribute('data-handle') === 'all';
    t.classList.toggle('tab-pill-active', isAll);
    t.setAttribute('aria-selected', isAll ? 'true' : 'false');
  });

  // Trigger availability pills visual reset
  AppState.availability = 'all';
  const availPills = document.querySelectorAll('.avail-filter-pill');
  availPills.forEach(p => {
    const isAll = p.getAttribute('data-avail') === 'all';
    p.classList.toggle('is-active', isAll);
    p.setAttribute('aria-checked', isAll ? 'true' : 'false');
  });

  applyFiltersAndRender();
};

export { AppState, loadCatalog, applyFiltersAndRender };
