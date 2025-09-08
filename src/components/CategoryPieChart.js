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
          '#4facfe',
          '#00c9a7',
          '#ffb347',
          '#ff6a6a',
          '#6f42c1',
          '#20c997',
        ],
        borderColor: ['#fff'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'E-Waste Distribution by Category',
        font: { size: 18, weight: 'bold' },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default CategoryPieChart;
