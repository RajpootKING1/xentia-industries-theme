/**
 * XENTIA INDUSTRIES - COLLECTION NAVIGATION & CATALOG FILTER
 * Version: 2.0.0 (Milestone 2 Foundation)
 * Authority: Steps 11 & 12 of Milestone 2 Execution Prompt
 * 
 * Manages fetching the 18 live collections, rendering responsive category tabs,
 * handling client-side and Storefront API filtering, search query debouncing, and sort selection.
 */

import { shopifyClient } from '../api.js';

export class CollectionFilterController {
  constructor({ containerId, onFilterChange }) {
    this.container = document.getElementById(containerId);
    this.onFilterChange = onFilterChange || (() => {});
    this.collections = [];
    this.activeCollectionHandle = 'all';
    this.searchQuery = '';
    this.currentSort = 'best-selling';
    this.availability = 'all';
    this.debounceTimer = null;
  }

  /**
   * Initialize collections and render filter UI
   */
  async init() {
    if (!this.container) return;

    // Loading skeleton for filter bar
    this.container.innerHTML = `
      <div class="filter-bar-skeleton flex gap-2 overflow-x-auto" style="padding: var(--space-4) 0;">
        <div class="skeleton" style="width: 120px; height: 36px; border-radius: var(--radius-pill);"></div>
        <div class="skeleton" style="width: 140px; height: 36px; border-radius: var(--radius-pill);"></div>
        <div class="skeleton" style="width: 160px; height: 36px; border-radius: var(--radius-pill);"></div>
        <div class="skeleton" style="width: 130px; height: 36px; border-radius: var(--radius-pill);"></div>
      </div>
    `;

    try {
      this.collections = await shopifyClient.fetchCollections({ first: 25 });
      this.render();
    } catch (err) {
      console.error('[CollectionFilter] Failed to load collections:', err);
      this.container.innerHTML = `
        <div class="text-center" style="padding: var(--space-4); color: var(--color-steel-muted); font-size: var(--text-xs);">
          Collections sync unavailable. Showing all instruments.
        </div>
      `;
    }
  }

  /**
   * Render complete filter and search bar
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="catalog-filter-controls flex flex-col gap-4" style="margin-bottom: var(--space-8);">
        <!-- Top Row: Search Input & Sort Selector -->
        <div class="filter-top-row flex items-center justify-between gap-4 flex-wrap">
          <!-- Real-Time Search Bar -->
          <div class="search-input-wrapper flex-1" style="min-width: 260px; max-width: 480px; position: relative;">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="search-icon" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-steel-medium); pointer-events: none;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input 
              type="text" 
              id="catalog-search-input" 
              class="form-input" 
              placeholder="Search instruments by name, specialty, or AISI steel grade..." 
              value="${this.searchQuery}"
              style="padding-left: 40px; height: 42px; border-radius: var(--radius-pill);"
              aria-label="Search surgical instruments"
            />
            ${this.searchQuery ? `
              <button 
                type="button" 
                id="search-clear-btn" 
                style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--color-steel-medium); cursor: pointer; font-size: 16px;"
                aria-label="Clear search query"
              >&times;</button>
            ` : ''}
          </div>

          <!-- Sort Selector -->
          <div class="sort-wrapper flex items-center gap-2">
            <label for="catalog-sort-select" class="form-label" style="margin: 0; white-space: nowrap; font-size: var(--text-xs); color: var(--color-steel-medium);">
              SORT BY:
            </label>
            <select 
              id="catalog-sort-select" 
              class="form-select" 
              style="width: auto; height: 42px; padding: 0 var(--space-4); border-radius: var(--radius-pill); font-size: var(--text-xs);"
              aria-label="Sort instruments by"
            >
              <option value="best-selling" ${this.currentSort === 'best-selling' ? 'selected' : ''}>Featured / Popular</option>
              <option value="price-asc" ${this.currentSort === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-desc" ${this.currentSort === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
              <option value="title-asc" ${this.currentSort === 'title-asc' ? 'selected' : ''}>Title: A to Z</option>
              <option value="title-desc" ${this.currentSort === 'title-desc' ? 'selected' : ''}>Title: Z to A</option>
            </select>
          </div>
        </div>

        <!-- Middle Row: Horizontal Scrollable Category Tabs -->
        <div class="category-tabs-wrapper flex items-center gap-2 overflow-x-auto" style="padding-bottom: var(--space-2); -webkit-overflow-scrolling: touch;" role="tablist" aria-label="Instrument Categories">
          <button 
            type="button" 
            role="tab"
            aria-selected="${this.activeCollectionHandle === 'all' ? 'true' : 'false'}"
            class="tab-pill ${this.activeCollectionHandle === 'all' ? 'tab-pill-active' : ''}"
            data-handle="all"
          >
            All Instruments
          </button>
          ${this.collections.map(c => `
            <button 
              type="button" 
              role="tab"
              aria-selected="${this.activeCollectionHandle === c.handle ? 'true' : 'false'}"
              class="tab-pill ${this.activeCollectionHandle === c.handle ? 'tab-pill-active' : ''}"
              data-handle="${c.handle}"
              title="${c.title}"
            >
              ${c.title.replace(' Instruments', '')}
            </button>
          `).join('')}
        </div>

        <!-- Bottom Row: Stock Availability Filter Tabs -->
        <div class="availability-filter-row flex items-center justify-between gap-3 flex-wrap" style="padding-top: var(--space-2); border-top: 1px solid rgba(255, 255, 255, 0.05);">
          <div class="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Filter by Stock Availability">
            <span style="font-size: var(--text-xs); color: var(--color-steel-muted); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wider);">
              Catalog Mode:
            </span>
            <button 
              type="button" 
              class="avail-filter-pill ${this.availability === 'all' ? 'is-active' : ''}" 
              data-avail="all" 
              role="radio" 
              aria-checked="${this.availability === 'all' ? 'true' : 'false'}"
            >
              All Instruments
            </button>
            <button 
              type="button" 
              class="avail-filter-pill ${this.availability === 'in-stock' ? 'is-active' : ''}" 
              data-avail="in-stock" 
              role="radio" 
              aria-checked="${this.availability === 'in-stock' ? 'true' : 'false'}"
            >
              <span class="status-dot status-dot-success" style="width: 6px; height: 6px; margin-right: 4px; display: inline-block; border-radius: 50%; background: var(--color-success);"></span>
              In-Stock Samples
            </button>
            <button 
              type="button" 
              class="avail-filter-pill ${this.availability === 'custom' ? 'is-active' : ''}" 
              data-avail="custom" 
              role="radio" 
              aria-checked="${this.availability === 'custom' ? 'true' : 'false'}"
            >
              <span class="status-dot status-dot-gold" style="width: 6px; height: 6px; margin-right: 4px; display: inline-block; border-radius: 50%; background: var(--color-gold-base);"></span>
              Custom Production Runs
            </button>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  /**
   * Bind event listeners for search, sort, and tabs
   * @private
   */
  _bindEvents() {
    // Category Tabs
    const tabButtons = this.container.querySelectorAll('.tab-pill');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const handle = btn.getAttribute('data-handle');
        this.setCollection(handle);
      });
    });

    // Availability Filter Pills
    const availButtons = this.container.querySelectorAll('.avail-filter-pill');
    availButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const avail = btn.getAttribute('data-avail');
        this.setAvailability(avail);
      });
    });

    // Search Input with Debounce
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this._triggerFilter();
        }, 250);
      });
    }

    // Search Clear Button
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.searchQuery = '';
        if (searchInput) searchInput.value = '';
        this.render();
        this._triggerFilter();
      });
    }

    // Sort Dropdown
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this._triggerFilter();
      });
    }
  }

  /**
   * Change selected collection handle
   * @param {string} handle 
   */
  setCollection(handle) {
    if (this.activeCollectionHandle === handle) return;
    this.activeCollectionHandle = handle;

    // Update active tab styles
    const tabs = this.container.querySelectorAll('.tab-pill');
    tabs.forEach(tab => {
      const isTarget = tab.getAttribute('data-handle') === handle;
      tab.classList.toggle('tab-pill-active', isTarget);
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    this._triggerFilter();
  }

  /**
   * Change selected availability filter
   * @param {string} avail - 'all' | 'in-stock' | 'custom'
   */
  setAvailability(avail) {
    if (this.availability === avail) return;
    this.availability = avail;

    const pills = this.container.querySelectorAll('.avail-filter-pill');
    pills.forEach(pill => {
      const isTarget = pill.getAttribute('data-avail') === avail;
      pill.classList.toggle('is-active', isTarget);
      pill.setAttribute('aria-checked', isTarget ? 'true' : 'false');
    });

    this._triggerFilter();
  }

  /**
   * Trigger onFilterChange callback with active filters
   * @private
   */
  _triggerFilter() {
    this.onFilterChange({
      collectionHandle: this.activeCollectionHandle,
      searchQuery: this.searchQuery,
      sort: this.currentSort,
      availability: this.availability
    });
  }
}
