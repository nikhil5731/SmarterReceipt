import React, { useState, useEffect } from 'react';
import AddProduct from '../components/AddProduct';
import axios from 'axios';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [inventoryId, setInventoryId] = useState(null);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get('https://smarterreceipt.onrender.com/api/v1/user/current_user', { withCredentials: true });
            if (response.data && response.data.InventoryId) {
                setInventoryId(response.data.InventoryId);
                fetchProducts(response.data.InventoryId);
            } else {
                console.error('No inventory ID found for the current user.');
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchProducts = async (inventoryId) => {
        try {
            const response = await axios.get(`https://smarterreceipt.onrender.com/api/v1/inventory/get/${inventoryId}`, { withCredentials: true });
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const handleProductAdded = () => {
        if (inventoryId) {
            fetchProducts(inventoryId);
        }
    };

    return (
        <div className="products-page">
            <h1>Manage Products</h1>
            <AddProduct onProductAdded={handleProductAdded} />
            <div className="product-list">
                <h3>Current Products</h3>
                <ul>
                    {products.map(product => (
                        <li key={product.barcode}>
                            {product.barcode} - ${product.price} - {product.quantity} units
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ProductsPage;
