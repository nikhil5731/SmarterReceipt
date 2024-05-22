import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductsToRestock.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ProductsToRestock = ({ isLightMode }) => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    useEffect(() => {
        const expand = document.querySelector('.products-title p');
        if (expand) {
            expand.style.borderColor = isLightMode ? '#000' : '#fff';
        }
    }, [isLightMode]);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <div className={`products-container ${isLightMode ? 'light' : 'dark'}`}>
            <div className="products-title">
                <h3>Products to Restock</h3>
                <p className="expand-button" onClick={toggleModal}>Expand</p>
            </div>
            <div className="products-list">
                <div className="scroll-container">
                    {products.map(product => (
                        <div key={product.name} className={`product-box ${isLightMode ? 'light' : 'dark'}`}>
                            <h4>{product.name}</h4>
                            <div className='product-price'>
                                <div className='product-metrics-row'>
                                    <div><h3>Price</h3></div>
                                    <div><h3>Quantity</h3></div>
                                </div>
                                <div className='product-metrics-row'>
                                    <div><h4>${product.price}</h4></div>
                                    <div><h4>{product.quantity}</h4></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className={`modal ${isLightMode ? 'light' : 'dark'}`}>
                        <div className="modal-header">
                            <button className="x-button" onClick={toggleModal}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="modal-content">
                            {products.map(product => (
                                <div key={product.name} className={`product-box ${isLightMode ? 'light' : 'dark'}`}>
                                    <h4>{product.name}</h4>
                                    <div className='product-price'>
                                        <div className='product-metrics-row'>
                                            <div><h3>Price</h3></div>
                                            <div><h3>Quantity</h3></div>
                                        </div>
                                        <div className='product-metrics-row'>
                                            <div><h4>${product.price}</h4></div>
                                            <div><h4>{product.quantity}</h4></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsToRestock;
