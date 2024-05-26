import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import Quagga from 'quagga';
import Nav from '../components/Nav';
import '../css/NewOrder.css';
import { toggleMode as helperToggleMode } from '../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function NewOrder() {
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [productName, setProductName] = useState('');
    const [productImage, setProductImage] = useState('');
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [resultMessage, setResultMessage] = useState('Scanning...');

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    useEffect(() => {
        document.body.style.background = isLightMode ? "#fff" : "#000";
        document.body.style.color = isLightMode ? "#000" : "#fff";
    }, [isLightMode]);

    useEffect(() => {
        if (barcode) {
            axios.get(`http://localhost:8000/api/v1/inventory/product_details/${barcode}`, { withCredentials: true })
                .then(response => {
                    const { name, image } = response.data;
                    setProductName(name);
                    setProductImage(image);
                    setIsCameraOpen(false); // Close camera once the product details are fetched
                })
                .catch(error => {
                    console.error('Error fetching product details:', error);
                });
        }
    }, [barcode]);

    const handlePlusClick = () => {
        setIsCameraOpen(true);
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
                    patchSize: "medium", // x-small, small, medium, large, x-large
                    halfSample: true
                }
            }, (result) => {
                if (result && result.codeResult) {
                    setBarcode(result.codeResult.code);
                    setResultMessage('Barcode: ' + result.codeResult.code);
                } else {
                    setResultMessage('No barcode detected');
                }
            });
        };
    };

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            <div className="order-container">
                <button className="plus-button" onClick={handlePlusClick}>
                    <FontAwesomeIcon icon={faPlus} />
                </button>
                {isCameraOpen && (
                    <div className="camera-container">
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
                <div id="result">{resultMessage}</div>
                {productName && (
                    <div className="product-details">
                        <h2>{productName}</h2>
                        {productImage && <img src={productImage} alt={productName} />}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NewOrder;
