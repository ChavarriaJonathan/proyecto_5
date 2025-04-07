import React, { useState, useEffect } from 'react';
import { FaSave, FaBalanceScale, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { useEscenario } from './EscenarioContext';
import './TableResumen1.css';

const TableResumen1WithContext = () => {
  const { 
    selectedEscenario, 
    refreshTrigger, 
    triggerRefresh,
    setGlobalSuccessMessage,
    setGlobalError
  } = useEscenario();
  
  const [resumenData, setResumenData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [edited, setEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedEscenario) {
      fetchResumenData();
    }
  }, [selectedEscenario, refreshTrigger]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchResumenData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`http://localhost/proyecto_5/backend/table-resumen1/getTablaResumen1.php?id_escenario=${selectedEscenario.id_escenario}`);
      
      if (response.data.success) {
        console.log("Datos de resumen1 recibidos:", response.data.data);
        setResumenData(response.data.data);
      } else {
        setError('Error al cargar datos de resumen: ' + response.data.message);
        setGlobalError('Error al cargar resumen financiero');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resumen data:', error);
      setError('Error de conexión al servidor');
      setGlobalError('Error de conexión al servidor de resumen');
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Preparar datos para enviar al servidor
      const dataToSend = resumenData.map(item => ({
        id_r1: item.id_r1,
        id_presupuesto: item.id_presupuesto,
        r1_presupuestio_bruto: item.r1_presupuestio_bruto,
        r1_presion_gasto_realv: item.r1_presion_gasto_realv,
        r1_presupuesto_comprometer: item.r1_presupuesto_comprometer,
        r1_presion_gasto_proyectada: item.r1_presion_gasto_proyectada,
        r1_monto_total_comprometido: item.r1_monto_total_comprometido,
        r1_deficit: item.r1_deficit,
        r1_presupuestio_bruto_formatted: item.r1_presupuestio_bruto_formatted,
        r1_presion_gasto_realv_formatted: item.r1_presion_gasto_realv_formatted,
        r1_presupuesto_comprometer_formatted: item.r1_presupuesto_comprometer_formatted,
        r1_presion_gasto_proyectada_formatted: item.r1_presion_gasto_proyectada_formatted,
        r1_monto_total_comprometido_formatted: item.r1_monto_total_comprometido_formatted,
        r1_deficit_formatted: item.r1_deficit_formatted
      }));
      
      // Configurar correctamente la petición AJAX
      const response = await axios.post(
        'http://localhost/proyecto_5/backend/table-resumen1/updateTablaResumen1.php',
        { data: dataToSend },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
      
      if (response.data.success) {
        setSuccessMessage('Datos de resumen guardados correctamente');
        setGlobalSuccessMessage('Datos de resumen financiero guardados correctamente');
        setEdited(false);
        
        triggerRefresh();
        await fetchResumenData();
      } else {
        setError('Error al guardar los datos: ' + response.data.message);
        setGlobalError('Error al guardar datos de resumen');
      }
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving resumen data:', error);
      setError('Error de conexión al servidor');
      setGlobalError('Error de conexión al guardar resumen');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando datos de resumen...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <FaExclamationTriangle className="error-icon" />
        {error}
      </div>
    );
  }

  if (!selectedEscenario) {
    return null;
  }

  if (resumenData.length === 0) {
    return (
      <div className="resumen1-container">
        <h3><FaBalanceScale className="section-icon" /> Resumen Financiero</h3>
        <div className="error">
          No hay datos de resumen disponibles para este escenario.
        </div>
      </div>
    );
  }

  return (
    <div className="resumen1-container">
      <h3><FaBalanceScale className="section-icon" /> Resumen Financiero</h3>
      
      {successMessage && <div className="success">{successMessage}</div>}
      
      <div className="resumen1-table-container">
        <table className="resumen1-table">
          <thead>
            <tr>
              <th>Concepto</th>
              {resumenData.map(item => (
                <th key={`year-${item.id_r1}`} className="year-header">
                  {item.a_numero_año}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="row-header">Presupuesto bruto</td>
              {resumenData.map(item => (
                <td key={`pb-${item.id_r1}`}>
                  {item.r1_presupuestio_bruto_formatted}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Presión del gasto real</td>
              {resumenData.map(item => (
                <td key={`pgr-${item.id_r1}`}>
                  {item.r1_presion_gasto_realv_formatted}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Presupuesto por comprometer</td>
              {resumenData.map(item => (
                <td key={`pc-${item.id_r1}`}>
                  {item.r1_presupuesto_comprometer_formatted}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Presión del gasto proyectada</td>
              {resumenData.map(item => (
                <td key={`pgp-${item.id_r1}`}>
                  {item.r1_presion_gasto_proyectada_formatted}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Monto total comprometido</td>
              {resumenData.map(item => (
                <td key={`mtc-${item.id_r1}`}>
                  {item.r1_monto_total_comprometido_formatted}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Déficit o superávit por comprometer</td>
              {resumenData.map(item => {
                const isPositive = item.r1_deficit >= 0;
                return (
                  <td 
                    key={`def-${item.id_r1}`}
                    className={isPositive ? 'deficit-positive' : 'deficit-negative'}
                  >
                    {item.r1_deficit_formatted}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      
      {edited && (
        <div className="actions-container">
          <button 
            className="save-button active" 
            onClick={handleSaveChanges}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Guardando...' : 'Guardar Cambios de Resumen'}
          </button>
        </div>
      )}

      {/* Información de depuración (solo visible durante el desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <details>
            <summary>Debug Info</summary>
            <pre>{JSON.stringify(resumenData, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default TableResumen1WithContext;