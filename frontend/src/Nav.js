import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faX } from '@fortawesome/free-solid-svg-icons';
import ModeToggler from './ModeToggler';
import { openMenu, closeMenu } from './helpers';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Nav({ isLightMode, toggleMode }) {
    const navigate = useNavigate();

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

    const handleDeleteInventory = () => {
        if (window.confirm('Are you sure you want to delete your entire inventory?')) {
            axios.delete('http://localhost:8000/api/delete_inventory', { withCredentials: true })
                .then(response => {
                    if (response.data.success) {
                        console.log('Inventory deleted successfully');
                        // Optionally navigate or refresh the page to show the updated state
                    } else {
                        console.log('Failed to delete inventory');
                    }
                })
                .catch(error => {
                    console.log('Error deleting inventory', error);
                });
        }
    };

    useEffect(() => {
        const menu = document.querySelector('.menu');
        if (menu) {
            menu.style.backgroundColor = isLightMode ? '#000' : '#fff';
            menu.style.color = isLightMode ? '#fff' : '#000';
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
                <ul>
                    <li onClick={toggleMode}>Toggle Mode</li>
                    <li onClick={handleDeleteInventory}>Delete Inventory</li>
                    <li onClick={handleLogout}>Logout</li>
                </ul>
                <div className="close-button" onClick={closeMenu}>
                    <FontAwesomeIcon icon={faX} />
                </div>
            </div>
        </div>
    );
}

export default Nav;
