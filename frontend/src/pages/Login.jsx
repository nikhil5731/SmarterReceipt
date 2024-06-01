import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import Nav from '../components/Nav';
import { toggleMode as helperToggleMode } from '../helpers';

const Login = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    useEffect(() => {
        document.body.style.backgroundColor = isLightMode ? '#fff' : '#000';
        document.body.style.color = isLightMode ? '#000' : '#fff';
        const menu = document.querySelector('.menu');
        const loginBox = document.querySelector('.login-box');
        const loginButton = document.querySelector('.login-button');
        const loginHeading = document.querySelector('.login-heading');
        if (loginBox) {
            loginBox.style.backgroundColor = isLightMode ? '#000' : '#fff';
            loginBox.style.color = isLightMode ? '#fff' : '#000';
        }
        if (loginButton) {
            loginButton.style.backgroundColor = isLightMode ? '#fff' : '#000';
            loginButton.style.color = isLightMode ? '#000' : '#fff';
        }
        if (loginHeading) {
            loginHeading.style.color = isLightMode ? '#000' : '#fff';
        }
    }, [isLightMode]);

    useEffect(() => {
        console.log('Checking current user status');
        axios.get('https://smarterreceipt.onrender.com/api/v1/user/current_user', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    console.log('User is authenticated:', response.data);
                    setUser(response.data);
                    navigate('/');
                } else {
                    console.log('User is not authenticated');
                }
            })
            .catch(error => {
                console.log('Error checking authentication status', error);
            });
    }, [navigate]);

    const handleLogin = () => {
        console.log('Redirecting to Google login');
        window.location.href = 'https://smarterreceipt.onrender.com/api/v1/auth/google';
    };

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            <h2 className="box-text login-heading">Welcome to <span className="special-heading1">S</span>marter<span className="special-heading1">R</span>eceipt</h2>
            <div className="login-container">
                <div className="login-box">
                    <h2 className="box-text">Want to make your inventory management and receipts <span className="special-text">digital</span>?</h2>
                    <p>Log in with your Google account to get started</p>
                    <button onClick={handleLogin} className="login-button">Login with Google</button>
                </div>
            </div>
        </div>
    );
};

export default Login;
