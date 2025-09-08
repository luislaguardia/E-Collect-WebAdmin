import React, { useState, useEffect } from 'react';
import { FiUsers, FiCpu, FiTrash2, FiActivity, FiAlertTriangle } from 'react-icons/fi';
import adminService from '../services/adminService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Enhanced CategoryPieChart with modern styling
const CategoryPieChart = ({ chartData }) => {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: '# of Items',
        data: chartData.data,
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(240, 147, 251, 0.8)',
          'rgba(245, 87, 108, 0.8)',
          'rgba(79, 172, 254, 0.8)',
          'rgba(67, 233, 123, 0.8)',
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(240, 147, 251, 1)',
          'rgba(245, 87, 108, 1)',
          'rgba(79, 172, 254, 1)',
          'rgba(67, 233, 123, 1)',
        ],
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
          color: '#e2e8f0',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'E-Waste Distribution by Category',
        font: { 
          size: 18, 
          weight: '600' 
        },
        color: '#f8fafc',
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(148, 163, 184, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} items (${percentage}%)`;
          }
        }
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'nearest',
    },
  };

  return <Pie data={data} options={options} />;
};

const DashboardPage = () => {
  const [stats, setStats] = useState({ users: 0, kiosks: 0, ewaste: 0, kioskStatus: 'LOADING' });
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, summaryResponse] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getEwasteSummary()
        ]);

        setStats(statsResponse.data.data);

        const summaryData = summaryResponse.data.data;
        const formattedChartData = {
          labels: summaryData.map(item => item.category),
          data: summaryData.map(item => item.count),
        };
        setChartData(formattedChartData);

        setLastUpdated(new Date().toLocaleTimeString());

      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 4rem)',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        borderRadius: '12px',
        margin: '-2rem',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px', margin: 0 }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 4rem)',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ef4444',
        fontSize: '18px',
        borderRadius: '12px',
        margin: '-2rem',
        padding: '2rem'
      }}>
        {error}
      </div>
    );
  }

  // return (
  //   <div style={{
  //     background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
  //     borderRadius: '16px',
  //     margin: '-2rem',
  //     padding: '2rem',
  //     minHeight: 'calc(100vh - 4rem)',
  //     position: 'relative',
  //     overflow: 'hidden'
  //   }}>
// DashboardPage.js

return (
  <div style={{
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
    borderRadius: '16px',
    // margin: '-2rem',               // <--- REMOVED
    padding: '2rem',
    width: '100%',
    minHeight: '100%',                // <--- FIXED: Fills the container, not the viewport
    position: 'relative',
    overflow: 'hidden'
  }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '80px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '160px',
        right: '80px',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <header style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 12px 0'
          }}>
            E-Collect Dashboard
          </h1>
          <p style={{
            color: '#cbd5e1',
            fontSize: '16px',
            margin: '0 0 16px 0'
          }}>
            Real-time monitoring and analytics
          </p>
          {lastUpdated && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#10b981',
              fontSize: '14px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
              Live • Updated {lastUpdated}
            </div>
          )}
        </header>

        {/* Kiosk Status Banner */}
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          borderRadius: '12px',
          background: stats.kioskStatus === 'FULL' 
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(251, 146, 60, 0.2) 100%)'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
          border: stats.kioskStatus === 'FULL' 
            ? '1px solid rgba(239, 68, 68, 0.3)'
            : '1px solid rgba(16, 185, 129, 0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {stats.kioskStatus === 'FULL' ? (
                <FiAlertTriangle style={{ 
                  width: '28px', 
                  height: '28px', 
                  color: '#ef4444' 
                }} />
              ) : (
                <FiActivity style={{ 
                  width: '28px', 
                  height: '28px', 
                  color: '#10b981' 
                }} />
              )}
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'white',
                  margin: '0 0 4px 0'
                }}>
                  System Status
                </h2>
                <p style={{
                  color: '#cbd5e1',
                  margin: 0,
                  fontSize: '14px'
                }}>
                  All collection points
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '800',
                color: stats.kioskStatus === 'FULL' ? '#ef4444' : '#10b981',
                marginBottom: '4px'
              }}>
                {stats.kioskStatus}
              </div>
              {stats.kioskStatus === 'FULL' && (
                <p style={{
                  color: '#fca5a5',
                  fontSize: '12px',
                  margin: 0
                }}>
                  ⚠️ Collection required
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {[
            { 
              icon: FiUsers, 
              label: 'Users', 
              value: stats.users, 
              gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.1))'
            },
            { 
              icon: FiCpu, 
              label: 'Kiosks', 
              value: stats.kiosks, 
              gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1))'
            },
            { 
              icon: FiTrash2, 
              label: 'E-Waste', 
              value: stats.ewaste, 
              gradient: 'linear-gradient(135deg, #10b981, #059669)',
              bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))'
            }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                borderRadius: '12px',
                background: item.bgGradient,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0, 0, 0, 0.4)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: item.gradient,
                  boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.3)'
                }}>
                  <item.icon style={{ 
                    width: '20px', 
                    height: '20px', 
                    color: 'white' 
                  }} />
                </div>
              </div>
              <div>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '13px',
                  fontWeight: '500',
                  margin: '0 0 4px 0'
                }}>
                  {item.label}
                </p>
                <p style={{
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: '800',
                  margin: 0
                }}>
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
          padding: '24px'
        }}>
          {chartData && chartData.labels.length > 0 ? (
            <div style={{
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <CategoryPieChart chartData={chartData} />
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#64748b'
            }}>
              <FiTrash2 style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 12px',
                opacity: 0.5
              }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                No e-waste category data yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;