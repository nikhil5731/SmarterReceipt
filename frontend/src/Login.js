import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Checking current user status');
        axios.get('http://localhost:8000/api/current_user', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    console.log('User is authenticated:', response.data);
                    setUser(response.data);
                    navigate('/'); // Redirect to home if already logged in
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
        window.location.href = 'http://localhost:8000/auth/google'; // Redirect to Google login on server
    };

    return (
        <div>
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
