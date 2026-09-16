/**
 * XENTIA INDUSTRIES - CUSTOM QUOTE ROUTING HOOK
 * Version: 2.0.0 (Milestone 2 Foundation)
 * Authority: Step 9 of Milestone 2 Execution Prompt
 * 
 * Generates standardized quotation links and context payloads
 * for surgical instrument RFQs and custom OEM orders.
 */

/**
 * Generate a canonical URL for requesting a custom production quote
 * @param {Object} product - Normalized Product or Product details
 * @param {Object} options - Optional variant or quantity pre-selection
 * @returns {string} Fully formatted URL with encoded parameters
 */
export function getQuoteUrl(product, options = {}) {
  if (!product) return '/wholesale-custom-orders.html';

  const handle = product.handle || '';
  const title = product.title || '';
  const productType = product.productType || '';
  const variantTitle = options.variantTitle || product.selectedVariant?.title || '';
  const quantity = options.quantity || 50; // Default B2B MOQ sample quantity

  const params = new URLSearchParams();
  if (handle) params.set('product', handle);
  if (title) params.set('title', title);
  if (productType) params.set('type', productType);
  if (variantTitle && variantTitle !== 'Default Title') params.set('variant', variantTitle);
  if (quantity) params.set('quantity', String(quantity));

  return `/wholesale-custom-orders.html?${params.toString()}`;
}

/**
 * Handle navigation to the custom quote page or inline RFQ form
 * @param {Object} product 
 * @param {Object} options 
 */
export function navigateToQuote(product, options = {}) {
  const url = getQuoteUrl(product, options);
  window.location.href = url;
}
