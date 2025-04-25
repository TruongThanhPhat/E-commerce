import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Footer from './Components/Footer/Footer';
import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kid_banner from './Components/Assets/banner_kids.png';
import ShopPage from './Pages/ShopPage';
import CheckoutPage from './Pages/CheckoutPage';
import OrderItem from './Pages/OrderItem';
import Order from './Components/Order/Order'; // Thêm import cho Order component
import ShopContextProvider from './Context/ShopContext';

const App = () => {
  return (
    <ShopContextProvider>
      <Router>
        <Main />
      </Router>
    </ShopContextProvider>
  );
};

const Main = () => {
  const location = useLocation();
  const isLoginSignupPage = location.pathname === '/login';

  return (
    <div>
      {!isLoginSignupPage && <Navbar />}
      <Routes>
        <Route path='/' element={<ShopPage />} />
        <Route path='/mens' element={<ShopCategory banner={men_banner} category="men" />} />
        <Route path='/womens' element={<ShopCategory banner={women_banner} category="women" />} />
        <Route path='/kids' element={<ShopCategory banner={kid_banner} category="kid" />} />
        <Route path='/product'>
          <Route path=':productId' element={<Product />} />
        </Route>
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<LoginSignup />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/orders' element={<Order />} /> {/* Thêm route cho danh sách đơn hàng */}
        <Route path='/orders/:id' element={<OrderItem />} />
      </Routes>
      {!isLoginSignupPage && <Footer />}
    </div>
  );
};

export default App;
