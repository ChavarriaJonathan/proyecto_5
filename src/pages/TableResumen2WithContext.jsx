import React, { useState, useEffect } from 'react';
import { FaSave, FaProjectDiagram, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { useEscenario } from './EscenarioContext';
import './TableResumen2.css';

const TableResumen2WithContext = () => {
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
      const response = await axios.get(`http://localhost/proyecto_5/backend/table-resumen2/getTablaResumen2.php?id_escenario=${selectedEscenario.id_escenario}`);
      
      if (response.data.success) {
        console.log("Datos de resumen2 recibidos:", response.data.data);
        setResumenData(response.data.data);
      } else {
        setError('Error al cargar datos de resumen de proyectos: ' + response.data.message);
        setGlobalError('Error al cargar resumen de proyectos');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resumen2 data:', error);
      setError('Error de conexión al servidor');
      setGlobalError('Error de conexión al servidor de resumen de proyectos');
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Preparar datos para enviar al servidor
      const dataToSend = resumenData.map(item => ({
        id_r2: item.id_r2,
        id_presupuesto: item.id_presupuesto,
        r2_proyectos_presion: item.r2_proyectos_presion,
        r2_proyectos_comprometer: item.r2_proyectos_comprometer,
        r2_total_proyectos: item.r2_total_proyectos
      }));
      
      // Configurar correctamente la petición AJAX
      const response = await axios.post(
        'http://localhost/proyecto_5/backend/table-resumen2/updateTablaResumen2.php',
        { data: dataToSend },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
      
      if (response.data.success) {
        setSuccessMessage('Datos de resumen de proyectos guardados correctamente');
        setGlobalSuccessMessage('Datos de resumen de proyectos guardados correctamente');
        setEdited(false);
        
        triggerRefresh();
        await fetchResumenData();
      } else {
        setError('Error al guardar los datos: ' + response.data.message);
        setGlobalError('Error al guardar datos de resumen de proyectos');
      }
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving resumen2 data:', error);
      setError('Error de conexión al servidor');
      setGlobalError('Error de conexión al guardar resumen de proyectos');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando datos de resumen de proyectos...</div>;
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
      <div className="resumen2-container">
        <h3><FaProjectDiagram className="section-icon" /> Resumen Proyectos</h3>
        <div className="error">
          No hay datos de resumen de proyectos disponibles para este escenario.
        </div>
      </div>
    );
  }

  return (
    <div className="resumen2-container">
      <h3><FaProjectDiagram className="section-icon" /> Resumen Proyectos</h3>
      
      {successMessage && <div className="success">{successMessage}</div>}
      
      <div className="resumen2-table-container">
        <table className="resumen2-table">
          <thead>
            <tr>
              <th>Concepto</th>
              {resumenData.map(item => (
                <th key={`year-${item.id_r2}`} className="year-header">
                  {item.a_numero_año}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="row-header">Proyectos Presión</td>
              {resumenData.map(item => (
                <td key={`pp-${item.id_r2}`}>
                  {item.r2_proyectos_presion.toLocaleString()}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Proyectos por Comprometer</td>
              {resumenData.map(item => (
                <td key={`pc-${item.id_r2}`}>
                  {item.r2_proyectos_comprometer.toLocaleString()}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Total Proyectos</td>
              {resumenData.map(item => (
                <td key={`tp-${item.id_r2}`} className="total-projects">
                  {item.r2_total_proyectos.toLocaleString()}
                </td>
              ))}
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
            <FaSave /> {saving ? 'Guardando...' : 'Guardar Cambios de Resumen de Proyectos'}
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

export default TableResumen2WithContext;