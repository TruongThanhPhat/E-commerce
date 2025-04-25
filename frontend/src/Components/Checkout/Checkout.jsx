import React, { useContext, useState } from 'react';
import './Checkout.css';
import { ShopContext } from '../../Context/ShopContext';

const Checkout = () => {
    const { cartItems, all_product, getTotalCartAmount, createOrder } = useContext(ShopContext);
    const [buyerInfo, setBuyerInfo] = useState({ name: '', phone: '' });
    const [address, setAddress] = useState({ address: '', note: '' });
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Thêm state cho phương thức thanh toán
    const [cardInfo, setCardInfo] = useState({ cardNumber: '', expiryDate: '', csc: '', password: '' }); // Thêm state cho thông tin thẻ
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name' || name === 'phone') {
            setBuyerInfo(prevState => ({
                ...prevState,
                [name]: value
            }));
        } else {
            setAddress(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        setCardInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    console.log(all_product);

    const handleCheckout = async () => {
        if (paymentMethod === 'Online' && (!cardInfo.cardNumber || !cardInfo.expiryDate || !cardInfo.csc || !cardInfo.password)) {
            setError('Vui lòng điền đầy đủ thông tin thẻ để thanh toán trực tuyến');
            return;
        }

        const products = all_product.filter(product => cartItems[product.id] > 0)
            .map(product => { return { 
                productId: product.id, 
                quantity: cartItems[product.id],
                name: product.name,
                price: product.new_price 
            }});
        const amount = getTotalCartAmount();
        
        const orderData = {
            products,
            amount,
            address,
            buyerInfo,
            paymentMethod,
            cardInfo: paymentMethod === 'Online' ? cardInfo : null // Thêm thông tin thẻ vào đơn hàng nếu thanh toán trực tuyến
        };
    
        try {
            const token = localStorage.getItem('auth-token');
            const response = await fetch('http://localhost:4000/createorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify(orderData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Network response was not ok: ${errorData.message || response.statusText}`);
            }
    
            const data = await response.json();
            console.log(data);
            createOrder(data.order); // Lưu đơn hàng vào context
            setOrder(data.order); // Lưu đơn hàng vào trạng thái
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        }
    };
    

    return (
        <div className='checkout'>
            <h1>Trang Thanh Toán</h1>
            <div className="checkout-container">
                <div className="checkout-section">
                    <h2>Thông Tin Người Mua</h2>
                    <form className="buyer-info-form">
                        <div className="form-group">
                            <label htmlFor="name">Họ và Tên</label>
                            <input type="text" id="name" name="name" value={buyerInfo.name} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số Điện Thoại</label>
                            <input type="tel" id="phone" name="phone" value={buyerInfo.phone} onChange={handleInputChange} required />
                        </div>
                    </form>
                </div>
                <div className="checkout-section">
                    <h2>Thông Tin Giao Hàng</h2>
                    <form className="shipping-info-form">
                        <div className="form-group">
                            <label htmlFor="address">Địa Chỉ</label>
                            <input type="text" id="address" name="address" value={address.address} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="note">Lưu ý</label>
                            <input type="text" id="note" name="note" value={address.note} onChange={handleInputChange} />
                        </div>
                    </form>
                </div>
                <div className="checkout-section">
                    <h2>Phương Thức Thanh Toán</h2>
                    <form className="payment-method-form">
                        <div className="form-group">
                            <input 
                                type="radio" 
                                id="payment-cod" 
                                name="paymentMethod" 
                                value="COD" 
                                checked={paymentMethod === 'COD'} 
                                onChange={handlePaymentChange} 
                            />
                            <label htmlFor="payment-cod">Thanh toán khi nhận hàng (COD)</label>
                        </div>
                        <div className="form-group">
                            <input 
                                type="radio" 
                                id="payment-online" 
                                name="paymentMethod" 
                                value="Online" 
                                checked={paymentMethod === 'Online'} 
                                onChange={handlePaymentChange} 
                            />
                            <label htmlFor="payment-online">Thanh toán trực tuyến(Ghi nợ)</label>
                        </div>
                    </form>
                    {paymentMethod === 'Online' && (
                        <div className="card-info-form">
                            <h3>Thông Tin Thẻ</h3>
                            <div className="form-group">
                                <label htmlFor="cardNumber">Số thẻ*</label>
                                <input type="text" id="cardNumber" name="cardNumber" value={cardInfo.cardNumber} onChange={handleCardInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="expiryDate">Ngày/Tháng/Năm hết hạn*</label>
                                <input type="text" id="expiryDate" name="expiryDate" value={cardInfo.expiryDate} onChange={handleCardInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="csc">CSC*</label>
                                <input type="text" id="csc" name="csc" value={cardInfo.csc} onChange={handleCardInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu*</label>
                                <input type="password" id="password" name="password" value={cardInfo.password} onChange={handleCardInputChange} required />
                            </div>
                        </div>
                    )}
                </div>
                <div className="checkout-summary">
                    <h2>Chi tiết đơn hàng</h2>
                    {all_product.map(product => (
                        cartItems[product.id] > 0 && (
                            <div className="summary-item" key={product.id}>
                                <span>{product.name} x {cartItems[product.id]}</span>
                                <span>{product.new_price * cartItems[product.id]} VND</span>
                            </div>
                        )
                    ))}
                    <div className="summary-item">
                        <span>Vận Chuyển:</span>
                        <span>Miễn phí</span>
                    </div>
                    <div className="summary-item total">
                        <span>Tổng:</span>
                        <span>{getTotalCartAmount()} VND</span>
                    </div>
                    <button className="checkout-button" type="button" onClick={handleCheckout}>Thanh Toán</button>
                </div>
            </div>
            {error && (
                <div className="error-message">
                    <p>Error: {error}</p>
                </div>
            )}
            {order && (
                <div className="order-details">
                    <h2>Chi tiết đơn hàng</h2>
                    <p>Order ID: {order._id}</p>
                    <p>Status: {order.status}</p>
                    <p>Total Amount: {order.amount} VND</p>
                    <p>Payment Method: {order.paymentMethod}</p>
                    <div className="order-buyer-info">
                        <p><strong>Họ và Tên:</strong> {order.buyerInfo.name}</p>
                        <p><strong>Số Điện Thoại:</strong> {order.buyerInfo.phone}</p>
                        <p><strong>Địa Chỉ:</strong> {order.address.address}</p>
                        <p><strong>Lưu ý:</strong> {order.address.note}</p>
                    </div>
                    <div className="order-products">
                        <h2>Products:</h2>
                        <ul>
                            {order.products.map((product, index) => (
                                <li key={index}>
                                    <p>Tên Sản Phẩm: {product.name}</p>
                                    <p>Số Lượng: {product.quantity}</p>
                                    <p>Giá: {product.price * product.quantity} VND</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
