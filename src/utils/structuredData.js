import { CONTACT_INFO } from '../config/contact.js'
import { SEO_CONFIG, SEO_PAGES } from '../config/seo.js'

function getAbsoluteUrl(path) {
  if (!SEO_CONFIG.siteUrl || !path) return undefined
  return new URL(path, SEO_CONFIG.siteUrl).href
}

export function buildStructuredData({ page, product, breadcrumbs = [] }) {
  const websiteUrl = getAbsoluteUrl('/')
  const organizationId = websiteUrl
    ? `${websiteUrl}#organization`
    : undefined
  const websiteId = websiteUrl ? `${websiteUrl}#website` : undefined
  const graph = [
    {
      '@type': 'Organization',
      ...(organizationId ? { '@id': organizationId } : {}),
      name: SEO_CONFIG.brandName,
      alternateName: SEO_CONFIG.brandNameBn,
      description: SEO_CONFIG.taglineBn,
      ...(websiteUrl ? { url: websiteUrl } : {}),
      logo: getAbsoluteUrl(SEO_CONFIG.defaultImage),
      areaServed: {
        '@type': 'City',
        name: 'Rajshahi',
        containedInPlace: {
          '@type': 'Country',
          name: 'Bangladesh',
        },
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: CONTACT_INFO.phoneLink,
        email: CONTACT_INFO.email,
        contactType: 'customer support',
        areaServed: 'BD',
        availableLanguage: ['Bengali', 'English'],
      },
    },
    {
      '@type': 'OnlineStore',
      ...(websiteId ? { '@id': `${websiteUrl}#store` } : {}),
      name: SEO_CONFIG.brandName,
      description: SEO_PAGES.shop.description,
      ...(websiteUrl ? { url: websiteUrl } : {}),
      ...(organizationId ? { parentOrganization: { '@id': organizationId } } : {}),
      areaServed: {
        '@type': 'City',
        name: 'Rajshahi',
      },
      currenciesAccepted: SEO_CONFIG.currency,
    },
    {
      '@type': 'WebSite',
      ...(websiteId ? { '@id': websiteId } : {}),
      name: SEO_CONFIG.brandName,
      alternateName: SEO_CONFIG.brandNameBn,
      ...(websiteUrl ? { url: websiteUrl } : {}),
      inLanguage: [SEO_CONFIG.primaryLanguage, SEO_CONFIG.secondaryLanguage],
      ...(organizationId ? { publisher: { '@id': organizationId } } : {}),
    },
  ]

  if (product) {
    const productImage = getAbsoluteUrl(product.image)
    const offer = Number.isFinite(product.price)
      ? {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: SEO_CONFIG.currency,
          ...(getAbsoluteUrl(`/products/${product.id}`)
            ? { url: getAbsoluteUrl(`/products/${product.id}`) }
            : {}),
          ...(Number.isFinite(product.stock)
            ? {
                availability:
                  product.stock > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
              }
            : {}),
        }
      : undefined

    graph.push({
      '@type': 'Product',
      name: product.name,
      description: page.description,
      ...(productImage ? { image: productImage } : {}),
      category: product.category,
      ...(offer ? { offers: offer } : {}),
    })
  }

  if (breadcrumbs.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        ...(getAbsoluteUrl(breadcrumb.path)
          ? { item: getAbsoluteUrl(breadcrumb.path) }
          : {}),
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}
