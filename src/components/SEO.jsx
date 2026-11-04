import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  getCategoryBySlug,
  getCategoryPath,
  getPageSEO,
  SEO_CONFIG,
} from '../config/seo.js'
import { useCatalog } from '../context/CatalogContext.jsx'
import { buildStructuredData } from '../utils/structuredData.js'

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (content === undefined || content === null || content === '') {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]')
  if (!url) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }
  element.href = url
}

export default function SEO({
  page,
  pathname,
  product,
  breadcrumbs = [],
}) {
  useEffect(() => {
    const canonicalUrl = SEO_CONFIG.siteUrl
      ? new URL(pathname, SEO_CONFIG.siteUrl).href
      : ''
    const socialImage = page.image || SEO_CONFIG.defaultImage
    const imageUrl = new URL(
      socialImage,
      SEO_CONFIG.siteUrl || window.location.origin,
    ).href
    const robots = page.robots || 'index, follow'

    document.documentElement.lang = SEO_CONFIG.primaryLanguage
    document.title = page.title
    setMeta('name', 'description', page.description)
    setMeta('name', 'keywords', page.keywords)
    setMeta('name', 'robots', robots)
    setMeta('name', 'theme-color', SEO_CONFIG.themeColor)
    setMeta('name', 'language', SEO_CONFIG.primaryLanguage)
    setMeta('property', 'og:type', product ? 'product' : 'website')
    setMeta('property', 'og:site_name', SEO_CONFIG.brandName)
    setMeta('property', 'og:title', page.title)
    setMeta('property', 'og:description', page.description)
    setMeta('property', 'og:description:bn', page.descriptionBn)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:locale', 'bn_BD')
    setMeta('property', 'og:locale:alternate', 'en_BD')
    setMeta('property', 'og:image', imageUrl)
    setMeta('property', 'og:image:alt', imageUrl ? page.title : '')
    setMeta('property', 'product:price:amount', product?.price)
    setMeta('property', 'product:price:currency', product ? SEO_CONFIG.currency : '')
    setMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary')
    setMeta('name', 'twitter:title', page.title)
    setMeta('name', 'twitter:description', page.description)
    setMeta('name', 'twitter:image', imageUrl)
    setCanonical(canonicalUrl)

    let structuredData = document.head.querySelector(
      'script[data-easybazar-structured-data]',
    )
    if (!structuredData) {
      structuredData = document.createElement('script')
      structuredData.type = 'application/ld+json'
      structuredData.dataset.easybazarStructuredData = 'true'
      document.head.appendChild(structuredData)
    }
    structuredData.textContent = JSON.stringify(
      buildStructuredData({ page, product, breadcrumbs }),
    ).replace(/</g, '\\u003c')

    return () => {
      structuredData?.remove()
    }
  }, [page, pathname, product, breadcrumbs])

  return null
}

export function SEOManager() {
  const location = useLocation()
  const { products, categories } = useCatalog()
  const productMatch = location.pathname.match(/^\/products\/([^/]+)\/?$/)
  const product = productMatch
    ? products.find(
        (item) =>
          item.id === Number(productMatch[1]) && item.active !== false,
      )
    : undefined
  const categoryMatch = location.pathname.match(/^\/category\/([^/]+)\/?$/)
  const routeCategory = categoryMatch
    ? getCategoryBySlug(categoryMatch[1])
    : undefined
  const isActiveCategory =
    !routeCategory ||
    categories.some(
      (category) =>
        category.name === routeCategory.name && category.active !== false,
    )
  const page = isActiveCategory
    ? getPageSEO(location.pathname, product)
    : {
        title: `${routeCategory.name} | EasyBazar`,
        description: 'This category is not currently available.',
        robots: 'noindex, nofollow',
      }
  const breadcrumbs = product
    ? [
        { name: 'Home', path: '/' },
        { name: product.category, path: getCategoryPath(product.category) },
        { name: product.name, path: location.pathname },
      ]
    : []

  return (
    <SEO
      page={page}
      pathname={location.pathname}
      product={product}
      breadcrumbs={breadcrumbs}
    />
  )
}
