import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import About from './pages/About.jsx';
import Cart from './pages/Cart.jsx';
import Collection from './pages/Collection.jsx';
import Contact from './pages/Contact.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Orders from './pages/Orders.jsx';
import PlaceOrder from './pages/PlaceOrder.jsx';
import Product from './pages/Product.jsx';
import MyProfile from './pages/MyProfile.jsx';

import ScrollToTop from './components/ScrollToTop.jsx';

const App = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <ScrollToTop />
    <Navbar />
    <SearchOverlay />
    <main className="flex-1 bg-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/place-orders" element={<PlaceOrder />} />
        <Route path="/products/:productId?" element={<Product />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
