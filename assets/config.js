/**
 * XENTIA INDUSTRIES - PUBLIC CONFIGURATION
 * Browser-Safe Configuration (ZERO Private Credentials)
 * Authority: /docs/SHOPIFY-SECURITY.md
 */

export const CONFIG = {
  // Shopify Storefront Public Parameters
  shopify: {
    storeDomain: 'xentiaindustries.myshopify.com',
    publicAccessToken: '1af9a69e60ce1bce5d803c2e53ba47e8',
    apiVersion: '2024-04',
    graphqlEndpoint: 'https://xentiaindustries.myshopify.com/api/2024-04/graphql.json',
    country: 'US',
    language: 'en',
    currency: 'USD',
  },

  // Authoritative Company Information (Source: Official Policies & Catalogs)
  company: {
    name: 'Xentia Industries',
    tagline: 'Precision Surgical Instruments Manufacturer',
    location: 'Sialkot, Punjab, Pakistan',
    fullAddress: 'Shahab Pura Road, Small Industries Estate, Sialkot 51310, Punjab, Pakistan',
    email: 'xentiaindustries@gmail.com',
    phone: '+923497400818',
    whatsapp: '+923497400818',
    whatsappFormatted: '+92 349 7400818',
    primaryDomain: 'https://xentiaindustries.com',
    shopifyStoreUrl: 'https://xentiaindustries.myshopify.com',
  },

  // Canonical 17 Surgical Disciplines (Source: Product Category Catalog)
  categories: [
    { id: 1, handle: 'general-surgery-instruments', name: 'General Surgery', icon: 'scalpel' },
    { id: 2, handle: 'plastic-cosmetic-surgery-instruments', name: 'Plastic & Cosmetic Surgery', icon: 'scissors' },
    { id: 3, handle: 'rhinoplasty-ent-instruments', name: 'Rhinoplasty & ENT', icon: 'nose' },
    { id: 4, handle: 'orthopedic-instruments', name: 'Orthopedic Instruments', icon: 'bone' },
    { id: 5, handle: 'spine-surgery-instruments', name: 'Spine Surgery', icon: 'spine' },
    { id: 6, handle: 'neurosurgical-instruments', name: 'Neurosurgical Instruments', icon: 'brain' },
    { id: 7, handle: 'maxillofacial-oral-surgery-instruments', name: 'Maxillofacial & Oral', icon: 'face' },
    { id: 8, handle: 'ophthalmic-instruments', name: 'Ophthalmic Instruments', icon: 'eye' },
    { id: 9, handle: 'dental-instruments', name: 'Dental Instruments', icon: 'tooth' },
    { id: 10, handle: 'arthroscopy-instruments', name: 'Arthroscopy Instruments', icon: 'joint' },
    { id: 11, handle: 'gynecology-obstetrics-instruments', name: 'Gynecology & Obstetrics', icon: 'gyn' },
    { id: 12, handle: 'urology-instruments', name: 'Urology Instruments', icon: 'uro' },
    { id: 13, handle: 'veterinary-instruments', name: 'Veterinary Instruments', icon: 'vet' },
    { id: 14, handle: 'laparoscopic-instruments', name: 'Laparoscopic Instruments', icon: 'scope' },
    { id: 15, handle: 'cardiovascular-thoracic-instruments', name: 'Cardiovascular & Thoracic', icon: 'heart' },
    { id: 16, handle: 'dermatology-instruments', name: 'Dermatology Instruments', icon: 'skin' },
    { id: 17, handle: 'electrosurgical-surgical-accessories', name: 'Electrosurgical & Accessories', icon: 'zap' }
  ],

  // Canonical 19 Surgical Sets (Source: Surgical Sets Catalog)
  surgicalSets: [
    'General Surgery Sets',
    'Plastic Surgery Sets',
    'Rhinoplasty Sets',
    'ENT Sets',
    'Orthopedic Sets',
    'Neurosurgery Sets',
    'Ophthalmic Sets',
    'Dental Sets',
    'Veterinary Sets',
    'Gynecology Sets',
    'Urology Sets',
    'Maxillofacial Sets',
    'Cardiovascular & Thoracic Instruments Set',
    'Arthroscopy Sets',
    'Spine Surgery Sets',
    'Laparoscopic Sets',
    'BBL Sets',
    'Liposuction Sets',
    'Mommy Makeover Sets'
  ]
};
