export const SEO_CONFIG = {
  brandName: 'EasyBazar',
  brandNameBn: 'ইজিবাজার',
  taglineBn: 'সহজ বাজার, ঘরে ঘরে।',
  taglineEn: 'Local Shop, Better Life.',
  websiteType: 'Online Grocery Store',
  serviceArea: 'Rajshahi, Bangladesh',
  primaryLanguage: 'bn',
  secondaryLanguage: 'en',
  currency: 'BDT',
  currencySymbol: '৳',
  siteUrl: '',
  defaultImage: '/images/banner.webp',
  themeColor: '#15803d',
}

export const SEO_PAGES = {
  home: {
    title: 'EasyBazar | Online Grocery Shopping in Rajshahi',
    description:
      'Shop fresh vegetables, fruits, rice, groceries and daily essentials online with EasyBazar. Convenient grocery shopping and delivery in Rajshahi, Bangladesh.',
    descriptionBn:
      'ইজিবাজারে রাজশাহীতে অনলাইনে তাজা শাকসবজি, ফল, চাল, নিত্যপ্রয়োজনীয় মুদি পণ্য ও দৈনন্দিন বাজার করুন।',
    keywords: 'online grocery Rajshahi, groceries Bangladesh, EasyBazar',
  },
  shop: {
    title: 'Shop Groceries Online in Rajshahi | EasyBazar',
    description:
      'Browse everyday groceries, fresh produce and household essentials from EasyBazar, serving Rajshahi, Bangladesh.',
    descriptionBn:
      'রাজশাহীতে ইজিবাজার থেকে তাজা পণ্য, মুদি বাজার ও ঘরের প্রয়োজনীয় জিনিস অনলাইনে দেখুন।',
  },
  products: {
    title: 'All Grocery Products | EasyBazar Rajshahi',
    description:
      'Explore EasyBazar grocery products, prices and everyday essentials available for delivery in Rajshahi.',
    descriptionBn:
      'রাজশাহীতে ডেলিভারির জন্য ইজিবাজারের সব মুদি পণ্য, দাম ও দৈনন্দিন প্রয়োজনীয় জিনিস দেখুন।',
  },
  categories: {
    title: 'Grocery Categories | EasyBazar Rajshahi',
    description:
      'Explore vegetables, fruits, rice, lentils, dairy, fish, meat, oil and grocery categories at EasyBazar.',
    descriptionBn:
      'ইজিবাজারে শাকসবজি, ফল, চাল, ডাল, দুধ, মাছ, মাংস, তেল ও অন্যান্য পণ্যের বিভাগ দেখুন।',
  },
  offers: {
    title: 'Grocery Offers & Coupons | EasyBazar',
    description:
      'See current EasyBazar grocery offers and coupon details. Check eligibility before applying a code at checkout.',
    descriptionBn:
      'ইজিবাজারের বর্তমান বাজার অফার ও কুপনের বিস্তারিত দেখুন এবং ব্যবহারের শর্ত যাচাই করুন।',
  },
  contact: {
    title: 'Contact EasyBazar | Rajshahi Grocery Support',
    description:
      'Contact EasyBazar customer support in Rajshahi by phone, email or WhatsApp, or send a message online.',
    descriptionBn:
      'ফোন, ইমেইল, WhatsApp অথবা অনলাইন ফর্মে রাজশাহীতে ইজিবাজার গ্রাহক সহায়তার সঙ্গে যোগাযোগ করুন।',
  },
  about: {
    title: 'About EasyBazar | Local Shop, Better Life',
    description:
      'Learn about EasyBazar, an online grocery storefront with everyday products and sample Bangladesh retail prices.',
    descriptionBn:
      'ইজিবাজার সম্পর্কে জানুন—বাংলাদেশি নিত্যপ্রয়োজনীয় পণ্য ও নমুনা খুচরা দামের একটি অনলাইন মুদি স্টোর।',
  },
  faq: {
    title: 'Frequently Asked Questions | EasyBazar',
    description:
      'Find answers about EasyBazar ordering, Rajshahi delivery areas, charges, payments and customer support.',
    descriptionBn:
      'ইজিবাজারে অর্ডার, রাজশাহীতে ডেলিভারি, চার্জ, পেমেন্ট এবং গ্রাহক সহায়তা সম্পর্কে উত্তর জানুন।',
  },
}

export const SEO_CATEGORIES = [
  { name: 'Vegetables', slug: 'vegetables', title: 'Fresh Vegetables Online in Rajshahi | EasyBazar' },
  { name: 'Fruits', slug: 'fruits', title: 'Fresh Fruits Online in Rajshahi | EasyBazar' },
  { name: 'Rice & Grains', slug: 'rice-and-grains', title: 'Rice & Grains Online in Rajshahi | EasyBazar' },
  { name: 'Lentils', slug: 'lentils', title: 'Lentils & Pulses Online in Rajshahi | EasyBazar' },
  { name: 'Dairy & Eggs', slug: 'dairy-and-eggs', title: 'Dairy & Eggs Online in Rajshahi | EasyBazar' },
  { name: 'Fish & Meat', slug: 'fish-and-meat', title: 'Fish & Meat Online in Rajshahi | EasyBazar' },
  { name: 'Oil', slug: 'oil', title: 'Cooking Oil Online in Rajshahi | EasyBazar' },
  { name: 'Groceries', slug: 'groceries', title: 'Daily Groceries Online in Rajshahi | EasyBazar' },
  { name: 'Beverages', slug: 'beverages', title: 'Beverages Online in Rajshahi | EasyBazar' },
  { name: 'Personal care', slug: 'personal-care', title: 'Personal Care Products in Rajshahi | EasyBazar' },
  { name: 'Household essentials', slug: 'household-essentials', title: 'Household Essentials in Rajshahi | EasyBazar' },
  { name: 'Baby care', slug: 'baby-care', title: 'Baby Care Products in Rajshahi | EasyBazar' },
  { name: 'Bakery and snacks', slug: 'bakery-and-snacks', title: 'Bakery & Snacks in Rajshahi | EasyBazar' },
]

export const PRIVATE_ROUTES = [
  '/checkout',
  '/orders',
  '/wishlist',
  '/account',
  '/cart',
  '/notifications',
  '/support',
  '/support/tickets',
  '/track-order',
  '/admin',
  '/admin-orders',
]

export function getCategoryPath(categoryName) {
  const category = SEO_CATEGORIES.find((item) => item.name === categoryName)
  return category ? `/category/${category.slug}` : '/shop'
}

export function getCategoryBySlug(slug) {
  return SEO_CATEGORIES.find((category) => category.slug === slug)
}

export function getPageSEO(pathname, product) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  const privateRoute =
    PRIVATE_ROUTES.find((route) => normalizedPath === route) ||
    PRIVATE_ROUTES.find((route) => normalizedPath.startsWith(`${route}/`))
  if (privateRoute) {
    const privateTitles = {
      '/checkout': 'Checkout',
      '/orders': 'Order History',
      '/wishlist': 'Wishlist',
      '/account': 'Account',
      '/cart': 'Cart',
      '/notifications': 'Notifications',
      '/support': 'Customer Support',
      '/support/tickets': 'My Support Tickets',
      '/track-order': 'Track Order',
      '/admin': 'Admin Dashboard',
      '/admin-orders': 'Admin Orders',
    }
    return {
      title: `${privateTitles[privateRoute] || 'Private page'} | EasyBazar`,
      description: 'This EasyBazar customer or administration page is not indexed.',
      robots: 'noindex, nofollow',
    }
  }

  if (product) {
    const description =
      product.description ||
      `${product.name} is listed in ${product.category} and sold in the ${product.unit} package shown above.`
    return {
      title: `${product.name} | EasyBazar Rajshahi`,
      description,
      image: product.image || SEO_CONFIG.defaultImage,
      type: 'product',
      product,
    }
  }

  if (normalizedPath.startsWith('/products/')) {
    return {
      title: 'Product Not Found | EasyBazar',
      description: 'This product is not available in the EasyBazar catalog.',
      robots: 'noindex, nofollow',
    }
  }

  const categorySlug = normalizedPath.match(/^\/category\/([^/]+)$/)?.[1]
  if (categorySlug) {
    const category = getCategoryBySlug(categorySlug)
    if (!category) {
      return {
        title: 'Page Not Found | EasyBazar',
        description: 'This EasyBazar page could not be found.',
        robots: 'noindex, nofollow',
      }
    }
    return {
      title: category.title,
      description: `Shop ${category.name.toLowerCase()} online with EasyBazar in Rajshahi, Bangladesh.`,
      descriptionBn: `রাজশাহীতে ইজিবাজার থেকে অনলাইনে ${category.name} কিনুন।`,
      keywords: `${category.name.toLowerCase()} online Rajshahi, EasyBazar`,
    }
  }

  const routes = {
    '/': 'home',
    '/shop': 'shop',
    '/products': 'products',
    '/categories': 'categories',
    '/offers': 'offers',
    '/contact': 'contact',
    '/about': 'about',
    '/faq': 'faq',
  }
  const pageKey = routes[normalizedPath]
  if (pageKey) return SEO_PAGES[pageKey]

  return {
    title: 'Page Not Found | EasyBazar',
    description: 'This EasyBazar page could not be found.',
    robots: 'noindex, nofollow',
  }
}
