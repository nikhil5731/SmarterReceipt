import React, { useState, useEffect } from 'react';
import SalesChart from './SalesChart';
import Nav from './Nav';
import { toggleMode as helperToggleMode} from './helpers';

function Home() {
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    useEffect(() => {
        document.body.style.backgroundColor = isLightMode ? '#fff' : '#000';
        document.body.style.color = isLightMode ? '#000' : '#fff';
        document.querySelector('.menu').style.backgroundColor = isLightMode ? '#000' : '#fff';
        document.querySelector('.menu').style.color = isLightMode ? '#fff' : '#000';
    }, [isLightMode]);

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            <div className="container">
                <h1 className='shop-name'>ShopNames's Statistics</h1>
                <div className="sales">
                    <h3>SALES</h3>
                    <SalesChart isLightMode={isLightMode} />
                </div>
            </div>
        </div>
    );
}

export default Home;
