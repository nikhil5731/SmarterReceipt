import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SalesChart from './SalesChart';
import Nav from './Nav';
import { toggleMode as helperToggleMode } from './helpers';
import axios from 'axios';
import ProductsToRestock from './ProductsToRestock';

function Home() {
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [shopName, setShopName] = useState('');
    const [inventory, setInventory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Fetching current user');
        axios.get('http://localhost:8000/api/current_user', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    console.log('User is authenticated:', response.data);
                    setUser(response.data);
                    if (!response.data.ShopName) {
                        setShowPopup(true);
                    }
                    fetchInventory(response.data.InventoryId);
                } else {
                    console.log('User is not authenticated, redirecting to login');
                    navigate('/login');
                }
            })
            .catch(error => {
                console.log('Error fetching current user', error);
                navigate('/login');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    const fetchInventory = (inventoryId) => {
        axios.get(`http://localhost:8000/api/inventory/${inventoryId}`, { withCredentials: true })
            .then(response => {
                setInventory(response.data.products);
            })
            .catch(error => {
                console.error('Error fetching inventory:', error);
            });
    };

    useEffect(() => {
        document.body.style.backgroundColor = isLightMode ? '#fff' : '#000';
        document.body.style.color = isLightMode ? '#000' : '#fff';
        const menu = document.querySelector('.menu');
        const popup = document.querySelector('.popup');
        if (menu) {
            menu.style.backgroundColor = isLightMode ? '#000' : '#fff';
            menu.style.color = isLightMode ? '#fff' : '#000';
        }
        if (popup) {
            popup.style.backgroundColor = isLightMode ? '#fff' : '#000';
            popup.style.setProperty('background-color', isLightMode ? '#000' : '#fff', 'important');
            popup.style.color = isLightMode ? '#fff' : '#000';
            popup.style.setProperty('color', isLightMode ? '#fff' : '#000', 'important');
        }
    }, [isLightMode]);

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    const handleShopNameSubmit = () => {
        axios.post('http://localhost:8000/api/addShopName', { shopName }, { withCredentials: true })
            .then(response => {
                console.log('Shop name added:', response.data);
                setUser(response.data);
                setShowPopup(false);
            })
            .catch(error => {
                console.log('Error adding shop name', error);
            });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            <div className="container">
                <h1>{user.ShopName}'s Statistics</h1>
                <div className="sales">
                    <h3>Sales</h3>
                    <h4 className="chart-title">Monthly Sales Data</h4>
                    <div className="chart">
                        <SalesChart isLightMode={isLightMode} />
                    </div>
                </div>
                <ProductsToRestock isLightMode={isLightMode} />
                <div className="inventory">
                    <h3>Inventory</h3>
                    <ul>
                        {inventory.map(product => (
                            <li key={product.barcode}>
                                {product.barcode} - ${product.price} - {product.quantity} units
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {showPopup && (
                <div className="backdrop">
                    <div className="popup">
                        <h2>Enter your shop name</h2>
                        <input
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                        />
                        <button onClick={handleShopNameSubmit}>Submit</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
