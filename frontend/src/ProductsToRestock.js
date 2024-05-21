import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductsToRestock.css';

const ProductsToRestock = ({ isLightMode }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/products_to_restock', { withCredentials: true })
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('Error fetching products to restock:', error);
            });
    }, []);

    return (
        <div className={`products-container ${isLightMode ? 'light' : 'dark'}`}>
            <h3>Products to Restock</h3>
            <div className="products-list">
                {products.map(product => (
                    <div key={product.id} className="product-box">
                        <h4>{product.name}</h4>
                        <p>Quantity: {product.quantity}</p>
                        <p>Reorder Level: {product.reorderLevel}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductsToRestock;
