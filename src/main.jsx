
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './App.css'
import App, { CATEGORY_IMAGE_BY_NAME, categories } from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { CatalogProvider } from './context/CatalogContext.jsx'
import { DeliveryProvider } from './context/DeliveryContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { SEOManager } from './components/SEO.jsx'
import { products } from './data/products.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogProvider
        initialProducts={products}
        initialCategories={categories.map((category) => ({
          ...category,
          image: CATEGORY_IMAGE_BY_NAME[category.name] || '/images/fallback.jpg',
        }))}
      >
        <SEOManager />
        <CartProvider>
          <DeliveryProvider>
            <NotificationProvider>
              <OrderProvider>
                <App />
              </OrderProvider>
            </NotificationProvider>
          </DeliveryProvider>
        </CartProvider>
      </CatalogProvider>
    </BrowserRouter>
  </StrictMode>,
)
