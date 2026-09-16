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
import { renderProductCard, renderSkeletonProductCard } from './product-card.js';
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

// Boot preloader immediately
loaderController.init();

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
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="card card-metallic text-center" style="grid-column: 1 / -1; padding: var(--space-12) var(--space-4);">
        <p style="font-size: var(--text-lg); color: var(--color-steel-pure); font-weight: var(--weight-bold); margin-bottom: var(--space-2);">
          No Surgical Instruments Found
        </p>
        <p style="font-size: var(--text-sm); color: var(--color-steel-muted); max-width: 480px; margin: 0 auto var(--space-6) auto;">
          No instruments matched your current filters or search query "${AppState.searchQuery}". Try selecting another discipline or resetting filters.
        </p>
        <button class="btn btn-primary btn-sm" onclick="window.resetCatalogFilters()">
          RESET ALL FILTERS
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(p => renderProductCard(p)).join('');
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
