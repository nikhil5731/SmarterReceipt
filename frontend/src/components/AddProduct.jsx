import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AddProduct.css'; // Import the CSS file

function AddProduct() {
    const [productId, setProductId] = useState('');
    const [productName, setProductName] = useState('');
    const [productImage, setProductImage] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        if (productId) {
            axios.get(`http://localhost:8000/api/v1/inventory/product_details/${productId}`, { withCredentials: true })
                .then(response => {
                    const { name, image } = response.data;
                    setProductName(name);
                    setProductImage(image);
                })
                .catch(error => {
                    console.error('Error fetching product details:', error);
                });
        }
    }, [productId]);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!productName || !price || !quantity || !productImage) {
            console.log('Invalid product data:', { name: productName, price, quantity, image: productImage });
            return;
        }

        const product = {
            name: productName,
            price,
            quantity,
            image: productImage
        };

        axios.post('http://localhost:8000/api/v1/inventory/addProduct', { product }, { withCredentials: true })
            .then(response => {
                console.log('Product added to inventory:', response.data);
            })
            .catch(error => {
                console.error('Error updating inventory:', error);
            });
    };

    return (
        <div className="add-product-container">
            <h1>Add Product</h1>
            <form onSubmit={handleSubmit} className="add-product-form">
                <label>
                    Product ID:
                    <input 
                        type="text" 
                        value={productId} 
                        onChange={e => setProductId(e.target.value)} 
                    />
                </label>
                <label>
                    Price:
                    <input 
                        type="number" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                    />
                </label>
                <label>
                    Quantity:
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={e => setQuantity(e.target.value)} 
                    />
                </label>
                <button type="submit">Add to Inventory</button>
            </form>
            {productName && (
                <div className="product-details">
                    <h2>Product Details</h2>
                    <p>Name: {productName}</p>
                    <img src={productImage} alt={productName} className="product-image" />
                </div>
            )}
        </div>
    );
}

export default AddProduct;
