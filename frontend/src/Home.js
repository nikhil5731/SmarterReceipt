import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SalesChart from './SalesChart';
import Nav from './Nav';
import { toggleMode as helperToggleMode } from './helpers';
import axios from 'axios';

function Home() {
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [shopName, setShopName] = useState('');
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

    useEffect(() => {
        document.body.style.backgroundColor = isLightMode ? '#fff' : '#000';
        document.body.style.color = isLightMode ? '#000' : '#fff';
        const menu = document.querySelector('.menu');
        if (menu) {
            menu.style.backgroundColor = isLightMode ? '#000' : '#fff';
            menu.style.color = isLightMode ? '#fff' : '#000';
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
        return <div>Loading...</div>; // or a loading spinner
    }

    if (!user) {
        return null;
    }

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            <div className="container">
                <h1 className='shop-name'>{user.ShopName ? `${user.ShopName}'s Statistics` : 'Statistics'}</h1>
                <div className="sales">
                    <h3>SALES</h3>
                    <SalesChart isLightMode={isLightMode} />
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
