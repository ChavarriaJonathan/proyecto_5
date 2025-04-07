import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTable } from 'react-table';
import Chart from 'chart.js/auto';
import '@fontsource/noto-sans';
import '@fontsource/noto-sans/700.css';
import './Home.css';

const Home = () => {
  // Colores del tema
  const primaryColor = '#611232';
  const secondaryColor = '#A57F2C';
  
  // Referencia para la sección de gráfico
  const chartSectionRef = useRef(null);
  
  // Datos de la tabla izquierda
  const dataLeft = useMemo(
    () => [
      {
        concepto: 'PRESUPUESTO F003',
        '2021': 1490724569,
        '2022': 1649294377,
        '2023': 1396704734,
        '2024': 1377570847,
        '2025': 1451972592
      },
      {
        concepto: '% DAIHC VS F003',
        '2021': 32,
        '2022': 35,
        '2023': 41,
        '2024': 51,
        '2025': 51
      },
      {
        concepto: 'MONTO MINIST DAIHC',
        '2021': 474758860,
        '2022': 576892906,
        '2023': 572103632,
        '2024': 704273246,
        '2025': 742310607
      },
      {
        concepto: 'Incremento por año (%)',
        '2021': '',
        '2022': 22,
        '2023': -1,
        '2024': 23,
        '2025': 5.40094
      },
      {
        concepto: 'Promedio incremento (%)',
        '2021': '',
        '2022': '',
        '2023': '',
        '2024': '',
        '2025': 15
      }
    ],
    []
  );

  // Datos de la tabla derecha (nueva tabla)
  const dataRight = useMemo(
    () => [
      {
        concepto: 'IMPORTE MINISTRADO DAIHC',
        '2021': '$29,000-$9,998,000',
        '2022': '$10,000-$10,859,000',
        '2023': '$30,000-$8,242,000',
        '2024': '$30,000-$5,500,000',
        '2025': '$26,000-$6,000,000',
        'TOTAL': 'Σ IMPORTES / Σ PROYECTOS'
      },
      {
        concepto: '$',
        '2021': 474758860,
        '2022': 576892906,
        '2023': 572103632,
        '2024': 704273246,
        '2025': 518613758,
        'TOTAL': 2846642398
      },
      {
        concepto: 'NUM. PROYECTOS',
        '2021': 264,
        '2022': 871,
        '2023': 989,
        '2024': 1280,
        '2025': 1155,
        'TOTAL': 4559
      },
      {
        concepto: 'COSTO APROX. POR PROYECTO',
        '2021': 1798329,
        '2022': 662334,
        '2023': 578467,
        '2024': 550213,
        '2025': 449016,
        'TOTAL': 624401
      },
      {
        concepto: 'COSTO PROMEDIO POR PROYECTO',
        '2021': 807672,
        '2022': '',
        '2023': '',
        '2024': '',
        '2025': '',
        'TOTAL': ''
      }
    ],
    []
  );

  // Definir las columnas tabla izquierda
  const columnsLeft = useMemo(
    () => [
      {
        Header: 'AÑO',
        accessor: 'concepto',
      },
      {
        Header: '2021',
        accessor: '2021',
      },
      {
        Header: '2022',
        accessor: '2022',
      },
      {
        Header: '2023',
        accessor: '2023',
      },
      {
        Header: '2024',
        accessor: '2024',
      },
      {
        Header: '2025',
        accessor: '2025',
      },
    ],
    []
  );

  // Definir las columnas tabla derecha
  const columnsRight = useMemo(
    () => [
      {
        Header: '',
        accessor: 'concepto',
      },
      {
        Header: '2021',
        accessor: '2021',
      },
      {
        Header: '2022',
        accessor: '2022',
      },
      {
        Header: '2023',
        accessor: '2023',
      },
      {
        Header: '2024',
        accessor: '2024',
      },
      {
        Header: 'PRESIÓN 2025',
        accessor: '2025',
      },
      {
        Header: 'Σ IMPORTES / Σ PROYECTOS',
        accessor: 'TOTAL',
      },
    ],
    []
  );

  // Configuración de la tabla izquierda
  const {
    getTableProps: getTablePropsLeft,
    getTableBodyProps: getTableBodyPropsLeft,
    headerGroups: headerGroupsLeft,
    rows: rowsLeft,
    prepareRow: prepareRowLeft,
  } = useTable({ columns: columnsLeft, data: dataLeft });

  // Configuración de la tabla derecha
  const {
    getTableProps: getTablePropsRight,
    getTableBodyProps: getTableBodyPropsRight,
    headerGroups: headerGroupsRight,
    rows: rowsRight,
    prepareRow: prepareRowRight,
  } = useTable({ columns: columnsRight, data: dataRight });

  // Estado para controlar la tabla y concepto seleccionados para la gráfica
  const [selectedTable, setSelectedTable] = useState('left');
  const [selectedSeries, setSelectedSeries] = useState('PRESUPUESTO F003');

  // Referencia para el gráfico unificado
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Formato de celdas según el tipo de dato - tabla izquierda
  const formatCellValueLeft = (value, concepto) => {
    if (value === '') return '';
    if (concepto === 'PRESUPUESTO F003' || concepto === 'MONTO MINIST DAIHC') {
      return `$ ${value.toLocaleString('en-US')}`;
    } else if (concepto === '% DAIHC VS F003' || concepto === 'Incremento por año (%)' || concepto === 'Promedio incremento (%)') {
      return `${value}%`;
    }
    return value;
  };

  // Formato de celdas según el tipo de dato - tabla derecha
  const formatCellValueRight = (value, concepto, column) => {
    if (value === '') return '';
    
    // Si es un string con formato de rango (como '$29,000-$9,998,000'), devolver tal cual
    if (typeof value === 'string' && value.includes('-')) {
      return value;
    }
    
    // Para los valores numéricos
    if (concepto === '$' || concepto === 'COSTO APROX. POR PROYECTO' || concepto === 'COSTO PROMEDIO POR PROYECTO') {
      return `$ ${value.toLocaleString('en-US')}`;
    } else if (concepto === 'NUM. PROYECTOS') {
      return value.toLocaleString('en-US');
    }
    
    return value;
  };

  // Función unificada para obtener datos del gráfico
  const getChartData = (table, concepto) => {
    // Si es una fila sin datos para gráfica, retornar null
    if (table === 'left' && concepto === 'Promedio incremento (%)') return null;
    if (table === 'right' && concepto === 'COSTO PROMEDIO POR PROYECTO') return null;
    if (table === 'right' && concepto === 'IMPORTE MINISTRADO DAIHC') return null;

    const data = table === 'left' ? dataLeft : dataRight;
    const row = data.find(r => r.concepto === concepto);
    if (!row) return null;

    const labels = ['2021', '2022', '2023', '2024', '2025'];
    
    // Si es tabla derecha y tiene total, añadirlo
    if (table === 'right' && row['TOTAL'] !== undefined) {
      labels.push('TOTAL');
    }

    return {
      labels,
      datasets: [
        {
          label: concepto,
          data: labels.map(year => row[year]),
          backgroundColor: labels.map((_, index) => {
            if (index === 5) return `${secondaryColor}dd`; // Para el TOTAL
            return index < 3 
              ? `${primaryColor}${['99', 'bb', 'ff'][index]}` 
              : `${secondaryColor}${['99', 'bb'][index - 3]}`;
          }),
          borderColor: labels.map((_, index) => {
            return index < 3 ? primaryColor : secondaryColor;
          }),
          borderWidth: 1
        }
      ]
    };
  };

  // Función para desplazarse a la sección de gráfico
  const scrollToChart = () => {
    if (chartSectionRef.current) {
      chartSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Función unificada para crear o actualizar el gráfico y hacer scroll
  const createOrUpdateChart = (table, concepto, shouldScroll = true) => {
    const chartData = getChartData(table, concepto);
    if (!chartData) {
      // Si no hay datos para graficar
      setSelectedTable(table);
      setSelectedSeries(concepto);
      return;
    }

    setSelectedTable(table);
    setSelectedSeries(concepto);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Aplicar la fuente global para Chart.js
    Chart.defaults.font.family = '"Noto Sans", Sans-serif';
    
    // Configurar opciones específicas según el concepto
    let tooltipCallback, yAxisCallback, beginAtZero = true;
    
    // Configurar según tabla y concepto
    if (table === 'left') {
      if (concepto === 'PRESUPUESTO F003' || concepto === 'MONTO MINIST DAIHC') {
        tooltipCallback = (value) => `$ ${value.toLocaleString('en-US')}`;
        yAxisCallback = (value) => `$${value.toLocaleString('en-US', {notation: 'compact', compactDisplay: 'short'})}`;
      } else if (concepto === '% DAIHC VS F003' || concepto === 'Incremento por año (%)') {
        tooltipCallback = (value) => `${value}%`;
        yAxisCallback = (value) => `${value}%`;
        if (concepto === 'Incremento por año (%)') beginAtZero = false;
      }
    } else {  // tabla derecha
      if (concepto === '$' || concepto === 'COSTO APROX. POR PROYECTO') {
        tooltipCallback = (value) => `$ ${value.toLocaleString('en-US')}`;
        yAxisCallback = (value) => `$${value.toLocaleString('en-US', {notation: 'compact', compactDisplay: 'short'})}`;
      } else {
        tooltipCallback = (value) => value.toLocaleString('en-US');
        yAxisCallback = (value) => value.toLocaleString('en-US');
      }
    }
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${concepto} por Año`,
            font: {
              size: 18,
              weight: 'bold'
            },
            color: primaryColor,
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                if (value === '' || value === undefined) return '';
                return tooltipCallback ? tooltipCallback(value) : value;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero,
            ticks: {
              callback: function(value) {
                return yAxisCallback ? yAxisCallback(value) : value;
              },
              color: primaryColor,
              font: {
                size: 12
              }
            },
            grid: {
              color: '#e0e0e0'
            }
          },
          x: {
            ticks: {
              color: primaryColor,
              font: {
                size: 12
              }
            },
            grid: {
              color: '#e0e0e0'
            }
          }
        }
      }
    });
    
    // Desplazarse a la gráfica si se solicita
    if (shouldScroll) {
      setTimeout(scrollToChart, 100); // Pequeño retraso para asegurar que el gráfico se haya renderizado
    }
  };

  // Inicializar el gráfico al cargar
  useEffect(() => {
    createOrUpdateChart('left', 'PRESUPUESTO F003', false);
    
    // Limpiar al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  // Función para generar botones de ambas tablas
  const renderChartButtons = () => {
    const leftButtons = dataLeft
      .filter(row => row.concepto !== 'Promedio incremento (%)')
      .map(row => ({
        table: 'left',
        concepto: row.concepto
      }));
    
    const rightButtons = dataRight
      .filter(row => row.concepto !== 'COSTO PROMEDIO POR PROYECTO' && row.concepto !== 'IMPORTE MINISTRADO DAIHC')
      .map(row => ({
        table: 'right',
        concepto: row.concepto
      }));
    
    const allButtons = [...leftButtons, ...rightButtons];
    
    return (
      <div className="home-budget__button-container">
        {allButtons.map(item => (
          <button 
            key={`${item.table}-${item.concepto}`}
            onClick={() => createOrUpdateChart(item.table, item.concepto)}
            className={`home-budget__chart-button ${selectedTable === item.table && selectedSeries === item.concepto ? 'home-budget__chart-button--active' : ''}`}
          >
            {item.concepto}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="home-budget">
      <h1 className="home-budget__title">Panel de Análisis Presupuestario</h1>
      
      {/* Tabla 1 - Presupuesto y porcentajes */}
      <div className="home-budget__table-section">
        <h2 className="home-budget__section-title">Presupuesto F003 y Ministración DAIHC</h2>
        <div className="home-budget__table-container">
          <table {...getTablePropsLeft()} className="home-budget__data-table">
            <thead>
              {headerGroupsLeft.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()} className="home-budget__header-cell">
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyPropsLeft()}>
              {rowsLeft.map(row => {
                prepareRowLeft(row);
                return (
                  <tr 
                    {...row.getRowProps()} 
                    onClick={() => {
                      if (row.original.concepto !== 'Promedio incremento (%)') {
                        createOrUpdateChart('left', row.original.concepto);
                      }
                    }}
                    className={`home-budget__table-row ${row.original.concepto === 'Promedio incremento (%)' ? 'home-budget__table-row--no-chart' : ''}`}
                  >
                    {row.cells.map((cell, index) => {
                      const isConceptCell = index === 0;
                      const isNegativeValue = 
                        row.original.concepto === 'Incremento por año (%)' && 
                        !isConceptCell && 
                        cell.value < 0;
                      
                      return (
                        <td 
                          {...cell.getCellProps()} 
                          className={`
                            home-budget__cell
                            ${isConceptCell ? 'home-budget__concept-cell' : ''}
                            ${isNegativeValue ? 'home-budget__negative-value' : ''}
                          `}
                        >
                          {isConceptCell 
                            ? cell.value 
                            : formatCellValueLeft(cell.value, row.original.concepto)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla 2 - Importes ministrados y proyectos */}
      <div className="home-budget__table-section">
        <h2 className="home-budget__section-title">Importes Ministrados DAIHC y Proyectos</h2>
        <div className="home-budget__table-container">
          <table {...getTablePropsRight()} className="home-budget__data-table home-budget__right-table">
            <thead>
              {headerGroupsRight.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()} className="home-budget__header-cell">
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyPropsRight()}>
              {rowsRight.map(row => {
                prepareRowRight(row);
                return (
                  <tr 
                    {...row.getRowProps()} 
                    onClick={() => {
                      if (row.original.concepto !== 'COSTO PROMEDIO POR PROYECTO' && 
                          row.original.concepto !== 'IMPORTE MINISTRADO DAIHC') {
                        createOrUpdateChart('right', row.original.concepto);
                      }
                    }}
                    className={`home-budget__table-row ${(row.original.concepto === 'COSTO PROMEDIO POR PROYECTO' || 
                                          row.original.concepto === 'IMPORTE MINISTRADO DAIHC') ? 'home-budget__table-row--no-chart' : ''}`}
                  >
                    {row.cells.map((cell, index) => {
                      const isConceptCell = index === 0;
                      
                      return (
                        <td 
                          {...cell.getCellProps()} 
                          className={`
                            home-budget__cell
                            ${isConceptCell ? 'home-budget__concept-cell' : ''}
                            ${index === row.cells.length - 1 ? 'home-budget__total-cell' : ''}
                          `}
                        >
                          {isConceptCell 
                            ? cell.value 
                            : formatCellValueRight(cell.value, row.original.concepto, cell.column.id)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Sección de gráfico unificado (ahora después de las tablas) */}
      <div className="home-budget__chart-section" ref={chartSectionRef}>
        <div className="home-budget__chart-title">
          <h2 className="home-budget__section-title">Gráfico de {selectedSeries}</h2>
          <p className="home-budget__chart-subtitle">Haga clic en cualquier fila de las tablas o use los botones para visualizar los datos</p>
        </div>
        <div className="home-budget__chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
        {renderChartButtons()}
      </div>
    </div>
  );
};

export default Home;