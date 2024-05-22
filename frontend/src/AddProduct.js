import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = ({ onProductAdded }) => {
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [productImage, setProductImage] = useState('');
    const [productName, setProductName] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    const fetchProductDetails = async (barcode) => {
        setIsFetching(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/product_details/${barcode}`);
            const product = response.data;
            setProductName(product.name); // Assuming name maps to title
            setProductImage(product.image);
        } catch (error) {
            console.error('Error fetching product details:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleAddProduct = async () => {
        if (!productName || !price || quantity === '') {
            console.error('Invalid product data:', { name: productName, price, quantity });
            alert('Please fill in all fields and ensure the product details are fetched');
            return;
        }

        try {
            const product = { name: productName, price: parseFloat(price), quantity: parseInt(quantity, 10), image: productImage };
            console.log('Sending product data:', product);
            await axios.post('http://localhost:8000/api/inventory', { product }, { withCredentials: true });
            if (onProductAdded) {
                onProductAdded();
            }
            setBarcode('');
            setPrice('');
            setQuantity('');
            setProductImage('');
            setProductName('');
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const handleBarcodeChange = (e) => {
        const newBarcode = e.target.value;
        setBarcode(newBarcode);
        if (newBarcode.length === 12 || newBarcode.length === 13) { // UPC-A or EAN-13
            fetchProductDetails(newBarcode);
        }
    };

    return (
        <div className="add-product-form">
            <h3>Add Product</h3>
            <input
                type="text"
                placeholder="Barcode"
                value={barcode}
                onChange={handleBarcodeChange}
                disabled={isFetching}
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
            <button onClick={handleAddProduct} disabled={isFetching}>Add</button>
            {productImage && (
                <div className="product-preview">
                    <img src={productImage} alt={productName} />
                    <p>{productName}</p>
                </div>
            )}
        </div>
    );
};

export default AddProduct;
