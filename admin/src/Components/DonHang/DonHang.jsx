import React, { useEffect, useState } from 'react';
import './DonHang.css';
import axios from 'axios';

const DonHang = () => {
  const [orders, setOrders] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState({});
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // Thêm state để lưu chế độ xem
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    onlineOrders: 0,
    codOrders: 0,
    totalProductsSold: 0,
    productQuantities: {}
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:4000/allorders');
        const fetchedOrders = response.data.orders;
        setOrders(fetchedOrders);

        const ordersByUser = fetchedOrders.reduce((acc, order) => {
          if (!acc[order.userId._id]) {
            acc[order.userId._id] = {
              userName: order.userId.name,
              orders: []
            };
          }
          acc[order.userId._id].orders.push(order);
          return acc;
        }, {});

        setGroupedOrders(ordersByUser);
        calculateStats(fetchedOrders, viewMode); // Tính toán thống kê dựa trên chế độ xem
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();
  }, [viewMode]); // Cập nhật khi viewMode thay đổi

  const calculateStats = (orders, mode) => {
    const currentDate = new Date();
    let filterCondition;

    if (mode === 'daily') {
      const today = currentDate.toISOString().split('T')[0];
      filterCondition = order => new Date(order.createdAt).toISOString().split('T')[0] === today;
    } else {
      const currentMonth = currentDate.toISOString().split('T')[0].slice(0, 7);
      filterCondition = order => new Date(order.createdAt).toISOString().split('T')[0].slice(0, 7) === currentMonth;
    }

    const filteredOrders = orders.filter(filterCondition);
    const totalOrders = filteredOrders.length;
    const totalAmount = filteredOrders.reduce((sum, order) => sum + order.amount, 0);
    const onlineOrders = filteredOrders.filter(order => order.paymentMethod === 'Online').length;
    const codOrders = filteredOrders.filter(order => order.paymentMethod === 'COD').length;
    const totalProductsSold = filteredOrders.reduce((sum, order) => {
      return sum + order.products.reduce((productSum, product) => productSum + product.quantity, 0);
    }, 0);

    const productQuantities = filteredOrders.reduce((acc, order) => {
      order.products.forEach(product => {
        if (!acc[product.name]) {
          acc[product.name] = 0;
        }
        acc[product.name] += product.quantity;
      });
      return acc;
    }, {});

    setStats({ totalOrders, totalAmount, onlineOrders, codOrders, totalProductsSold, productQuantities });
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await axios.delete(`http://localhost:4000/orders/${orderId}`);
      if (response.data.success) {
        const updatedOrders = orders.filter(order => order._id !== orderId);
        setOrders(updatedOrders);

        const updatedOrdersByUser = { ...groupedOrders };
        Object.keys(updatedOrdersByUser).forEach(userId => {
          updatedOrdersByUser[userId].orders = updatedOrdersByUser[userId].orders.filter(order => order._id !== orderId);
        });
        setGroupedOrders(updatedOrdersByUser);

        calculateStats(updatedOrders, viewMode);
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:4000/orders/${editingOrder._id}`, {
        address: { address: editingOrder.address.address, note: editingOrder.address.note },
        status: editingOrder.status,
        products: editingOrder.products,
        amount: editingOrder.amount
      });
      if (response.data.success) {
        const updatedOrder = response.data.order;
        const updatedOrders = orders.map(order => order._id === editingOrder._id ? updatedOrder : order);
        setOrders(updatedOrders);

        const updatedOrdersByUser = { ...groupedOrders };
        updatedOrdersByUser[editingOrder.userId._id].orders = updatedOrdersByUser[editingOrder.userId._id].orders.map(order => order._id === editingOrder._id ? updatedOrder : order);
        setGroupedOrders(updatedOrdersByUser);

        calculateStats(updatedOrders, viewMode);
        setEditingOrder(null);
      }
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingOrder({ ...editingOrder, [name]: value });
  };

  const handleProductChange = (e, productId) => {
    const { name, value } = e.target;
    const updatedProducts = editingOrder.products.map(product => product.productId === productId ? { ...product, [name]: value } : product);
    setEditingOrder({ ...editingOrder, products: updatedProducts });
  };

  return (
    <div className="orders">
      <h2>Thống kê đơn hàng</h2>
      <div className="view-mode-selector">
        <button onClick={() => setViewMode('daily')}>Thống kê trong ngày</button>
        <button onClick={() => setViewMode('monthly')}>Thống kê tháng</button>
      </div>
      <div className="stats">
        <h3>Thống kê {viewMode === 'daily' ? 'hôm nay' : 'tháng này'}:</h3>
        <p>Tổng số đơn hàng: {stats.totalOrders}</p>
        <p>Tổng số tiền của các đơn hàng: {stats.totalAmount.toLocaleString()} VND</p>
        <p>Số đơn hàng thanh toán trực tuyến: {stats.onlineOrders}</p>
        <p>Số đơn hàng thanh toán khi nhận hàng: {stats.codOrders}</p>
        <p>Tổng số sản phẩm bán ra: {stats.totalProductsSold}</p>
        <h3>Số lượng từng loại sản phẩm bán ra:</h3>
        <ul>
          {Object.keys(stats.productQuantities).map(productName => (
            <li key={productName}>{productName}: {stats.productQuantities[productName]}</li>
          ))}
        </ul>
      </div>
      {Object.keys(groupedOrders).map((userId) => (
        <div key={userId} className="user-orders">
          <h3>Người dùng: {groupedOrders[userId].userName}</h3>
          <table>
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Tổng tiền</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Phương thức thanh toán</th>
                <th>Ngày tạo</th>
                <th>Update</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {groupedOrders[userId].orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>
                    {order.products.map((product) => (
                      <div key={product.productId}>
                        {product.name} ({product.quantity})
                        {editingOrder && editingOrder._id === order._id && (
                          <div>
                            <input type="number" name="quantity" value={product.quantity} onChange={(e) => handleProductChange(e, product.productId)} />
                            <input type="number" name="price" value={product.price} onChange={(e) => handleProductChange(e, product.productId)} />
                          </div>
                        )}
                      </div>
                    ))}
                  </td>
                  <td>
                    {order.products.reduce((total, product) => total + product.quantity, 0)}
                  </td>
                  <td>{order.amount.toLocaleString()} VND</td>
                  <td>{order.address.address}</td>
                  <td>{order.status}</td>
                  <td>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.updated_at ? order.updated_at : 'Chưa cập nhật'}</td>
                  <td>
                    <button onClick={() => handleEditOrder(order)}>Sửa</button>
                    <button onClick={() => handleDeleteOrder(order._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {editingOrder && (
        <div className="edit-order">
          <h3>Sửa đơn hàng</h3>
          <form onSubmit={handleSaveOrder}>
            <label>
              Địa chỉ:
              <input type="text" name="address" value={editingOrder.address.address} onChange={(e) => setEditingOrder({ ...editingOrder, address: { ...editingOrder.address, address: e.target.value } })} />
            </label>
            <label>
              Ghi chú:
              <input type="text" name="note" value={editingOrder.address.note} onChange={(e) => setEditingOrder({ ...editingOrder, address: { ...editingOrder.address, note: e.target.value } })} />
            </label>
            <label>
              Trạng thái:
              <input type="text" name="status" value={editingOrder.status} onChange={handleChange} />
            </label>
            <label>
              Tổng tiền:
              <input type="number" name="amount" value={editingOrder.amount} onChange={handleChange} />
            </label>
            <button type="submit">Lưu</button>
            <button type="button" onClick={() => setEditingOrder(null)}>Hủy</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DonHang;
