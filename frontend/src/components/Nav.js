import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faX } from '@fortawesome/free-solid-svg-icons';
import ModeToggler from '../ModeToggler';
import { openMenu, closeMenu } from '../helpers';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function Nav({ isLightMode, toggleMode }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = () => {
        window.location.href = 'http://localhost:8000/auth/google';
    };

    const handleLogout = () => {
        console.log('Logging out');
        axios.get('http://localhost:8000/api/logout', { withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    console.log('Logout successful');
                    navigate('/login');
                } else {
                    console.log('Logout failed');
                }
            })
            .catch(error => {
                console.log('Logout error', error);
            });
    };

    useEffect(() => {
        const menu = document.querySelector('.menu');
        if (menu) {
            menu.style.backgroundColor = isLightMode ? '#ff6b6b' : '#34495e';
        }
    }, [isLightMode]);

    return (
        <div>
            <nav>
                <ModeToggler isLightMode={isLightMode} toggleMode={toggleMode} />
                <div className="burger" onClick={openMenu}>
                    <FontAwesomeIcon icon={faBars} size="3x" />
                </div>
            </nav>
            <div className="menu">
                <div className="close-button" onClick={closeMenu}>
                    <FontAwesomeIcon icon={faX} />
                </div>
                <ul>
                    {location.pathname === '/login' ? (
                        <li onClick={handleLogin}>Login with Google</li>
                    ) : (
                        <>
                            <li>My Account</li>
                            <li>My Inventory</li>
                            <li>New Order</li>
                            <li onClick={handleLogout}>Logout</li>
                        </>
                    )}
                </ul>
                <h2 className="move-down login-heading white">Welcome to <span className="special-heading1">S</span>marter<span className="special-heading1">R</span>eceipt</h2>
            </div>
        </div>
    );
}

export default Nav;
