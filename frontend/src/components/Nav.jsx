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
        window.location.href = 'https://smarterreceipt.onrender.com/api/v1/auth/google';
    };

    const handleLogout = () => {
        console.log('Logging out');
        axios.get('https://smarterreceipt.onrender.com/api/v1/auth/logout', { withCredentials: true })
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

    const handleDeleteInventory = () => {
        axios.delete('https://smarterreceipt.onrender.com/api/v1/inventory/delete_inventory', { withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    console.log('Delete successful');
                    alert('Inventory deleted successfully');
                } else {
                    console.log('Delete failed');
                    alert('Failed to delete inventory');
                }
            })
            .catch(error => {
                console.log('Delete error', error);
                alert('Error deleting inventory');
            });
    };

    const deleteTransactions = () => {
        axios.delete('https://smarterreceipt.onrender.com/api/v1/inventory/delete_transactions', { withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    console.log('Delete successful');
                    alert('Transactions deleted successfully');
                } else {
                    console.log('Delete failed');
                    alert('Failed to delete transactions');
                }
            })
            .catch(error => {
                console.log('Delete error', error);
                alert('Error deleting transactions');
            });
    }
    

    useEffect(() => {
        const menu = document.querySelector('.menu');
        if (menu) {
            menu.style.backgroundColor = isLightMode ? '#ff6b6b' : '#34495e';
        }
    }, [isLightMode]);

    return (
        <div>
            <nav>
            <div className="box-text login-heading small"><span className="special-heading1">S</span>marter<span className="special-heading1">R</span>eceipt</div>
                <div className="burger" onClick={openMenu}>
                    <FontAwesomeIcon icon={faBars} size="3x" />
                </div>
            </nav>
            <div className="menu">
                <div className='toggler'>
                    <div className="close-button" onClick={closeMenu}>
                        <FontAwesomeIcon icon={faX} />
                    </div>
                    <ModeToggler isLightMode={isLightMode} toggleMode={toggleMode} />
                </div>
                
                <ul>
                    {location.pathname === '/login' ? (
                        <li onClick={handleLogin}>Login with Google</li>
                    ) : (
                        <>
                            <a href="/"><li>Home</li></a>
                            <a href="/account"><li>My Account</li></a>
                            <a href="/inventory"><li>My Inventory</li></a>
                            <a href="/new-order"><li>New Order</li></a>
                            <a href="/transactions"><li>My Transactions</li></a>
                            <li onClick={handleLogout}>Logout</li>
                            <li onClick={handleDeleteInventory}>Delete Inventory</li>
                            <li onClick={deleteTransactions}>Delete Transacrtions</li>
                        </>
                    )}
                </ul>
                <h2 className="login-heading white">Welcome to <span className="special-heading1">S</span>marter<span className="special-heading1">R</span>eceipt</h2>
            </div>
        </div>
    );
}

export default Nav;
