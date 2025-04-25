import React, { useContext, useState, useEffect, useRef } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import nav_dropdown from '../Assets/nav_dropdown.png';
import axios from 'axios';

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const [user, setUser] = useState(null);
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          const response = await axios.get('http://localhost:4000/user', {
            headers: {
              'auth-token': token
            }
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    setUser(null); // Xóa thông tin người dùng khỏi state
    navigate('/login'); // Chuyển hướng ngay lập tức đến trang đăng nhập
  };

  return (
    <div className='navbar'>
      <div className="nav-logo">
        <img src={logo} alt="Logo" />
        <p>MIRA STORE</p>
      </div>
      <img className='nav-dropdown' onClick={dropdown_toggle} src={nav_dropdown} alt="Dropdown" />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("shop")}><Link style={{ textDecoration: 'none' }} to='/'>Shop</Link>{menu === "shop" && <hr />}</li>
        <li onClick={() => setMenu("mens")}><Link style={{ textDecoration: 'none' }} to='/mens'>Nam</Link>{menu === "mens" && <hr />}</li>
        <li onClick={() => setMenu("womens")}><Link style={{ textDecoration: 'none' }} to='/womens'>Nữ</Link>{menu === "womens" && <hr />}</li>
        <li onClick={() => setMenu("kids")}><Link style={{ textDecoration: 'none' }} to='/kids'>Trẻ em</Link>{menu === "kids" && <hr />}</li>
        <li onClick={() => setMenu("orders")}><Link style={{ textDecoration: 'none' }} to='/orders'>Đơn hàng</Link>{menu === "orders" && <hr />}</li>
      </ul>
      <div className='nav-login-cart'>
        {user ? (
          <>
            <span className="nav-user-name">Xin chào, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to='/login'><button>Login</button></Link>
        )}
        <Link to='/cart'><img src={cart_icon} alt="Cart" /></Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  );
};

export default Navbar;
