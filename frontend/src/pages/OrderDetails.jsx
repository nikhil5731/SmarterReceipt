import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Nav from '../components/Nav';
import '../css/OrderDetails.css';

const OrderDetails = () => {
    const { shopName, orderNumber } = useParams();
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [transaction, setTransaction] = useState(null);

    useEffect(() => {
        document.body.style.background = isLightMode ? "#fff" : "#000";
        document.body.style.color = isLightMode ? "#000" : "#fff";
    }, [isLightMode]);

    useEffect(() => {
        axios.get(`https://smarterreceipt.onrender.com/api/v1/inventory/${shopName}/${orderNumber - 1}`)
            .then(response => {
                setTransaction(response.data.transaction);
            })
            .catch(error => {
                console.error('Error fetching transaction:', error);
            });
    }, [shopName, orderNumber]);

    const calculateTotalPrice = () => {
        return transaction.items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    if (!transaction) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Nav isLightMode={isLightMode} />
            <div className="order-details-container">
                <h1>Order #{orderNumber}</h1>
                <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
                <div className="order-items">
                    {transaction.items.map((item, index) => (
                        <div key={index} className={`product-box ${isLightMode ? 'light' : 'dark'}`}>
                            <div className="product-data">
                                <img src={item.image} height={"100em"} width={"100em"} alt={item.name} />
                                <div className='name-image'>
                                    <h4>{item.name.length >= 30 ? item.name.substring(0, 27) + "..." : item.name}</h4>
                                    <div className="flex">
                                        <h4 className="price">₹{item.price}</h4>
                                        <h4 className="red quant">{item.quantity} {item.quantity > 1 ? 'pieces' : 'piece'}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="total-price">
                    <h2>Total Price: ₹{calculateTotalPrice()}</h2>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
