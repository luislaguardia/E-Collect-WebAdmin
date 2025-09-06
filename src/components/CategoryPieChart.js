import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryPieChart = ({ chartData }) => {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: '# of Items',
        data: chartData.data,
        backgroundColor: [
          'rgba(148, 200, 61, 0.8)',
          'rgba(86, 171, 47, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(23, 162, 184, 0.8)',
          'rgba(108, 117, 125, 0.8)',
          'rgba(220, 53, 69, 0.8)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'E-Waste Distribution by Category',
        font: {
          size: 18,
        }
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default CategoryPieChart;