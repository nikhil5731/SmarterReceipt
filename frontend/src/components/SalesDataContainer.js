import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SalesChart from './SalesChart';

const SalesDataContainer = ({ userId, isLightMode }) => {
    const [monthlySales, setMonthlySales] = useState([]);

    useEffect(() => {
        const fetchMonthlySales = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/user/${userId}/monthly-sales`, { withCredentials: true });
                setMonthlySales(response.data);
            } catch (error) {
                console.error('Error fetching monthly sales:', error);
            }
        };

        fetchMonthlySales();
    }, [userId]);

    return (
        <div>
            <SalesChart isLightMode={isLightMode} monthlySales={monthlySales} />
        </div>
    );
};

export default SalesDataContainer;
