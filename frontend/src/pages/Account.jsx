import Nav from "../components/Nav";
import { toggleMode as helperToggleMode } from '../helpers';
import { useState, useEffect } from "react";
import axios from "axios";
import '../css/Account.css';

function Account() {
    const [user, setUser] = useState(null);
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [shopName, setShopName] = useState('');

    useEffect(() => {
        document.body.style.background = isLightMode ? "#fff" : "#000";
        document.body.style.color = isLightMode ? "#000" : "#fff";
    }, [isLightMode]);

    useEffect(() => {
        console.log('Checking current user status');
        axios.get('http://localhost:8000/api/v1/user/current_user', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    console.log('User is authenticated:', response.data);
                    setUser(response.data);
                    setFirstName(response.data.OwnerFirstName);
                    setLastName(response.data.OwnerLastName);
                    setShopName(response.data.ShopName);
                } else {
                    console.log('User is not authenticated');
                }
            })
            .catch(error => {
                console.log('Error checking authentication status', error);
            });
    }, []);

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const updatedUser = {
                OwnerFirstName: firstName,
                OwnerLastName: lastName,
                ShopName: shopName,
            };
            const response = await axios.post('http://localhost:8000/api/v1/user/update', updatedUser, { withCredentials: true });
            setUser(response.data);
            alert('User information updated successfully');
        } catch (error) {
            console.log('Error updating user information:', error);
            alert('Failed to update user information');
        }
    };

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            <div className="acc-container">
                <div className={`account-info ${isLightMode ? 'light' : 'dark'}`}>
                    <h1>Account</h1>
                    <p>Here you can view and edit your account information.</p>
                    <form className="account-form" onSubmit={handleSubmit}>
                        <label htmlFor="firstName">First Name</label>
                        <input
                            className={`account-input ${isLightMode ? 'light' : 'dark'}`}
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder={user?.OwnerFirstName}
                        />
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            className={`account-input ${isLightMode ? 'light' : 'dark'}`}
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder={user?.OwnerLastName}
                        />
                        <label htmlFor="shop">Shop Name</label>
                        <input
                            className={`account-input ${isLightMode ? 'light' : 'dark'}`}
                            type="text"
                            id="shop"
                            name="shop"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            placeholder={user?.ShopName}
                        />
                        <button type="submit" className="edit-button">Save</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Account;
