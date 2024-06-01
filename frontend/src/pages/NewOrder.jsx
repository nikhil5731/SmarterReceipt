import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import Quagga from 'quagga';
import Nav from '../components/Nav';
import '../css/NewOrder.css';
import { toggleMode as helperToggleMode } from '../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faX, faKeyboard, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QRCode from 'qrcode.react';

function NewOrder() {
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [resultMessage, setResultMessage] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [manualBarcode, setManualBarcode] = useState('');
    const [email, setEmail] = useState('');
    const [shopName, setShopName] = useState('');
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [showQR, setShowQR] = useState(false);
    const [qrLink, setQRLink] = useState('');
    const [showEmailPrompt, setShowEmailPrompt] = useState(false);

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    useEffect(() => {
        document.body.style.background = isLightMode ? "#fff" : "#000";
        document.body.style.color = isLightMode ? "#000" : "#fff";
    }, [isLightMode]);

    useEffect(() => {
        setTotalPrice(products.reduce((total, product) => total + product.price * product.quantity, 0));
    }, [products]);

    useEffect(() => {
        if (products.length === 0) {
            return;
        }
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = 'Your cart will be cleared if you leave this page. Are you sure?';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        console.log(products);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [products]);

    const handlePlusClick = () => {
        setIsCameraOpen(true);
        setResultMessage('');
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
                    fetchProductDetails(barcode);
                } else {
                    toast.error("No barcode detected");
                    setResultMessage('No barcode detected');
                }
            });
        };
    };

    const fetchProductDetails = (barcode) => {
        axios.get(`https://smarterreceipt.onrender.com/api/v1/inventory/product_details/${barcode}`, { withCredentials: true })
            .then(response => {
                const { name, image } = response.data;
                fetchProductPrice(name, barcode, image);
            })
            .catch(error => {
                toast.error("Error fetching product details")
                console.error('Error fetching product details:', error);
            });
    };

    const fetchProductPrice = (name, barcode, image) => {
        axios.get(`https://smarterreceipt.onrender.com/api/v1/inventory/product_price/${name}`, { withCredentials: true })
            .then(response => {
                const price = response.data.price;
                const quantity = response.data.quantity;
                if (quantity === 0) {
                    toast.error('Product out of stock');
                    return;
                }
                setProducts(prevProducts => {
                    const existingProductIndex = prevProducts.findIndex(product => product.barcode === barcode);
                    if (existingProductIndex !== -1) {
                        return prevProducts.map((product, index) =>
                            index === existingProductIndex
                                ? { ...product, quantity: product.quantity + 1 > quantity ? quantity : product.quantity + 1 }
                                : product
                        );
                    } else {
                        const newProduct = { barcode, name, image, price, quantity: 1 };
                        return [...prevProducts, newProduct];
                    }
                });
                setIsCameraOpen(false);
                setIsManualEntryOpen(false);
            })
            .catch(error => {
                console.error('Error fetching product price:', error);
            });
    };

    const handleIncrement = (barcode, index) => {
        const name = products[index].name;
        axios.get(`https://smarterreceipt.onrender.com/api/v1/inventory/product_price/${name}`, { withCredentials: true })
            .then(response => {
                const maxQuantity = response.data.quantity;
                setProducts(prevProducts =>
                    prevProducts.map(product =>
                        product.barcode === barcode && product.quantity < maxQuantity
                            ? { ...product, quantity: product.quantity + 1 }
                            : product
                    )
                );
            })
            .catch(error => {
                console.error('Error fetching product price:', error);
            });
    };

    const handleDecrement = (barcode, index) => {
        setProducts(prevProducts =>
            prevProducts
                .map(product =>
                    product.barcode === barcode
                        ? { ...product, quantity: product.quantity - 1 }
                        : product
                )
                .filter(product => product.quantity > 0)
        );
    };

    const submit = () => {
        axios.get('https://smarterreceipt.onrender.com/api/v1/user/current_user', { withCredentials: true })
            .then(userResponse => {
                const shopName = userResponse.data.ShopName;
                const upiId = userResponse.data.upiId;
                const ownerName = userResponse.data.OwnerFirstName;
                const upiLink = `upi://pay?pa=${upiId}&pn=${ownerName}&am=${totalPrice}&cu=INR`;
                setQRLink(upiLink);
                setShowQR(true);
            })
            .catch(error => {
                console.error('Error fetching user:', error);
                toast.error('Error fetching user');
            });
    }

    const close = () => {
        setIsCameraOpen(false);
        setIsManualEntryOpen(false);
    };

    const handleManualEntryClick = () => {
        setIsManualEntryOpen(true);
        setIsCameraOpen(false);
    };

    const handleManualEntrySubmit = () => {
        fetchProductDetails(manualBarcode);
        setManualBarcode('');
    };

    const sendEmail = (valid) => {
        setShowQR(false);
        axios.put('https://smarterreceipt.onrender.com/api/v1/inventory/update_inventory', { products, totalPrice }, { withCredentials: true })
                    .then(response => {
                        const orderNumber = response.data.orderNumber;
                        const link = `https://smartereceipt.netlify.app/${shopName}/${orderNumber}`;
                        setProducts([]);
                        setTotalPrice(0);
                        toast.success('Order placed successfully and link sent');
                        setShowEmailPrompt(false);
                        if (valid) {
                            axios.post('https://smarterreceipt.onrender.com/api/v1/send_link/send_link', { email, link })
                            .then(() => {
                                setProducts([]);
                                setTotalPrice(0);
                                toast.success('Order placed successfully and link sent');
                                setShowEmailPrompt(false);
                            })
                            .catch(error => {
                                console.error('Error sending link:', error);
                                toast.error('Error sending link');
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error placing order:', error);
                        toast.error('Error placing order');
                    });
    };

    const handleQuantityChange = (e, barcode, index) => {
        const newQuantity = parseInt(e.target.textContent, 10);
        if (isNaN(newQuantity) || newQuantity <= 0) {
            e.target.textContent = products[index].quantity; // Revert to previous valid value
            return;
        }
        const name = products[index].name;
        axios.get(`https://smarterreceipt.onrender.com/api/v1/inventory/product_price/${name}`, { withCredentials: true })
            .then(response => {
                const maxQuantity = response.data.quantity;
                if (newQuantity <= maxQuantity) {
                    setProducts(prevProducts =>
                        prevProducts.map(product =>
                            product.barcode === barcode
                                ? { ...product, quantity: newQuantity }
                                : product
                        )
                    );
                } else {
                    e.target.textContent = products[index].quantity; // Revert to previous valid value
                    toast.error(`Maximum quantity for this product is ${maxQuantity}`);
                }
            })
            .catch(error => {
                console.error('Error fetching product price:', error);
                e.target.textContent = products[index].quantity; // Revert to previous valid value
            });
    };

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            <div className="order-container">
                <div className="order-header">
                    <h1>New Order</h1>
                    <button className="plus-button" onClick={handlePlusClick}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
                {isCameraOpen && (
                    <div className="camera-container">
                        <div className="cam-flex">
                            <button className="close-button cam-close" onClick={close}><FontAwesomeIcon icon={faX} style={{"margin-left" : "2em"}}/></button>
                            <button className="manual-entry-button open-popup" onClick={handleManualEntryClick}><FontAwesomeIcon icon={faKeyboard} /></button>
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
                {resultMessage && <div id="result">{resultMessage}</div>}
                <div className="products-list">
                    {products.map((product, index) => (
                        <div key={index} className="item-details">
                            {product.image && <img src={product.image} alt={product.name} height={"100em"} />}
                            <div className="item-info">
                                <h2>{product.name}</h2>
                                <div className="price-quantity">
                                    <p>₹{product.price}</p>
                                    <div className="quantity-control">
                                        <button className={"quantity-button"} onClick={() => handleDecrement(product.barcode, index)}>
                                            {product.quantity !== 1 ? <FontAwesomeIcon icon={faMinus} /> : <FontAwesomeIcon icon={faTrash} />}
                                        </button>
                                        <span
                                            contentEditable="true"
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleQuantityChange(e, product.barcode, index)}
                                        >
                                            {product.quantity}
                                        </span>
                                        <button className={"quantity-button"} onClick={() => handleIncrement(product.barcode, index)}>
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {showQR && (
                        <div className="backdrop">
                            <div className="manual-entry-popup qr-code-modal">
                                <QRCode value={qrLink} size={300} />
                                <h3 style={{ textAlign: "center", color: "gray" }}>
                                    Please confirm that the payment has been made through this QR code or cash
                                </h3>
                                <button className="confirm" onClick={() => setShowEmailPrompt(true)}>Confirm</button>
                            </div>
                        </div>
                    )}
                    {showEmailPrompt && (
                        <div className="backdrop">
                            <div className="manual-entry-popup qr-code-modal">
                                <button className="close-popup" onClick={()=>sendEmail(false)}><FontAwesomeIcon icon={faX} /></button>
                                <h3 style={{ textAlign: "center", color: "gray" , marginTop: "2em"}}>
                                    Please enter the email address to send the link to
                                </h3>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                />
                                <button className="confirm" onClick={()=>sendEmail(true)}>Send</button>
                            </div>
                        </div>
                    )}

                </div>
                <div className={`total-price ${isLightMode ? 'light' : 'dark'}`}>
                    <h2>Total Price: ₹{totalPrice}</h2>
                    <button className="checkout-button" onClick={submit}>Checkout</button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default NewOrder;
