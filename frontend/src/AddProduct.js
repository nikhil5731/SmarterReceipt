import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = ({ onProductAdded }) => {
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleAddProduct = async () => {
        try {
            const product = { barcode, price: parseFloat(price), quantity: parseInt(quantity, 10) };
            await axios.post('http://localhost:8000/api/inventory', { product }, { withCredentials: true });
            if (onProductAdded) {
                onProductAdded();
            }
            setBarcode('');
            setPrice('');
            setQuantity('');
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    return (
        <div className="add-product-form">
            <h3>Add Product</h3>
            <input
                type="text"
                placeholder="Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
            />
            <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
            />
            <button onClick={handleAddProduct}>Add</button>
        </div>
    );
};

export default AddProduct;
