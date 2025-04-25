import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext();

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 301; index++) {
        cart[index] = 0;
    }
    return cart;
};

const ShopContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());
    const [orderData, setOrderData] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [user, setUser] = useState(null);  // Thêm state cho thông tin người dùng

    useEffect(() => {
        fetch('http://localhost:4000/allproducts')
            .then((response) => response.json())
            .then((data) => {
                setAll_Product(data);
            })
            .catch((error) => console.error('There was a problem with the fetch operation:', error));
        
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/getcart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            })
            .then((response) => response.json())
            .then((data) => setCartItems(data))
            .catch((error) => console.error('Error fetching cart data:', error));
            
            fetch('http://localhost:4000/orders', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then((data) => setUserOrders(data.orders))
            .catch((error) => console.error('Error fetching orders:', error));

            // Lấy thông tin người dùng
            fetch('http://localhost:4000/user', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then((data) => setUser(data))
            .catch((error) => console.error('Error fetching user data:', error));
        }
    }, []);

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/addtocart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId }),
            })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error('Error adding to cart:', error));
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] > 0 ? prev[itemId] - 1 : 0
        }));
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/removefromcart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId }),
            })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error('Error removing from cart:', error));
        }
    };

    const updateCartItemQuantity = (itemId, quantity) => {
        setCartItems((prev) => ({ ...prev, [itemId]: quantity }));
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/updatecart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId, quantity }),
            })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error('Error updating cart quantity:', error));
        }
    };

    const clearCart = () => {
        setCartItems(getDefaultCart());
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/clearcart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error('Error clearing cart:', error));
        }
    };

    const updateOrderStatus = (orderId, status) => {
        const updatedOrders = userOrders.map(order =>
            order._id === orderId ? { ...order, status } : order
        );
        setUserOrders(updatedOrders);
        if (localStorage.getItem('auth-token')) {
            fetch(`http://localhost:4000/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({ status })
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error updating order status:', error));
        }
    };

    const deleteOrder = (orderId) => {
        setUserOrders(userOrders.filter(order => order._id !== orderId));
        if (localStorage.getItem('auth-token')) {
            fetch(`http://localhost:4000/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                }
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error deleting order:', error));
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    };

    const createOrder = (order) => {
        setOrderData(order);
    };

    const updateOrder = (updatedOrder) => {
        const updatedOrders = userOrders.map(order => 
            order._id === updatedOrder._id ? updatedOrder : order
        );
        setUserOrders(updatedOrders);
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        updateOrderStatus,
        deleteOrder,
        createOrder,
        updateOrder,
        orderData,
        userOrders,
        user,  // Thêm user vào context value
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
