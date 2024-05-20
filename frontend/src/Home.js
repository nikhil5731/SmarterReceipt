import React, { useState, useEffect } from 'react';
import SalesChart from './SalesChart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faBars } from '@fortawesome/free-solid-svg-icons';
import ModeToggler from './ModeToggler';

function Home() {
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    useEffect(() => {
        document.body.style.backgroundColor = isLightMode ? '#fff' : '#000';
        document.body.style.color = isLightMode ? '#000' : '#fff';
    }, [isLightMode]);

    function toggleMode() {
        const newMode = !isLightMode;
        setIsLightMode(newMode);
        localStorage.setItem('isLightMode', JSON.stringify(newMode));
    }

    function openMenu() {
        document.querySelector('.menu').style.animation = 'slideIn 0.5s forwards';
        const listItems = document.querySelectorAll('.menu ul li');
        listItems.forEach((item, index) => {
            item.style.animation = `slideIn 0.5s forwards ${index / 7 + 0.3}s`;
        });
    }

    function closeMenu() {
        document.querySelector('.menu').style.animation = 'slideOut 0.5s forwards';
        const listItems = document.querySelectorAll('.menu ul li');
        setTimeout(() => {
            listItems.forEach((item) => {
                item.style.animation = '';
            });
        }, 500);
    }

    return (
        <div>
            <nav>
                <ModeToggler isLightMode={isLightMode} toggleMode={toggleMode} />
                <div className="burger" onClick={openMenu}>
                    <FontAwesomeIcon icon={faBars} size="3x" />
                </div>
            </nav>
            <div className="menu">
                <ul>
                    <li onClick={toggleMode}>Home</li>
                    <li>About</li>
                    <li>Services</li>
                    <li>Contact</li>
                </ul>
                <div className="close-button" onClick={closeMenu}>
                    <FontAwesomeIcon icon={faX} />
                </div>
            </div>
            <div className="container">
                <h1>ShopNames's Statistics</h1>
                <div className="sales">
                    <h3>SALES</h3>
                    <SalesChart isLightMode={isLightMode} />
                </div>
            </div>
        </div>
    );
}

export default Home;
