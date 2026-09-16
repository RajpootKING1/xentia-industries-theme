/**
 * XENTIA INDUSTRIES - STOREFRONT GRAPHQL API CLIENT & COMMERCE DATA LAYER
 * Version: 2.0.0 (Milestone 2 Production Foundation)
 * Authority: /docs/SHOPIFY-SECURITY.md & /docs/ARCHITECTURE-DECISION.md
 * 
 * Public Storefront API Client (ZERO Private Credentials)
 * Provides request caching, deduplication, product normalization,
 * collection normalization, and native Shopify Cart operations.
 */

import { CONFIG } from './config.js';

// ============================================================================
// DATA NORMALIZERS
// ============================================================================

/**
 * Format raw currency amounts into localized currency string
 * @param {string|number} amount 
 * @param {string} currencyCode 
 * @returns {string} e.g. "$45.00"
 */
export function formatMoney(amount, currencyCode = 'USD') {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Normalize raw Storefront Variant node into standard variant object
 * @param {Object} rawVariant 
 * @param {string} parentTitle 
 * @returns {Object} Normalized Variant
 */
export function normalizeVariant(rawVariant, parentTitle = '') {
  if (!rawVariant) return null;
  const priceAmount = rawVariant.price ? parseFloat(rawVariant.price.amount) : 0;
  const currencyCode = rawVariant.price?.currencyCode || 'USD';
  const compareAmount = rawVariant.compareAtPrice ? parseFloat(rawVariant.compareAtPrice.amount) : null;

  return {
    id: rawVariant.id,
    title: rawVariant.title || 'Default Title',
    displayName: rawVariant.title && rawVariant.title !== 'Default Title' ? `${parentTitle} - ${rawVariant.title}` : parentTitle,
    availableForSale: Boolean(rawVariant.availableForSale),
    selectedOptions: rawVariant.selectedOptions || [],
    price: {
      amount: priceAmount,
      currencyCode: currencyCode,
      formatted: formatMoney(priceAmount, currencyCode)
    },
    compareAtPrice: compareAmount ? {
      amount: compareAmount,
      currencyCode: rawVariant.compareAtPrice.currencyCode || currencyCode,
      formatted: formatMoney(compareAmount, rawVariant.compareAtPrice.currencyCode || currencyCode)
    } : null,
    image: rawVariant.image ? {
      url: rawVariant.image.url,
      altText: rawVariant.image.altText || parentTitle
    } : null
  };
}

/**
 * Normalize raw Storefront Product node into standard internal model
 * @param {Object} rawNode 
 * @returns {Object} Normalized Product
 */
export function normalizeProduct(rawNode) {
  if (!rawNode) return null;

  // Extract primary image
  const images = (rawNode.images?.edges || []).map(edge => ({
    url: edge.node.url,
    altText: edge.node.altText || rawNode.title
  }));
  const fallbackImage = 'Assets/product-images/hero_surgical_showcase.webp';
  const featuredImage = images[0] || {
    url: fallbackImage,
    altText: rawNode.title
  };

  // Extract and normalize variants
  const rawVariants = rawNode.variants?.edges?.map(e => e.node) || [];
  const variants = rawVariants.map(v => normalizeVariant(v, rawNode.title));
  const selectedVariant = variants[0] || null;

  // Pricing summary
  const minPrice = rawNode.priceRange?.minVariantPrice ? parseFloat(rawNode.priceRange.minVariantPrice.amount) : (selectedVariant?.price?.amount || 0);
  const maxPrice = rawNode.priceRange?.maxVariantPrice ? parseFloat(rawNode.priceRange.maxVariantPrice.amount) : minPrice;
  const currencyCode = rawNode.priceRange?.minVariantPrice?.currencyCode || selectedVariant?.price?.currencyCode || 'USD';

  // Plain-text description fallback from HTML or description
  let plainDescription = rawNode.description || '';
  if (!plainDescription && rawNode.descriptionHtml) {
    plainDescription = rawNode.descriptionHtml.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  }

  // Extract collections if attached
  const collections = (rawNode.collections?.edges || []).map(e => ({
    id: e.node.id,
    handle: e.node.handle,
    title: e.node.title
  }));

  // Determine overall product availability
  // Product is available only if at least one variant is availableForSale
  const availableForSale = variants.length > 0
    ? variants.some(v => v.availableForSale)
    : Boolean(rawNode.availableForSale);

  return {
    id: rawNode.id,
    handle: rawNode.handle,
    title: rawNode.title,
    description: plainDescription,
    descriptionHtml: rawNode.descriptionHtml || `<p>${plainDescription}</p>`,
    vendor: rawNode.vendor || 'Xentia Industries',
    productType: rawNode.productType || 'Surgical Instrument',
    tags: rawNode.tags || [],
    featuredImage,
    images,
    variants,
    selectedVariant,
    hasMultipleVariants: variants.length > 1,
    availableForSale,
    price: {
      amount: minPrice,
      maxAmount: maxPrice,
      currencyCode: currencyCode,
      formatted: formatMoney(minPrice, currencyCode),
      rangeFormatted: minPrice !== maxPrice ? `${formatMoney(minPrice, currencyCode)} - ${formatMoney(maxPrice, currencyCode)}` : formatMoney(minPrice, currencyCode)
    },
    compareAtPrice: selectedVariant?.compareAtPrice || null,
    collections,
    url: `/products/${rawNode.handle}`,
    shopifyUrl: `https://${CONFIG.shopify.storeDomain}/products/${rawNode.handle}`
  };
}

/**
 * Normalize raw Storefront Collection node
 * @param {Object} rawNode 
 * @returns {Object} Normalized Collection
 */
export function normalizeCollection(rawNode) {
  if (!rawNode) return null;

  const products = (rawNode.products?.edges || []).map(e => normalizeProduct(e.node));

  return {
    id: rawNode.id,
    handle: rawNode.handle,
    title: rawNode.title,
    description: rawNode.description || '',
    descriptionHtml: rawNode.descriptionHtml || '',
    image: rawNode.image ? {
      url: rawNode.image.url,
      altText: rawNode.image.altText || rawNode.title
    } : null,
    products,
    productsCount: products.length
  };
}

// ============================================================================
// SHOPIFY CLIENT CLASS
// ============================================================================

export class ShopifyClient {
  constructor() {
    this.endpoint = CONFIG.shopify.graphqlEndpoint;
    this.token = CONFIG.shopify.publicAccessToken;
    
    // In-memory cache: key -> { data, timestamp }
    this.cache = new Map();
    this.cacheTtlMs = 5 * 60 * 1000; // 5 minutes cache
    
    // In-flight request deduplication: queryHash -> Promise
    this.inFlightRequests = new Map();
  }

  /**
   * Execute raw GraphQL query with caching and deduplication
   * @param {string} graphqlQuery 
   * @param {Object} variables 
   * @param {boolean} useCache 
   * @returns {Promise<Object>} Response data
   */
  async query(graphqlQuery, variables = {}, useCache = true) {
    const cacheKey = JSON.stringify({ q: graphqlQuery.trim(), v: variables });

    // Check memory cache
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTtlMs) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    // Check in-flight promise to deduplicate simultaneous requests
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': this.token,
          },
          body: JSON.stringify({
            query: graphqlQuery,
            variables,
          }),
        });

        if (!response.ok) {
          throw new Error(`Shopify API error: HTTP ${response.status} ${response.statusText}`);
        }

        const json = await response.json();

        if (json.errors && json.errors.length > 0) {
          const errMsg = json.errors.map(e => e.message).join(' | ');
          throw new Error(`Shopify GraphQL error: ${errMsg}`);
        }

        if (useCache && json.data) {
          this.cache.set(cacheKey, {
            data: json.data,
            timestamp: Date.now()
          });
        }

        return json.data;
      } catch (error) {
        console.error('[ShopifyClient] Query error:', error);
        throw error;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Verify store connectivity & fetch shop metadata
   */
  async getShopInfo() {
    const q = `
      query GetShop {
        shop {
          name
          description
          primaryDomain {
            url
            host
          }
          paymentSettings {
            currencyCode
            enabledPresentmentCurrencies
          }
        }
      }
    `;
    return this.query(q);
  }

  /**
   * Fetch all or paginated products with normalized models
   * @param {Object} options 
   * @returns {Promise<{ products: Object[], pageInfo: Object }>}
   */
  async fetchProducts({ first = 50, after = null, query = null, sortKey = 'BEST_SELLING', reverse = false, cache = true } = {}) {
    const q = `
      query FetchProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
        products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
              id
              handle
              title
              description
              descriptionHtml
              availableForSale
              productType
              vendor
              tags
              priceRange {
                minVariantPrice { amount currencyCode }
                maxVariantPrice { amount currencyCode }
              }
              images(first: 5) {
                edges {
                  node { url altText }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price { amount currencyCode }
                    compareAtPrice { amount currencyCode }
                    selectedOptions { name value }
                    image { url altText }
                  }
                }
              }
              collections(first: 5) {
                edges {
                  node {
                    id
                    handle
                    title
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.query(q, { first, after, query, sortKey, reverse }, cache);
    const rawEdges = data?.products?.edges || [];
    const products = rawEdges.map(e => normalizeProduct(e.node)).filter(Boolean);

    return {
      products,
      pageInfo: data?.products?.pageInfo || { hasNextPage: false }
    };
  }

  /**
   * Fetch a single product by its handle
   * @param {string} handle 
   * @param {boolean} cache 
   * @returns {Promise<Object|null>} Normalized Product
   */
  async fetchProductByHandle(handle, cache = true) {
    if (!handle) return null;

    const q = `
      query FetchProductByHandle($handle: String!) {
        product(handle: $handle) {
          id
          handle
          title
          description
          descriptionHtml
          availableForSale
          productType
          vendor
          tags
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          images(first: 10) {
            edges {
              node { url altText }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                selectedOptions { name value }
                image { url altText }
              }
            }
          }
          collections(first: 5) {
            edges {
              node {
                id
                handle
                title
              }
            }
          }
        }
      }
    `;

    const data = await this.query(q, { handle }, cache);
    return data?.product ? normalizeProduct(data.product) : null;
  }

  /**
   * Fetch all collections with metadata
   * @param {Object} options 
   * @returns {Promise<Object[]>} Array of normalized collections
   */
  async fetchCollections({ first = 25, cache = true } = {}) {
    const q = `
      query FetchCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              handle
              title
              description
              descriptionHtml
              image { url altText }
            }
          }
        }
      }
    `;

    const data = await this.query(q, { first }, cache);
    const rawEdges = data?.collections?.edges || [];
    return rawEdges.map(e => normalizeCollection(e.node)).filter(Boolean);
  }

  /**
   * Fetch single collection by handle, including its products
   * @param {string} handle 
   * @param {Object} options 
   * @returns {Promise<Object|null>} Normalized Collection with products
   */
  async fetchCollectionByHandle(handle, { first = 50, cache = true } = {}) {
    if (!handle) return null;

    const q = `
      query FetchCollectionByHandle($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          id
          handle
          title
          description
          descriptionHtml
          image { url altText }
          products(first: $first) {
            edges {
              node {
                id
                handle
                title
                description
                descriptionHtml
                availableForSale
                productType
                vendor
                tags
                priceRange {
                  minVariantPrice { amount currencyCode }
                  maxVariantPrice { amount currencyCode }
                }
                images(first: 4) {
                  edges {
                    node { url altText }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      price { amount currencyCode }
                      compareAtPrice { amount currencyCode }
                      selectedOptions { name value }
                      image { url altText }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.query(q, { handle, first }, cache);
    return data?.collection ? normalizeCollection(data.collection) : null;
  }

  /**
   * Fetch featured products for homepage showcase
   * @param {number} first 
   * @returns {Promise<Object[]>}
   */
  async fetchFeaturedProducts(first = 8) {
    const { products } = await this.fetchProducts({ first, sortKey: 'BEST_SELLING' });
    return products;
  }

  // ==========================================================================
  // NATIVE SHOPIFY CART API MUTATIONS (Browser Safe Storefront API)
  // ==========================================================================

  /**
   * Create a new Shopify Cart
   * @param {Array<{ merchandiseId: string, quantity: number }>} lines 
   * @returns {Promise<Object>} Cart data
   */
  async createCart(lines = []) {
    const q = `
      mutation CreateCart($lines: [CartLineInput!]) {
        cartCreate(input: { lines: $lines }) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
            lines(first: 50) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount { amount currencyCode }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      image { url altText }
                      product {
                        id
                        handle
                        title
                        productType
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const data = await this.query(q, { lines }, false); // Never cache mutations
    if (data?.cartCreate?.userErrors?.length > 0) {
      const err = data.cartCreate.userErrors[0];
      throw new Error(err.message || 'Failed to create cart');
    }
    return data.cartCreate.cart;
  }

  /**
   * Retrieve existing Shopify Cart by ID
   * @param {string} cartId 
   * @returns {Promise<Object|null>}
   */
  async getCart(cartId) {
    if (!cartId) return null;

    const q = `
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                cost {
                  totalAmount { amount currencyCode }
                }
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price { amount currencyCode }
                    image { url altText }
                    product {
                      id
                      handle
                      title
                      productType
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.query(q, { cartId }, false);
    return data?.cart || null;
  }

  /**
   * Add lines to an existing Shopify Cart
   * @param {string} cartId 
   * @param {Array<{ merchandiseId: string, quantity: number }>} lines 
   * @returns {Promise<Object>} Updated cart
   */
  async addLinesToCart(cartId, lines) {
    const q = `
      mutation AddLinesToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
            lines(first: 50) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount { amount currencyCode }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      image { url altText }
                      product {
                        id
                        handle
                        title
                        productType
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const data = await this.query(q, { cartId, lines }, false);
    if (data?.cartLinesAdd?.userErrors?.length > 0) {
      const err = data.cartLinesAdd.userErrors[0];
      throw new Error(err.message || 'Failed to add item to cart');
    }
    return data.cartLinesAdd.cart;
  }

  /**
   * Update quantity of a line item in Shopify Cart
   * @param {string} cartId 
   * @param {Array<{ id: string, quantity: number }>} lines 
   * @returns {Promise<Object>} Updated cart
   */
  async updateCartLines(cartId, lines) {
    const q = `
      mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
            lines(first: 50) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount { amount currencyCode }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      image { url altText }
                      product {
                        id
                        handle
                        title
                        productType
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const data = await this.query(q, { cartId, lines }, false);
    if (data?.cartLinesUpdate?.userErrors?.length > 0) {
      const err = data.cartLinesUpdate.userErrors[0];
      throw new Error(err.message || 'Failed to update cart line');
    }
    return data.cartLinesUpdate.cart;
  }

  /**
   * Remove lines from Shopify Cart
   * @param {string} cartId 
   * @param {string[]} lineIds 
   * @returns {Promise<Object>} Updated cart
   */
  async removeCartLines(cartId, lineIds) {
    const q = `
      mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
            lines(first: 50) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount { amount currencyCode }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      image { url altText }
                      product {
                        id
                        handle
                        title
                        productType
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const data = await this.query(q, { cartId, lineIds }, false);
    if (data?.cartLinesRemove?.userErrors?.length > 0) {
      const err = data.cartLinesRemove.userErrors[0];
      throw new Error(err.message || 'Failed to remove line from cart');
    }
    return data.cartLinesRemove.cart;
  }

  /**
   * Clear in-memory cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const shopifyClient = new ShopifyClient();
