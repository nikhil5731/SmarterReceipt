import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductsToRestock.css';

const ProductsToRestock = ({ isLightMode }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProductsToRestock = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/products_to_restock', { withCredentials: true });
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products to restock:', error);
            }
        };

        fetchProductsToRestock();
    }, []);

    return (
        <div className={`products-container ${isLightMode ? 'light' : 'dark'}`}>
            <h3>Products to Restock</h3>
            <div className="products-list">
                <div className="scroll-container">
                    {products.map(product => (
                        <div key={product.barcode} className="product-box">
                            <h4>{product.name}</h4>
                            <p>Barcode: {product.barcode}</p>
                            <p>Price: ${product.price}</p>
                            <p>Quantity: {product.quantity}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductsToRestock;
