import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Inventory.css';
import Nav from '../components/Nav';
import { toggleMode as helperToggleMode } from '../helpers';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faX } from '@fortawesome/free-solid-svg-icons';

function Inventory() {
    const [user, setUser] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    const [showEditPopup, setShowEditPopup] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const navigate = useNavigate();

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    useEffect(() => {
        document.body.style.background = isLightMode ? "#fff" : "#000";
        document.body.style.color = isLightMode ? "#000" : "#fff";
    }, [isLightMode]);

    useEffect(() => {
        console.log('Fetching current user');
        axios.get('http://localhost:8000/api/v1/user/current_user', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    console.log('User is authenticated:', response.data);
                    setUser(response.data);
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
    }, [navigate]);

    const fetchInventory = (inventoryId) => {
        axios.get(`http://localhost:8000/api/v1/inventory/get/${inventoryId}`, { withCredentials: true })
            .then(response => {
                setInventory(response.data.products);
            })
            .catch(error => {
                console.error('Error fetching inventory:', error);
            });
    };

    const handleEditClick = (index, product) => {
        setCurrentItem(product);
        setCurrentIndex(index);
        setShowEditPopup(true);
    };

    const handleSaveClick = () => {
        axios.post('http://localhost:8000/api/v1/inventory/update', {
            userId: user._id,
            index: currentIndex,
            name: currentItem.name,
            price: currentItem.price,
            quantity: currentItem.quantity,
            image: currentItem.image
        }, { withCredentials: true })
            .then(response => {
                console.log('Item updated:', response.data);
                setShowEditPopup(false);
                fetchInventory(user.InventoryId);
            })
            .catch(error => {
                console.log('Error updating item', error);
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem({
            ...currentItem,
            [name]: value
        });
    };

    if (!user) {
        return null;
    }

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            <div className="inventory-container">
                <h1>Inventory</h1>
                <div className="inventory-list">
                    {inventory.map((product, index) => (
                        <div key={product.name} className={`product-box ${isLightMode ? 'light' : 'dark'}`}>
                            <div className="product-data">
                                <img src={product.image} height={"80em"} width={"100em"} alt={product.name} />
                                <div className='name-image'>
                                    <h4>{product.name.length >= 30 ? product.name.substring(0, 27) + "..." : product.name}</h4>
                                    <div className="flex">
                                        <h4 className="red quant">{product.quantity} left</h4>
                                        <button className={`inv-edit-btn ${isLightMode ? 'light' : 'dark'}`} onClick={() => handleEditClick(index, product)}><FontAwesomeIcon icon={faPen}/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showEditPopup && (
                <div className="inv-modal">
                    <div className={`inv-modal-content ${isLightMode ? 'light' : 'dark'}`}>
                        <div className="inv-modal-header">
                            <h2>Edit Item</h2>
                            <button className="inv-modal-close" onClick={() => setShowEditPopup(false)}><FontAwesomeIcon icon={faX}/></button>
                        </div>
                        <div className="inv-modal-body">
                            <label htmlFor="inv-name">Name</label>
                            <input type="text" id="inv-name" name="name" value={currentItem.name} onChange={handleInputChange} />
                            <label htmlFor="inv-price">Price</label>
                            <input type="number" id="inv-price" name="price" value={currentItem.price} onChange={handleInputChange} />
                            <label htmlFor="inv-quantity">Quantity</label>
                            <input type="number" id="inv-quantity" name="quantity" value={currentItem.quantity} onChange={handleInputChange} />
                        </div>
                        <div className="inv-modal-footer">
                            <button className={`inv-save-btn ${isLightMode ? 'light' : 'dark'}`} onClick={handleSaveClick}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inventory;
