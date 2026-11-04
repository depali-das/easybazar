import { writeFile } from 'node:fs/promises'
import { products } from '../src/data/products.js'
import { SEO_CATEGORIES, SEO_CONFIG } from '../src/config/seo.js'

const siteUrl = (process.env.SITE_URL || SEO_CONFIG.siteUrl).replace(/\/+$/, '')

if (!siteUrl || !/^https:\/\/[^/]+$/i.test(siteUrl)) {
  throw new Error(
    'Set SITE_URL or SEO_CONFIG.siteUrl to the deployed HTTPS origin.',
  )
}

const publicPaths = [
  '/',
  '/shop',
  '/products',
  '/categories',
  ...SEO_CATEGORIES.map(({ slug }) => `/category/${slug}`),
  '/offers',
  '/about',
  '/contact',
  '/faq',
  ...products
    .filter((product) => product.active !== false)
    .map((product) => `/products/${product.id}`),
]

const entries = [...new Set(publicPaths)].map(
  (path) => `  <url><loc>${siteUrl}${path}</loc></url>`,
)
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
  '',
].join('\n')

await writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap)
console.log(`Generated public/sitemap.xml with ${entries.length} URLs.`)
