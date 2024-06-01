import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/ProductsToRestock.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ProductsToRestock = ({ isLightMode }) => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProductsToRestock = async () => {
            try {
                const response = await axios.get('https://smarterreceipt.onrender.com/api/v1/inventory/products_to_restock', { withCredentials: true });
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
            {products.length >= 1 && (<div className="products-title">
                <h3>Products to Restock</h3>
                <p className="expand-button" onClick={toggleModal}>Expand</p>
            </div>)}
             <div className="products-list">
                <div className="scroll-container">
                    {products.map(product => (
                        <div key={product.name} className={`product-box ${isLightMode ? 'light' : 'dark'}`}>
                            <div className="product-data">
                                <img src={product.image} height={"100em"} width={"100em"}></img>
                                <div className='name-image'>
                                    <h4>{product.name.length >= 18 ? product.name.substring(0, 15) + "..." : product.name}</h4>
                                    <h4 className="red quant">{product.quantity} left</h4>
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
                                    <div className="product-data">
                                        <img src={product.image} height={"100em"} width={"100em"}></img>
                                        <div className='name-image'>
                                            <h4>{product.name}</h4>
                                            <h4 className="red quant">{product.quantity} left</h4>
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
