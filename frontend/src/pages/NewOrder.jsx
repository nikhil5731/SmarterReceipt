import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import Quagga from 'quagga';
import Nav from '../components/Nav';
import '../css/NewOrder.css';
import { toggleMode as helperToggleMode } from '../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faX } from '@fortawesome/free-solid-svg-icons';

function NewOrder() {
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [resultMessage, setResultMessage] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    useEffect(() => {
        document.body.style.background = isLightMode ? "#fff" : "#000";
        document.body.style.color = isLightMode ? "#000" : "#fff";
    }, [isLightMode]);

    useEffect(() => {
        // increase the total price every time the products array changes
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
                    setResultMessage('No barcode detected');
                }
            });
        };
    };

    const fetchProductDetails = (barcode) => {
        axios.get(`http://localhost:8000/api/v1/inventory/product_details/${barcode}`, { withCredentials: true })
            .then(response => {
                const { name, image } = response.data;
                fetchProductPrice(name, barcode, image);
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
            });
    };

    const fetchProductPrice = (name, barcode, image) => {
        axios.get(`http://localhost:8000/api/v1/inventory/product_price/${name}`, { withCredentials: true })
            .then(response => {
                const price = response.data.price;
                const quantity = response.data.quantity;
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
            })
            .catch(error => {
                console.error('Error fetching product price:', error);
            });
    };

    const handleIncrement = (barcode, index) => {
        const name = products[index].name;
        axios.get(`http://localhost:8000/api/v1/inventory/product_price/${name}`, { withCredentials: true })
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
                        <button className="close-button" onClick={() => setIsCameraOpen(false)}><FontAwesomeIcon icon={faX} /></button>
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
                                            <FontAwesomeIcon icon={faMinus} />
                                        </button>
                                        <p>{product.quantity}</p>
                                        <button className={"quantity-button"} onClick={() => handleIncrement(product.barcode, index)}>
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={`total-price ${isLightMode ? 'light' : 'dark'}`}>
                    <h2>Total Price: ₹{totalPrice}</h2>
                </div>
            </div>
        </div>
    );
}

export default NewOrder;
