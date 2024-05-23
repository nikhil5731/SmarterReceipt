import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesChart = ({ isLightMode, monthlySales }) => {
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
            {
                label: 'Sales',
                data: monthlySales,
                backgroundColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)',
                    'rgba(255, 102, 64, 1)',
                    'rgba(83, 255, 64, 1)',
                    'rgba(255, 255, 64, 1)',
                    'rgba(64, 64, 255, 1)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)',
                    'rgba(255, 102, 64, 1)',
                    'rgba(83, 255, 64, 1)',
                    'rgba(255, 255, 64, 1)',
                    'rgba(64, 64, 255, 1)',
                ],
                borderWidth: 1,
                borderRadius: 8
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                labels: {
                    color: isLightMode ? '#000' : '#fff'
                }
            },
            title: {
                display: false,
                text: 'Monthly Sales Data',
                color: isLightMode ? '#000' : '#fff'
            },
        },
        scales: {
            x: {
                ticks: {
                    color: isLightMode ? '#000' : '#fff'
                },
                grid: {
                    color: isLightMode ? '#ccc' : '#555'
                }
            },
            y: {
                ticks: {
                    color: isLightMode ? '#000' : '#fff'
                },
                grid: {
                    color: isLightMode ? '#ccc' : '#555'
                }
            }
        }
    };

    return <div className="bar"><Bar data={data} options={options} height={125} /></div>;
};

export default SalesChart;
