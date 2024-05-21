import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Nav from './Nav';
import { toggleMode as helperToggleMode } from './helpers';

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
        if (menu) {
            menu.style.backgroundColor = isLightMode ? '#000' : '#fff';
            menu.style.color = isLightMode ? '#fff' : '#000';
        }
    }, [isLightMode]);

    useEffect(() => {
        console.log('Checking current user status');
        axios.get('http://localhost:8000/api/current_user', { withCredentials: true })
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
        window.location.href = 'http://localhost:8000/auth/google';
    };

    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
            {!user ? (
                <div>
                    <h2>Login</h2>
                    <button onClick={handleLogin}>Login with Google</button>
                </div>
            ) : (
                <div>
                    <h2>Welcome, {user.username}</h2>
                </div>
            )}
        </div>
    );
};

export default Login;
