import React, { useState } from 'react';
import QRCode from 'qrcode.react';

const DynamicQRCodeGenerator = () => {
    const [amount, setAmount] = useState('');

    const handleChange = (event) => {
        setAmount(event.target.value);
    };

    const upiUrl = `upi://pay?pa=7404285999@paytm&pn=Aakarsh&am=${amount}&cu=INR`;

    return (
        <div>
            <h1>Dynamic UPI QR Code Generator</h1>
            <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="amount">Enter Amount (INR): </label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    min="1"
                    value={amount}
                    onChange={handleChange}
                    required
                />
            </form>
            <br />
            <div>
                {amount && <QRCode value={upiUrl} />}
            </div>
        </div>
    );
};

export default DynamicQRCodeGenerator;
