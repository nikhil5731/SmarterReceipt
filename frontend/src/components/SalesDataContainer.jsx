import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SalesChart from './SalesChart';

const SalesDataContainer = ({ userId, isLightMode }) => {
    const [monthlySales, setMonthlySales] = useState([]);

    useEffect(() => {
        const fetchMonthlySales = async () => {
            try {
                const response = await axios.get(`https://smarterreceipt.onrender.com/api/v1/inventory/monthly-sales/${userId}`, { withCredentials: true });
                setMonthlySales(response.data.monthlySales);
                console.log(monthlySales); // Ensure you're setting the correct data
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
