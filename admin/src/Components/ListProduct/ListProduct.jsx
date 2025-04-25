import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';
import edit_icon from '../../assets/edit_icon.png'; // Biểu tượng để chỉnh sửa thông tin

const ListProduct = () => {
    const [allproducts, setAllProducts] = useState([]);
    const [totals, setTotals] = useState({ women: 0, men: 0, kid: 0 });
    const [editingProduct, setEditingProduct] = useState(null); // State để theo dõi sản phẩm đang được chỉnh sửa
    const [editFormData, setEditFormData] = useState({
        name: '',
        image: '',
        category: '',
        new_price: '',
        old_price: '',
        quantity: ''
    });

    const fetchInfo = async () => {
        await fetch('http://localhost:4000/allproducts')
            .then((res) => res.json())
            .then((data) => { 
                setAllProducts(data); 
                calculateTotals(data); // Calculate totals after fetching data
            });
    }

    useEffect(() => {
        fetchInfo();
    }, []);

    const remove_product = async (id) => {
        await fetch('http://localhost:4000/removeproduct', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        });
        await fetchInfo();
    }

    const startEditing = (product) => {
        setEditingProduct(product._id);
        setEditFormData({
            name: product.name,
            image: product.image,
            category: product.category,
            new_price: product.new_price,
            old_price: product.old_price,
            quantity: product.quantity
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch(`http://localhost:4000/updateproduct/${editingProduct}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData),
            });
            setEditingProduct(null);
            fetchInfo(); // Refresh the list after updating
        } catch (err) {
            console.error('Error updating product:', err);
        }
    };

    const calculateTotals = (products) => {
        const totals = { women: 0, men: 0, kid: 0 };
        products.forEach(product => {
            if (product.category === 'women') {
                totals.women += product.quantity;
            } else if (product.category === 'men') {
                totals.men += product.quantity;
            } else if (product.category === 'kid') {
                totals.kid += product.quantity;
            }
        });
        setTotals(totals);
    }

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        };
        return new Date(dateString).toLocaleString('vi-VN', options);
    }

    return (
        <div className='list-product'>
            <h1>Danh sách tất cả sản phẩm</h1>
            <div className="listproduct-format-main">
                <p>Sản phẩm</p>
                <p>Tiêu đề</p>
                <p>Giá cũ</p>
                <p>Giá mới</p>
                <p>Danh mục</p>
                <p>Số lượng</p>
                <p>Ngày giờ</p>
                <p>Sửa</p>
            </div>
            <div className="listproduct-allproducts">
                <hr />
                {allproducts.map((product, index) => (
                    <div key={index} className="listproduct-format-main listproduct-format">
                        <img src={product.image} alt="" className="listproduct-product-icon" />
                        <p>{product.name}</p>
                        <p>{product.old_price} vnd</p>
                        <p>{product.new_price} vnd</p>
                        <p>{product.category}</p>
                        <p>{product.quantity}</p>
                        <p>{formatDate(product.date)}</p>
                        <div className="listproduct-actions">
                            <img 
                                onClick={() => remove_product(product.id)} 
                                className='listproduct-remove-icon' 
                                src={cross_icon} 
                                alt="Remove" 
                            />
                            <img 
                                onClick={() => startEditing(product)} 
                                className='listproduct-edit-icon' 
                                src={edit_icon} 
                                alt="Edit" 
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="listproduct-bottom-section">
                <div className="listproduct-totals">
                    <hr />
                    <h2>Tổng số lượng theo danh mục</h2>
                    <p>Women: {totals.women}</p>
                    <p>Men: {totals.men}</p>
                    <p>Kid: {totals.kid}</p>
                </div>
                {editingProduct && (
                    <div className="edit-product-form">
                        <h2>Chỉnh sửa thông tin sản phẩm</h2>
                        <form onSubmit={handleEditSubmit}>
                            <label>Tên</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={editFormData.name} 
                                onChange={handleEditChange} 
                            />
                            <label>Hình ảnh</label>
                            <input 
                                type="text" 
                                name="image" 
                                value={editFormData.image} 
                                onChange={handleEditChange} 
                            />
                            <label>Danh mục</label>
                            <input 
                                type="text" 
                                name="category" 
                                value={editFormData.category} 
                                onChange={handleEditChange} 
                            />
                            <label>Giá mới</label>
                            <input 
                                type="number" 
                                name="new_price" 
                                value={editFormData.new_price} 
                                onChange={handleEditChange} 
                            />
                            <label>Giá cũ</label>
                            <input 
                                type="number" 
                                name="old_price" 
                                value={editFormData.old_price} 
                                onChange={handleEditChange} 
                            />
                            <label>Số lượng</label>
                            <input 
                                type="number" 
                                name="quantity" 
                                value={editFormData.quantity} 
                                onChange={handleEditChange} 
                            />
                            <button type="submit">Cập nhật</button>
                            <button type="button" onClick={() => setEditingProduct(null)}>Hủy</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ListProduct;
