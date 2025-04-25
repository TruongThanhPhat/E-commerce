import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';

const CartItems = () => {
    const { getTotalCartAmount, all_product, cartItems, removeFromCart, updateCartItemQuantity, user } = useContext(ShopContext);
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleQuantityChange = (id, event) => {
        const newQuantity = parseInt(event.target.value, 10);
        if (newQuantity > 0) {
            updateCartItemQuantity(id, newQuantity);
        }
    };

    if (!cartItems || typeof cartItems !== 'object') {
        return <div>Loading...</div>;
    }

    return (
        <div className='cartitems'>
            <div className="cartitems-header">
                <h2>Xin chào, {user ? user.name : 'Khách'}</h2>
            </div>
            <div className="cartitems-format-main">
                <p>Sản phẩm</p>
                <p>Tên</p>
                <p>Giá bán</p>
                <p>Số lượng</p>
                <p>Tổng</p>
                <p>Xóa</p>
            </div>
            <hr />
            {all_product.map((e) => {
                if (cartItems[e.id] > 0) {
                    return (
                        <div key={e.id}>
                            <div className="cartitems-format cartitems-format-main">
                                <img src={e.image} alt="" className='carticon-product-icon' />
                                <p>{e.name}</p>
                                <p>{e.new_price} vnd</p>
                                <div className="cartitems-quantity-container">
                                    <button onClick={() => updateCartItemQuantity(e.id, cartItems[e.id] - 1)} disabled={cartItems[e.id] <= 1}>-</button>
                                    <input
                                        type="number"
                                        className='cartitems-quantity'
                                        value={cartItems[e.id]}
                                        onChange={(event) => handleQuantityChange(e.id, event)}
                                        min="1"
                                    />
                                    <button onClick={() => updateCartItemQuantity(e.id, cartItems[e.id] + 1)}>+</button>
                                </div>
                                <p>{e.new_price * cartItems[e.id]} vnd</p>
                                <img className='cartitems-remove-icon' src={remove_icon} onClick={() => removeFromCart(e.id)} alt="" />
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Tổng hàng trong giỏ</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Phụ phí</p>
                            <p>{getTotalCartAmount()} vnd</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Phí vận chuyển</p>
                            <p>Miễn phí</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Tổng</h3>
                            <h3>{getTotalCartAmount()} vnd</h3>
                        </div>
                    </div>
                    <button onClick={handleCheckout}>TIẾP TỤC THANH TOÁN</button>
                </div>
                <div className="cartitems-promocode">
                    <p>Nếu bạn có mã khuyến mại, hãy nhập nó vào đây</p>
                    <div className="cartitems-promobox">
                        <input type="text" placeholder='Mã khuyến mãi' />
                        <button>Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItems;
