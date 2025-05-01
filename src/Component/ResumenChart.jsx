import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ResumenChart = ({ resumenData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!resumenData || !resumenData.años || resumenData.años.length === 0) {
      return;
    }

    // Cleanup any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Extract years for x-axis
    const years = resumenData.años.map(año => año.año);
    
    // Extract data for first y-axis (Total Proyectos) - now on the left
    const totalProyectos = resumenData.años.map(año => año.total_proyectos);
    
    // Extract data for second y-axis (Monto Total Comprometido) - now on the right
    const montoComprometido = resumenData.años.map(año => año.monto_total_comprometido);

    // Get CSS variables for chart colors
    const root = document.documentElement;
    const colorPrimary = getComputedStyle(root).getPropertyValue('--color-primary').trim() || '#611232'; // Wine color
    const colorSecondary = getComputedStyle(root).getPropertyValue('--color-secondary').trim() || '#A57F2C'; // Gold color

    // Create chart with two y-axes (positions swapped)
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Total Proyectos',
            data: totalProyectos,
            backgroundColor: colorSecondary,
            borderColor: colorSecondary,
            borderWidth: 1,
            yAxisID: 'y', // Now on the left
            order: 1
          },
          {
            label: 'Monto Total Comprometido',
            data: montoComprometido,
            backgroundColor: colorPrimary,
            borderColor: colorPrimary,
            borderWidth: 1,
            type: 'bar',
            yAxisID: 'y1', // Now on the right
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Total Proyectos vs Monto Total Comprometido',
            color: colorPrimary,
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.datasetIndex === 1) { // Now index 1 is Monto Total Comprometido
                  // Format monetary values
                  label += new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    minimumFractionDigits: 2
                  }).format(context.parsed.y);
                } else {
                  // Format total projects as integers
                  label += context.parsed.y.toLocaleString();
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Años',
              color: colorPrimary,
              font: {
                weight: 'bold'
              }
            },
            ticks: {
              color: colorPrimary
            },
            grid: {
              display: true,
              drawBorder: true,
              color: '#E0E0E0'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Total Proyectos', // Now Total Proyectos on the left
              color: colorSecondary,
              font: {
                weight: 'bold'
              }
            },
            ticks: {
              // Format numbers as integers
              callback: function(value) {
                return value.toLocaleString();
              },
              color: colorSecondary
            },
            grid: {
              color: '#E0E0E0'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Monto Total Comprometido', // Now Monto Total Comprometido on the right
              color: colorPrimary,
              font: {
                weight: 'bold'
              }
            },
            ticks: {
              // Format monetary values
              callback: function(value) {
                return new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  notation: 'compact',
                  compactDisplay: 'short'
                }).format(value);
              },
              color: colorPrimary
            },
            grid: {
              drawOnChartArea: false // Only show grid lines for the primary y-axis
            }
          }
        }
      }
    });

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [resumenData]);

  return (
    <div className="resumen-chart-container">
      <div className="resumen-chart-wrapper" style={{ height: '400px', marginBottom: '30px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default ResumenChart;