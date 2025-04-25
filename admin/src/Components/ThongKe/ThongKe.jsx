import React, { useEffect, useState } from 'react';
import './ThongKe.css';
import cross_icon from '../../assets/cross_icon.png';

const ThongKe = () => {
    const [allproducts, setAllProducts] = useState([]);
    const [categoryCounts, setCategoryCounts] = useState({ women: 0, men: 0, kid: 0 });
    const [categoryQuantities, setCategoryQuantities] = useState({ women: 0, men: 0, kid: 0 });
    const [totalQuantity, setTotalQuantity] = useState(0);

    const fetchInfo = async () => {
        await fetch('http://localhost:4000/allproducts')
        .then((res) => res.json())
        .then((data) => { 
            setAllProducts(data); 
            calculateCategoryCounts(data); // Calculate category counts after fetching data
            calculateCategoryQuantities(data); // Calculate category quantities after fetching data
            calculateTotalQuantity(data); // Calculate total quantity after fetching data
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

    const calculateCategoryCounts = (products) => {
        const counts = { women: 0, men: 0, kid: 0 };
        products.forEach(product => {
            if (product.category === 'women') {
                counts.women += 1;
            } else if (product.category === 'men') {
                counts.men += 1;
            } else if (product.category === 'kid') {
                counts.kid += 1;
            }
        });
        setCategoryCounts(counts);
    }

    const calculateCategoryQuantities = (products) => {
        const quantities = { women: 0, men: 0, kid: 0 };
        products.forEach(product => {
            if (product.category === 'women') {
                quantities.women += product.quantity;
            } else if (product.category === 'men') {
                quantities.men += product.quantity;
            } else if (product.category === 'kid') {
                quantities.kid += product.quantity;
            }
        });
        setCategoryQuantities(quantities);
    }

    const calculateTotalQuantity = (products) => {
        let total = 0;
        products.forEach(product => {
            total += product.quantity;
        });
        setTotalQuantity(total);
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
        <div className="container">
            <div className='thongke'>
                <h1>Danh sách tất cả sản phẩm</h1>
                <div className="thongke-format-main">
                    <p>Tên sản phẩm</p>
                    <p>Danh mục</p>
                    <p>Số lượng</p>
                    <p>Ngày giờ</p>
                    <p>Xóa</p>
                </div>
                <div className="thongke-allproducts">
                    <hr />
                    {allproducts.map((product, index) => (
                        <div key={index} className="thongke-format-main thongke-format">
                            <p>{product.name}</p>
                            <p>{product.category}</p>
                            <p>{product.quantity}</p>
                            <p>{formatDate(product.date)}</p>
                            <img onClick={() => { remove_product(product.id) }} className='thongke-remove-icon' src={cross_icon} alt="Delete" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="thongke-totals">
                <div className="totals-row">
                    <div>
                        <h2>Số lần thêm sản phẩm của từng danh mục</h2>
                        <p>Women: {categoryCounts.women}</p>
                        <p>Men: {categoryCounts.men}</p>
                        <p>Kid: {categoryCounts.kid}</p>
                    </div>
                    <div>
                        <h2>Tổng số lượng sản phẩm theo danh mục</h2>
                        <p>Women: {categoryQuantities.women}</p>
                        <p>Men: {categoryQuantities.men}</p>
                        <p>Kid: {categoryQuantities.kid}</p>
                    </div>
                    <div>
                        <h2>Tổng số lượng sản phẩm đã thêm</h2>
                        <p>{totalQuantity}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThongKe;
