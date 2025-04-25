import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../../Context/ShopContext';
import './Order.css';

const Order = () => {
    const { userOrders, deleteOrder, userInfo } = useContext(ShopContext);
    const [dailyStats, setDailyStats] = useState({
        totalOrders: 0,
        totalAmount: 0,
        onlineOrders: 0,
        codOrders: 0,
        totalProductsSold: 0,
        productQuantities: {}
    });
    const [monthlyStats, setMonthlyStats] = useState({
        totalOrders: 0,
        totalAmount: 0,
        onlineOrders: 0,
        codOrders: 0,
        totalProductsSold: 0,
        productQuantities: {}
    });
    const [viewMode, setViewMode] = useState('daily'); // daily or monthly

    useEffect(() => {
        calculateStats(userOrders);
    }, [userOrders]);

    const calculateStats = (orders) => {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7);

        const todayOrders = orders.filter(order => new Date(order.createdAt).toISOString().split('T')[0] === today);
        const monthOrders = orders.filter(order => new Date(order.createdAt).toISOString().split('T')[0].slice(0, 7) === currentMonth);

        setDailyStats(computeStats(todayOrders));
        setMonthlyStats(computeStats(monthOrders));
    };

    const computeStats = (orders) => {
        const totalOrders = orders.length;
        const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
        const onlineOrders = orders.filter(order => order.paymentMethod === 'Online').length;
        const codOrders = orders.filter(order => order.paymentMethod === 'COD').length;
        const totalProductsSold = orders.reduce((sum, order) => {
            return sum + order.products.reduce((productSum, product) => productSum + product.quantity, 0);
        }, 0);

        const productQuantities = orders.reduce((acc, order) => {
            order.products.forEach(product => {
                if (!acc[product.name]) {
                    acc[product.name] = 0;
                }
                acc[product.name] += product.quantity;
            });
            return acc;
        }, {});

        return { totalOrders, totalAmount, onlineOrders, codOrders, totalProductsSold, productQuantities };
    };

    const stats = viewMode === 'daily' ? dailyStats : monthlyStats;

    return (
        <div>
            <h2>Lịch sử đơn hàng</h2>
            {userInfo && <h3>Người dùng: {userInfo.name}</h3>}
            <div className="stats-toggle">
                <button onClick={() => setViewMode('daily')}>Xem theo ngày</button>
                <button onClick={() => setViewMode('monthly')}>Xem theo tháng</button>
            </div>
            <div className="order-stats">
                <h3>Thống kê {viewMode === 'daily' ? 'hôm nay' : 'tháng này'}:</h3>
                <p>Tổng số đơn hàng: {stats.totalOrders}</p>
                <p>Tổng số tiền: {stats.totalAmount.toLocaleString()} VND</p>
                <p>Số đơn hàng thanh toán trực tuyến: {stats.onlineOrders}</p>
                <p>Số đơn hàng thanh toán khi nhận hàng: {stats.codOrders}</p>
                <p>Tổng số sản phẩm bán ra: {stats.totalProductsSold}</p>
                <h4>Số lượng từng loại sản phẩm:</h4>
                <ul>
                    {Object.keys(stats.productQuantities).map(productName => (
                        <li key={productName}>{productName}: {stats.productQuantities[productName]}</li>
                    ))}
                </ul>
            </div>
            <div className="order-container">
                {userOrders.length === 0 ? (
                    <p>Không có đơn hàng nào</p>
                ) : (
                    userOrders.map(order => (
                        <div className="order" key={order._id}>
                            <h3>Mã đơn hàng: {order._id}</h3>
                            <h4>Thông tin người mua:</h4>
                            <p className="buyer-info">Tên: {order.buyerInfo.name}</p>
                            <p className="buyer-info">Số điện thoại: {order.buyerInfo.phone}</p>
                            <p>Địa chỉ: {order.address.address}</p>
                            <p className="note">Ghi chú: {order.address.note}</p>
                            <h4>Sản phẩm:</h4>
                            <ul>
                                {order.products.map((product, index) => (
                                    <li key={index}>
                                        {product.name} - Số lượng: {product.quantity} - Giá: {product.price}
                                    </li>
                                ))}
                            </ul>
                            <p>Ngày tạo: {new Date(order.createdAt).toLocaleString()}</p>
                            <p>Ngày cập nhật: {order.updated_at ? order.updated_at : 'Chưa cập nhật'}</p>
                            <p>Tổng tiền: {order.amount}</p>
                            <p>Phương thức thanh toán: {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'}</p>
                            <p className="status">Trạng thái: {order.status === 'Pending' ? 'Đang giao' : order.status}</p>
                            <button onClick={() => deleteOrder(order._id)}>Hủy Đơn Hàng</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Order;
