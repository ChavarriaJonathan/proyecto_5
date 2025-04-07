import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import SidebarWithContext from '../components/SidebarWithContext';
import './PresionDelGasto.css';
import axios from 'axios';
import { FaSave } from 'react-icons/fa';
import IncrementoPresupuestoCardsWithContext from './IncrementoPresupuestoCardsWithContext';
import TableResumen1WithContext from './TableResumen1WithContext';
import { useEscenario } from './EscenarioContext';

const PresionDelGastoWithContext = () => {
  const {
    selectedEscenario,
    selectedConvocatoria,
    sortOption,
    refreshTrigger,
    triggerRefresh,
    globalSuccessMessage,
    globalError,
    setGlobalError,
    setGlobalSuccessMessage
  } = useEscenario();

  const [convocatorias, setConvocatorias] = useState([]);
  const [aniosData, setAniosData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [edited, setEdited] = useState(false);
  const [aniosEdited, setAniosEdited] = useState(false);
  
  useEffect(() => {
    if (selectedEscenario) {
      fetchTableData();
      fetchAniosData();
    }
  }, [selectedEscenario, selectedConvocatoria, sortOption, refreshTrigger]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchTableData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost/proyecto_5/backend/Table-Convocatorias/getTablaConvocatorias.php?id_escenario=${selectedEscenario.id_escenario}`);
      
      if (response.data.success) {
        const convocatoriasData = processConvocatoriasData(response.data.data);
        let processedConvocatorias = [...convocatoriasData.convocatorias];
        
        if (sortOption !== 'original') {
          processedConvocatorias = sortConvocatorias(processedConvocatorias, sortOption);
        }
        
        if (selectedConvocatoria) {
          const filteredConvocatorias = processedConvocatorias.filter(
            conv => conv.id_convocatoria === selectedConvocatoria.id_convocatoria
          );
          setConvocatorias(filteredConvocatorias);
        } else {
          setConvocatorias(processedConvocatorias);
        }
      } else {
        setError('Error al cargar datos de la tabla');
        setGlobalError('Error al cargar datos de convocatorias');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching table data:', error);
      setError('Error de conexión al servidor');
      setGlobalError('Error de conexión al servidor de convocatorias');
      setLoading(false);
    }
  };

  const fetchAniosData = async () => {
    try {
      const response = await axios.get(`http://localhost/proyecto_5/backend/table-principal/getTablaAniosData.php?id_escenario=${selectedEscenario.id_escenario}`);
      
      if (response.data.success) {
        const processedData = response.data.data.map(item => {
          const pgNumber = parseFloat(item.ad_presion_gastos_raw || item.ad_presion_gastos.replace(/[$,]/g, ''));
          const cxpNumber = parseFloat(item.ad_costo_x_proyecto_raw || item.ad_costo_x_proyecto.replace(/[$,]/g, ''));
          const pptoNumber = parseFloat(item.ad_2025_ppto_x_comp_raw || item.ad_2025_ppto_x_comp.replace(/[$,]/g, ''));
          
          return {
            ...item,
            ad_presion_gastos: formatCurrency(pgNumber),
            ad_costo_x_proyecto: formatCurrency(cxpNumber),
            ad_2025_ppto_x_comp: formatCurrency(pptoNumber),
            ad_presion_gastos_raw: pgNumber,
            ad_costo_x_proyecto_raw: cxpNumber,
            ad_2025_ppto_x_comp_raw: pptoNumber,
            ad_presion_gastos_input: formatCurrency(pgNumber),
            ad_costo_x_proyecto_input: formatCurrency(cxpNumber)
          };
        });
        
        setAniosData(processedData);
      } else {
        console.error('Error al cargar datos de años:', response.data.message);
        setGlobalError('Error al cargar datos de años');
      }
    } catch (error) {
      console.error('Error fetching años data:', error);
      setGlobalError('Error de conexión al servidor de años');
    }
  };
  
  const sortConvocatorias = (convocatorias, sortType) => {
    const sortedConvocatorias = [...convocatorias];
    
    switch (sortType) {
      case 'alphabetical':
        sortedConvocatorias.sort((a, b) => a.c_nombre.localeCompare(b.c_nombre));
        break;
      case 'alphabetical-desc':
        sortedConvocatorias.sort((a, b) => b.c_nombre.localeCompare(a.c_nombre));
        break;
      default:
        break;
    }
    
    return sortedConvocatorias;
  };

  const processConvocatoriasData = (data) => {
    const allYears = [...new Set(data.map(item => item.id_año))];
    const yearsDataMap = {};
    allYears.forEach(yearId => {
      const yearItem = data.find(item => item.id_año === yearId);
      yearsDataMap[yearId] = {
        id_años: yearId,
        a_numero_año: yearItem.a_numero_año
      };
    });
    
    const convocatoriaOrder = {};
    const uniqueConvocatorias = [...new Set(data.map(item => item.id_convocatoria))];
    uniqueConvocatorias.forEach((id, index) => {
      convocatoriaOrder[id] = index;
    });
    
    const convocatoriasData = uniqueConvocatorias.map(convocatoriaId => {
      const convocatoriaItems = data.filter(item => item.id_convocatoria === convocatoriaId);
      const firstItem = convocatoriaItems[0];
      
      const yearData = {};
      const convocatoriaYears = [];
      
      convocatoriaItems.forEach(item => {
        const nuevosProyectos = parseInt(item.dc_nuevos_proyectos, 10);
        const costoXProyecto = parseFloat(item.dc_costo_x_proyecto.replace(/[$,]/g, ''));
        
        yearData[item.id_año] = {
          id_datos_conv: item.id_datos_conv,
          dc_nuevos_proyectos: nuevosProyectos,
          dc_costo_x_proyecto: costoXProyecto,
          dc_subtotal: nuevosProyectos * costoXProyecto,
          dc_porcentaje_x_año: parseFloat(item.dc_porcentaje_x_año.replace('%', '')),
          original_format: {
            dc_costo_x_proyecto: item.dc_costo_x_proyecto,
            dc_subtotal: item.dc_subtotal,
            dc_porcentaje_x_año: item.dc_porcentaje_x_año
          }
        };
        convocatoriaYears.push(yearsDataMap[item.id_año]);
      });
      
      const totalNuevosProyectos = Object.values(yearData)[0]?.dc_nuevos_proyectos || 0;
      
      const totalCostoXProyecto = Object.values(yearData).reduce(
        (sum, data) => sum + data.dc_costo_x_proyecto, 
        0
      );
      
      const totalCostoConvocatoria = totalNuevosProyectos * totalCostoXProyecto;
      
      return {
        id_convocatoria: convocatoriaId,
        c_nombre: firstItem.c_nombre,
        orderIndex: convocatoriaOrder[convocatoriaId],
        yearData,
        years: convocatoriaYears.sort((a, b) => a.a_numero_año - b.a_numero_año),
        totales: {
          nuevosProyectos: totalNuevosProyectos,
          costoXProyecto: totalCostoXProyecto,
          costoConvocatoria: totalCostoConvocatoria
        }
      };
    });
    
    convocatoriasData.sort((a, b) => a.orderIndex - b.orderIndex);
    
    return {
      convocatorias: convocatoriasData,
      years: Object.values(yearsDataMap).sort((a, b) => a.a_numero_año - b.a_numero_año)
    };
  };
  
  const handleNuevosProyectosChange = (convocatoriaIndex, value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;
    
    setEdited(true);
    const updatedConvocatorias = [...convocatorias];
    const convocatoria = updatedConvocatorias[convocatoriaIndex];
    
    Object.keys(convocatoria.yearData).forEach(yearId => {
      convocatoria.yearData[yearId].dc_nuevos_proyectos = numValue;
      
      const costoXProyecto = convocatoria.yearData[yearId].dc_costo_x_proyecto;
      convocatoria.yearData[yearId].dc_subtotal = numValue * costoXProyecto;
    });
    
    convocatoria.totales.nuevosProyectos = numValue;
    convocatoria.totales.costoConvocatoria = numValue * convocatoria.totales.costoXProyecto;
    
    recalcularPorcentajes(updatedConvocatorias, convocatoriaIndex);
    
    setConvocatorias(updatedConvocatorias);
  };
  
  const handleCostoXProyChange = (convocatoriaIndex, yearId, value) => {
    const numValue = parseFloat(value.replace(/[$,]/g, ''));
    if (isNaN(numValue) || numValue < 0) return;
    
    setEdited(true);
    const updatedConvocatorias = [...convocatorias];
    const convocatoria = updatedConvocatorias[convocatoriaIndex];
    
    convocatoria.yearData[yearId].dc_costo_x_proyecto = numValue;
    
    const nuevosProyectos = convocatoria.yearData[yearId].dc_nuevos_proyectos;
    convocatoria.yearData[yearId].dc_subtotal = nuevosProyectos * numValue;
    
    const totalCostoXProyecto = Object.values(convocatoria.yearData).reduce(
      (sum, data) => sum + data.dc_costo_x_proyecto, 
      0
    );
    
    convocatoria.totales.costoXProyecto = totalCostoXProyecto;
    convocatoria.totales.costoConvocatoria = convocatoria.totales.nuevosProyectos * totalCostoXProyecto;
    
    recalcularPorcentajes(updatedConvocatorias, convocatoriaIndex);
    
    setConvocatorias(updatedConvocatorias);
  };
  
  const handlePresionGastoChange = (index, value) => {
    setAniosEdited(true);
    const updatedAniosData = [...aniosData];
    updatedAniosData[index].ad_presion_gastos_input = value;
    setAniosData(updatedAniosData);
  };
  
  const handlePresionGastoBlur = (index, value) => {
    const numValue = extractNumericValue(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    const updatedAniosData = [...aniosData];
    updatedAniosData[index] = {
      ...updatedAniosData[index],
      ad_presion_gastos: formatCurrency(numValue),
      ad_presion_gastos_raw: numValue,
      ad_presion_gastos_input: formatCurrency(numValue)
    };
    
    setAniosData(updatedAniosData);
  };
  
  const handleNumProyPreChange = (index, value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;
    
    setAniosEdited(true);
    const updatedAniosData = [...aniosData];
    updatedAniosData[index].ad_num_proy_pre = numValue;
    
    setAniosData(updatedAniosData);
  };
  
  const handleCostoXProyAniosChange = (index, value) => {
    setAniosEdited(true);
    const updatedAniosData = [...aniosData];
    updatedAniosData[index].ad_costo_x_proyecto_input = value;
    setAniosData(updatedAniosData);
  };
  
  const handleCostoXProyAniosBlur = (index, value) => {
    const numValue = extractNumericValue(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    const updatedAniosData = [...aniosData];
    updatedAniosData[index] = {
      ...updatedAniosData[index],
      ad_costo_x_proyecto: formatCurrency(numValue),
      ad_costo_x_proyecto_raw: numValue,
      ad_costo_x_proyecto_input: formatCurrency(numValue)
    };
    
    setAniosData(updatedAniosData);
  };
  
  const recalcularPorcentajes = (convocatorias, convocatoriaIndex) => {
    const convocatoria = convocatorias[convocatoriaIndex];
    
    const totalSubtotales = Object.values(convocatoria.yearData).reduce(
      (total, yearData) => total + yearData.dc_subtotal, 0
    );
    
    Object.keys(convocatoria.yearData).forEach(yearId => {
      const subtotal = convocatoria.yearData[yearId].dc_subtotal;
      convocatoria.yearData[yearId].dc_porcentaje_x_año = totalSubtotales > 0 
        ? (subtotal / totalSubtotales) * 100 
        : 0;
    });
  };
  
  const formatCurrency = (amount) => {
    if (typeof amount === 'string') {
      amount = parseFloat(amount.replace(/[$,]/g, ''));
    }
    
    if (isNaN(amount)) return '$0.00';
    
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const extractNumericValue = (formattedValue) => {
    if (typeof formattedValue === 'number') return formattedValue;
    if (!formattedValue) return 0;
    
    return parseFloat(formattedValue.replace(/[$,]/g, ''));
  };
  
  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      const updateData = [];
      
      convocatorias.forEach(convocatoria => {
        Object.entries(convocatoria.yearData).forEach(([yearId, data]) => {
          updateData.push({
            id_datos_conv: data.id_datos_conv,
            dc_nuevos_proyectos: data.dc_nuevos_proyectos,
            dc_costo_x_proyecto: data.dc_costo_x_proyecto,
            dc_subtotal: data.dc_subtotal,
            dc_porcentaje_x_año: data.dc_porcentaje_x_año
          });
        });
      });
      
      const response = await axios.post(
        'http://localhost/proyecto_5/backend/Table-Convocatorias/updateTablaConvocatorias.php',
        { data: updateData }
      );
      
      if (response.data.success) {
        setSuccessMessage('Datos guardados correctamente');
        setGlobalSuccessMessage('Datos de convocatorias guardados correctamente');
        setEdited(false);
        
        // Notificar a otros componentes que deben actualizar sus datos
        triggerRefresh();
        
        fetchTableData();
      } else {
        setError('Error al guardar los datos: ' + response.data.message);
        setGlobalError('Error al guardar convocatorias');
      }
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Error de conexión al servidor');
      setGlobalError('Error de conexión al guardar convocatorias');
      setSaving(false);
    }
  };
  
  const handleSaveAniosChanges = async () => {
    try {
      setSaving(true);
      
      const updateAniosData = aniosData.map(item => {
        return {
          id_años_datos: item.id_años_datos,
          ad_presion_gastos: item.ad_presion_gastos,
          ad_num_proy_pre: item.ad_num_proy_pre,
          ad_costo_x_proyecto: item.ad_costo_x_proyecto
        };
      });
      
      console.log('Enviando datos al servidor:', updateAniosData);
      
      const response = await axios.post(
        'http://localhost/proyecto_5/backend/table-principal/updateTablaAniosData.php',
        { data: updateAniosData }
      );
      
      if (response.data.success) {
        setSuccessMessage('Datos de escenario guardados correctamente');
        setGlobalSuccessMessage('Datos de escenario guardados correctamente');
        setAniosEdited(false);
        
        // Notificar a otros componentes que deben actualizar sus datos
        triggerRefresh();
        
        await fetchAniosData();
      } else {
        setError('Error al guardar los datos del escenario: ' + response.data.message);
        setGlobalError('Error al guardar datos del escenario');
      }
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving anios data:', error);
      setError('Error de conexión al servidor');
      setGlobalError('Error de conexión al guardar años');
      setSaving(false);
    }
  };

  return (
    <div className="presion-gasto-container">
      <SidebarWithContext />
      <div className="main-content">
        <h1>Tablero de Presión del Gasto</h1>
        
        {loading ? (
          <div className="loading">Cargando datos...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : globalSuccessMessage ? (
          <div className="success">{globalSuccessMessage}</div>
        ) : successMessage ? (
          <div className="success">{successMessage}</div>
        ) : globalError ? (
          <div className="error">{globalError}</div>
        ) : selectedEscenario ? (
          <div className="tables-container">
            <h2>
              Escenario: {selectedEscenario.e_nombre}
              {selectedConvocatoria && (
                <span className="filter-label"> - Convocatoria: {selectedConvocatoria.c_nombre}</span>
              )}
              {sortOption !== 'original' && (
                <span className="sort-label">
                  {sortOption === 'alphabetical' ? ' - Orden: Alfabético (A-Z)' : ' - Orden: Alfabético (Z-A)'}
                </span>
              )}
            </h2>
            
            {aniosData.length > 0 && (
              <div className="resumen-table-container">
                <h3>Datos del Escenario</h3>
                <table className="datos-table resumen-table">
                  <thead>
                    <tr>
                      <th className="column-header">AÑO</th>
                      {aniosData.map(item => (
                        <th key={`year-${item.id_años_datos}`} className="year-column">
                          {item.a_numero_año}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="row-header">Presión Gasto</td>
                      {aniosData.map((item, index) => (
                        <td key={`pg-${item.id_años_datos}`} className="data-cell highlight-cell editable">
                          <input
                            type="text"
                            value={item.ad_presion_gastos_input || item.ad_presion_gastos}
                            onChange={(e) => handlePresionGastoChange(index, e.target.value)}
                            onBlur={(e) => handlePresionGastoBlur(index, e.target.value)}
                            className="editable-input highlight-input"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">Num. Proy Pre</td>
                      {aniosData.map((item, index) => (
                        <td key={`np-${item.id_años_datos}`} className="data-cell editable">
                          <input
                            type="number"
                            min="0"
                            value={item.ad_num_proy_pre}
                            onChange={(e) => handleNumProyPreChange(index, e.target.value)}
                            className="editable-input"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">Costo X Proy</td>
                      {aniosData.map((item, index) => (
                        <td key={`cxp-${item.id_años_datos}`} className="data-cell editable">
                          <input
                            type="text"
                            value={item.ad_costo_x_proyecto_input || item.ad_costo_x_proyecto}
                            onChange={(e) => handleCostoXProyAniosChange(index, e.target.value)}
                            onBlur={(e) => handleCostoXProyAniosBlur(index, e.target.value)}
                            className="editable-input"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">2025 Ppto X comp</td>
{aniosData.map(item => (
                        <td key={`pxc-${item.id_años_datos}`} className="data-cell readonly-cell">
                          {item.ad_2025_ppto_x_comp}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
                
                {aniosEdited && (
                  <div className="anios-actions">
                    <button 
                      className={`save-button active`} 
                      onClick={handleSaveAniosChanges}
                      disabled={saving}
                    >
                      <FaSave /> {saving ? 'Guardando...' : 'Guardar Datos del Escenario'}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Renderizar el componente TableResumen1WithContext */}
            <TableResumen1WithContext />
            
            {convocatorias.length > 0 ? (
              <>
                {convocatorias.map((convocatoria, convIndex) => (
                  <div key={convocatoria.id_convocatoria} className="convocatoria-container">
                    <div className="convocatoria-table">
                      <h3>{convocatoria.c_nombre}</h3>
                      <div className="tables-flex-container">
                        <table className="datos-table">
                          <thead>
                            <tr>
                              <th className="column-header">Años</th>
                              {convocatoria.years.map(year => (
                                <th key={year.id_años} className="year-column">
                                  {year.a_numero_año}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="row-header">Nuevos Proy</td>
                              {convocatoria.years.map((year, yearIndex) => (
                                <td key={`np-${year.id_años}`} className="data-cell">
                                  {convocatoria.yearData[year.id_años]?.dc_nuevos_proyectos || 0}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="row-header">Costo X Proy</td>
                              {convocatoria.years.map(year => (
                                <td key={`cxp-${year.id_años}`} className="data-cell editable">
                                  <input
                                    type="text"
                                    value={formatCurrency(convocatoria.yearData[year.id_años]?.dc_costo_x_proyecto || 0)}
                                    onChange={(e) => handleCostoXProyChange(convIndex, year.id_años, e.target.value)}
                                    className="editable-input"
                                  />
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="row-header">SUBTOTAL</td>
                              {convocatoria.years.map(year => (
                                <td key={`st-${year.id_años}`} className="data-cell subtotal">
                                  {formatCurrency(convocatoria.yearData[year.id_años]?.dc_subtotal || 0)}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="row-header">% por año</td>
                              {convocatoria.years.map(year => (
                                <td key={`pct-${year.id_años}`} className="data-cell percentage">
                                  {formatPercent(convocatoria.yearData[year.id_años]?.dc_porcentaje_x_año || 0)}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                        
                        <table className="total-table">
                          <thead>
                            <tr>
                              <th colSpan="2" className="total-header">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="total-row-header">Nuevos proyectos</td>
                              <td className="total-cell editable">
                                <input
                                  type="number"
                                  min="0"
                                  value={convocatoria.totales?.nuevosProyectos || 0}
                                  onChange={(e) => handleNuevosProyectosChange(convIndex, e.target.value)}
                                  className="editable-input"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="total-row-header">Costo X proyecto</td>
                              <td className="total-cell">
                                {formatCurrency(convocatoria.totales?.costoXProyecto || 0)}
                              </td>
                            </tr>
                            <tr>
                              <td className="total-row-header">Costo X convocatoria</td>
                              <td className="total-cell total-highlight">
                                {formatCurrency(convocatoria.totales?.costoConvocatoria || 0)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="actions-container">
                  <button 
                    className={`save-button ${edited ? 'active' : ''}`} 
                    onClick={handleSaveChanges}
                    disabled={!edited || saving}
                  >
                    <FaSave /> {saving ? 'Guardando...' : 'Guardar Información'}
                  </button>
                </div>
                
                {/* Renderizar el componente IncrementoPresupuestoCardsWithContext */}
                <IncrementoPresupuestoCardsWithContext />
              </>
            ) : (
              <div className="no-data">
                <p>No hay datos disponibles para la convocatoria seleccionada</p>
              </div>
            )}
          </div>
        ) : (
          <div className="no-selection">
            <p>Selecciona un escenario en la barra lateral para visualizar los datos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresionDelGastoWithContext;