import { toggleMode as helperToggleMode } from '../helpers';
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import axios from 'axios';
import '../css/Transactions.css';

function Transactions() {
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    useEffect(() => {
        document.body.style.background = isLightMode ? "#fff" : "#000";
        document.body.style.color = isLightMode ? "#000" : "#fff";
    }, [isLightMode]);

    useEffect(() => {
        axios.get("https://smarterreceipt.onrender.com/api/v1/inventory/transactions", { withCredentials: true })
            .then(response => {
                console.log('Transactions:', response.data);
                setTransactions(response.data);
            })
            .catch(error => {
                console.error('Error fetching transactions:', error);
            });
    }, []);

    const renderCardBackgrounds = () => {
        const backgrounds = [];
        for (let i = 0; i < 4; i++) {
            backgrounds.push(<div key={i} className="card-background"></div>);
        }
        return backgrounds;
    };

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const handleTransactionClick = (transaction) => {
        setSelectedTransaction(transaction);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedTransaction(null);
    };

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            <div className="transaction-container">
                <h1>Transactions</h1>
                {transactions.map((transaction, index) => (
                    <div className="transaction-box" key={index} onClick={() => handleTransactionClick(transaction)}>
                        <div className="image-container">
                            {renderCardBackgrounds()}
                            <img src={transaction.items[0].image} alt={transaction.items[0].name} className="transaction-image" />
                        </div>
                        <div className="transaction-info">
                            <h4>Order #{index + 1}</h4>
                            <p>{formatDate(transaction.date)}</p>
                        </div>
                    </div>
                ))}
            </div>
            {showPopup && selectedTransaction && (
                <div className="popup-modal">
                    <div className="popup-content">
                        <div className="popup-header">
                            <h2>Transaction Details</h2>
                            <button className="close-button" onClick={handleClosePopup}>X</button>
                        </div>
                        <div className="popup-body">
                            {selectedTransaction.items.map((item, index) => (
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
                            <div>
                                <h3>Total Price: ₹{
                                    selectedTransaction.items.reduce((total, item) => total + item.price * item.quantity, 0)
                                }</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transactions;
