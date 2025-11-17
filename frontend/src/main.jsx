import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { ShipProvider } from './context/ShipContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import { PromotionsProvider } from './context/PromotionsContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <PromotionsProvider>
      <ProductsProvider>
        <CartProvider>
          <ShipProvider>
            <App />
          </ShipProvider>
        </CartProvider>
      </ProductsProvider>
    </PromotionsProvider>
  </BrowserRouter>
)
