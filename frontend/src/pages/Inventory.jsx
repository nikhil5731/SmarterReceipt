import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../css/Inventory.css';
import Nav from '../components/Nav';
import { toggleMode as helperToggleMode } from '../helpers';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faX, faSearch, faPlus, faKeyboard } from '@fortawesome/free-solid-svg-icons';
import Webcam from 'react-webcam';
import Quagga from 'quagga';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
    const [deletedItem, setDeletedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState('');
    const [manualBarcode, setManualBarcode] = useState('');
    const [scannedPopup, setScannedPopup] = useState(false);
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [productName, setProductName] = useState('');
    const [image, setProductImage] = useState('');
    const [fetched, setFetched] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    useEffect(() => {
        document.body.style.background = isLightMode ? "#fff" : "#000";
        document.body.style.color = isLightMode ? "#000" : "#fff";
    }, [isLightMode]);

    useEffect(() => {
        axios.get('https://smarterreceipt.onrender.com/api/v1/user/current_user', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    setUser(response.data);
                    fetchInventory(response.data.InventoryId);
                } else {
                    navigate('/login');
                }
            })
            .catch(error => {
                navigate('/login');
            });
    }, [navigate]);

    const fetchInventory = (inventoryId) => {
        axios.get(`https://smarterreceipt.onrender.com/api/v1/inventory/get/${inventoryId}`, { withCredentials: true })
            .then(response => {
                setInventory(response.data.products);
            })
            .catch(error => {
                toast.error('Error fetching inventory');
                console.error('Error fetching inventory:', error);
            });
    };

    const handleEditClick = (index, product) => {
        setCurrentItem(product);
        setCurrentIndex(index);
        setShowEditPopup(true);
    };

    const handleSaveClick = () => {
        axios.post('https://smarterreceipt.onrender.com/api/v1/inventory/update', {
            userId: user._id,
            index: currentIndex,
            name: currentItem.name,
            price: currentItem.price,
            quantity: currentItem.quantity,
            image: currentItem.image
        }, { withCredentials: true })
            .then(response => {
                setShowEditPopup(false);
                fetchInventory(user.InventoryId);
            })
            .catch(error => {
                toast.error('Error updating item');
                console.log('Error updating item', error);
            });
    };

    const handleCaptureClick = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        decodeBarcode(imageSrc);
    };

    const decodeBarcode = (imageSrc) => {
        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            Quagga.decodeSingle({
                src: img.src,
                numOfWorkers: 0,
                inputStream: {
                    size: 800
                },
                decoder: {
                    readers: ["ean_reader", "upc_reader"]
                },
                locator: {
                    patchSize: "medium",
                    halfSample: true
                }
            }, (result) => {
                if (result && result.codeResult) {
                    const barcode = result.codeResult.code;
                    setResultMessage('Barcode: ' + barcode);
                    setScannedBarcode(barcode);
                    fetchProductDetails(barcode);
                } else {
                    setResultMessage('No barcode detected');
                    toast.error('No barcode detected');
                }
            });
        };
    };

    const fetchProductDetails = (barcode) => {
        setFetched(false); // Reset fetched state to allow fetching new product details
        axios.get(`https://smarterreceipt.onrender.com/api/v1/inventory/product_details/${barcode}`, { withCredentials: true })
            .then(response => {
                const { name, image } = response.data;
                setProductName(name);
                setProductImage(image);
                setFetched(true);
                setScannedPopup(true);
                setIsCameraOpen(false); // Close camera once the product details are fetched
            })
            .catch(error => {
                toast.error('Product not found');
                console.error('Error fetching product details:', error);
            });
    };

    const close = () => {
        setIsCameraOpen(false);
        setIsManualEntryOpen(false);
        setScannedPopup(false);
        setQuantity('');
        setPrice('');
        setProductName('');
        setProductImage('');
        setScannedBarcode('');
        setManualBarcode('');
    };

    const handleManualEntryClick = () => {
        setIsManualEntryOpen(true);
        setIsCameraOpen(false);
    };

    const handleScannedEntrySubmit = () => {
        const product = {
            name: productName,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            image: image
        };
        axios.post('https://smarterreceipt.onrender.com/api/v1/inventory/addProduct', { product }, { withCredentials: true })
            .then(response => {
                fetchInventory(user.InventoryId);
                close();
            })
            .catch(error => {
                toast.error('Error updating inventory');
                console.error('Error updating inventory:', error);
            });
    };

    const handleManualEntrySubmit = () => {
        fetchProductDetails(manualBarcode);
        setIsManualEntryOpen(false);
    };

    const handleDeleteClick = () => {
        const itemToDelete = inventory[currentIndex];
        setDeletedItem({ item: itemToDelete, index: currentIndex });

        axios.delete('https://smarterreceipt.onrender.com/api/v1/inventory/delete', {
            data: {
                userId: user._id,
                index: currentIndex
            },
            withCredentials: true
        })
            .then(response => {
                setShowEditPopup(false);
                fetchInventory(user.InventoryId);
                setShowNotification(true);
                setTimeout(() => {
                    setShowNotification(false);
                }, 5000);
            })
            .catch(error => {
                toast.error('Error deleting item');
                console.log('Error deleting item', error);
            });
    };

    const handleUndoClick = () => {
        if (deletedItem) {
            axios.post('https://smarterreceipt.onrender.com/api/v1/inventory/addProduct', {
                userId: user._id,
                product: deletedItem.item
            }, { withCredentials: true })
                .then(response => {
                    setDeletedItem(null);
                    fetchInventory(user.InventoryId);
                })
                .catch(error => {
                    toast.error('Error adding item');
                    console.log('Error adding item', error);
                });
        }
        setShowNotification(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem({
            ...currentItem,
            [name]: value
        });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchIconClick = () => {
        setIsSearchActive(true);
    };

    const handleSearchBlur = () => {
        setIsSearchActive(false);
    };

    const filteredInventory = inventory.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) {
        return null;
    }

    const handlePlusClick = () => {
        setIsCameraOpen(true);
        setResultMessage('');
    };

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            <div className="inventory-container">
                <div className="inv-header">
                    <h1>Inventory</h1>
                    {isSearchActive ? (
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onBlur={handleSearchBlur}
                            autoFocus
                            className={`search-input ${isLightMode ? 'light' : 'dark'}`}
                        />
                    ) : (
                        <FontAwesomeIcon icon={faSearch} onClick={handleSearchIconClick} style={{ fontSize: "24px" }} />
                    )}
                </div>
                <button onClick={handlePlusClick} className="plus-button"><FontAwesomeIcon icon={faPlus} /></button>
                {isCameraOpen && (
                    <div className="camera-container">
                        <div className="cam-flex">
                            <button className="close-button cam-close" onClick={close}><FontAwesomeIcon icon={faX} style={{ marginLeft: "2em" }} /></button>
                            <button className="manual-entry-button open-popup" onClick={handleManualEntryClick}>
                                <FontAwesomeIcon icon={faKeyboard} /></button>
                        </div>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "environment" }}
                        />
                        <button className="capture-button" onClick={handleCaptureClick}>Capture Photo</button>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                    </div>
                )}
                {scannedPopup && (
                    <div className="manual-entry-popup">
                        <button className="close-popup" onClick={close}><FontAwesomeIcon icon={faX} /></button>
                        <h1 className={`name ${isLightMode ? 'light' : 'dark'}`}>{productName}</h1>
                        <img src={image} alt="product image" />
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter Price"
                            style={{ marginTop: "3em" }}
                        />
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Enter Quantity"
                        />
                        <button onClick={handleScannedEntrySubmit}>Submit</button>
                    </div>
                )}
                {isManualEntryOpen && (
                    <div className="manual-entry-popup">
                        <button className="close-popup" onClick={close}><FontAwesomeIcon icon={faX} /></button>
                        <input
                            type="text"
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            placeholder="Enter Barcode"
                            style={{ marginTop: "3em" }}
                        />
                        <button onClick={handleManualEntrySubmit}>Submit</button>
                    </div>
                )}
                <div className="inventory-list">
                    {filteredInventory.map((product, index) => (
                        <div key={product.name} className={`product-box ${isLightMode ? 'light' : 'dark'}`}>
                            <div className="product-data">
                                <img src={product.image} height={"100em"} width={"100em"} alt={product.name} />
                                <div className='name-image'>
                                    <h4>{product.name.length >= 30 ? product.name.substring(0, 27) + "..." : product.name}</h4>
                                    <div className="flex">
                                        <h4 className="red quant">{product.quantity} left</h4>
                                        <button className={`inv-edit-btn ${isLightMode ? 'light' : 'dark'}`}
                                            onClick={() => handleEditClick(index, product)}><FontAwesomeIcon
                                                icon={faPen} /></button>
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
                            <button className="inv-modal-close" onClick={() => setShowEditPopup(false)}><FontAwesomeIcon icon={faX} /></button>
                        </div>
                        <div className="inv-modal-body">
                            <label htmlFor="inv-price">Price</label>
                            <input type="number" id="inv-price" name="price" value={currentItem.price}
                                onChange={handleInputChange} />
                            <label htmlFor="inv-quantity">Quantity</label>
                            <input type="number" id="inv-quantity" name="quantity" value={currentItem.quantity}
                                onChange={handleInputChange} />
                        </div>
                        <div className="inv-modal-footer">
                            <button className={`inv-save-btn ${isLightMode ? 'light' : 'dark'}`}
                                onClick={handleSaveClick}>Save
                            </button>
                            <button className={`inv-delete-btn ${isLightMode ? 'light' : 'dark'}`}
                                onClick={handleDeleteClick}>Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showNotification && (
                <div className="notification">
                    <p>Item deleted successfully</p>
                    <button onClick={handleUndoClick}>Undo</button>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}

export default Inventory;
