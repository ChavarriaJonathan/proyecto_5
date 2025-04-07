import React, { useState, useEffect } from 'react';
import { FaSave, FaMinus, FaPlus, FaPercentage, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import './IncrementoPresupuestoCards.css';
import { useEscenario } from './EscenarioContext';

const IncrementoPresupuestoCardsWithContext = () => {
  const { 
    selectedEscenario, 
    refreshTrigger, 
    triggerRefresh,
    setGlobalSuccessMessage,
    setGlobalError
  } = useEscenario();
  
  const [incrementoData, setIncrementoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [edited, setEdited] = useState(false);
  const [baseValue, setBaseValue] = useState(704273246);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedEscenario) {
      fetchIncrementoData();
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

  const fetchIncrementoData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`http://localhost/proyecto_5/backend/incremento_presupuesto/getIncrementoPresupuesto.php?id_escenario=${selectedEscenario.id_escenario}`);
      
      if (response.data.success) {
        console.log("Datos recibidos:", response.data.data);
        setIncrementoData(response.data.data);
        if (response.data.baseValue) {
          setBaseValue(response.data.baseValue);
        }
      } else {
        setError('Error al cargar datos de incremento de presupuesto');
        setGlobalError('Error al cargar datos de incremento de presupuesto');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching incremento data:', error);
      setError('Error de conexión al servidor');
      setGlobalError('Error de conexión al servidor de presupuesto');
      setLoading(false);
    }
  };

  const handlePorcentajeChange = (index, value) => {
    // Asegurarse de que value sea un número
    let numValue = parseFloat(value);
    
    // Validar que el valor esté dentro del rango permitido (0-50%)
    if (isNaN(numValue)) numValue = 0;
    if (numValue < 0) numValue = 0;
    if (numValue > 50) numValue = 50;

    console.log(`Cambiando porcentaje en índice ${index} a ${numValue}%`);

    const updatedData = [...incrementoData];
    
    // Actualizar el porcentaje para este año
    updatedData[index] = {
      ...updatedData[index],
      ip_porcentaje: numValue,
      ip_porcentaje_formatted: numValue.toFixed(1) + '%'
    };

    // Recalcular los valores de Total Bruto para este año y los siguientes
    for (let i = index; i < updatedData.length; i++) {
      let totalBruto;
      if (i === index) {
        // Para el año actual, aplicar incremento al valor base o al año anterior
        totalBruto = i === 0 
          ? baseValue * (1 + numValue / 100)
          : calculateTotalBruto(updatedData[i-1].ip_total_bruto, numValue);
      } else {
        // Para los años siguientes, aplicar incremento al año anterior
        totalBruto = calculateTotalBruto(
          updatedData[i-1].ip_total_bruto, 
          updatedData[i].ip_porcentaje
        );
      }
      
      updatedData[i] = {
        ...updatedData[i],
        ip_total_bruto: totalBruto,
        ip_total_bruto_formatted: formatCurrency(totalBruto)
      };
    }

    setIncrementoData(updatedData);
    setEdited(true);
  };

  const handleSliderChange = (index, e) => {
    const value = parseFloat(e.target.value);
    console.log(`Slider movido a ${value}%`);
    handlePorcentajeChange(index, value);
  };

  const handleInputChange = (index, e) => {
    const value = e.target.value;
    console.log(`Input cambiado a ${value}`);
    handlePorcentajeChange(index, value);
  };

  const handleIncrementDecrement = (index, increment) => {
    // Incrementar o decrementar en 0.1%
    const currentValue = incrementoData[index].ip_porcentaje;
    const newValue = increment ? currentValue + 0.1 : currentValue - 0.1;
    
    // Redondear a 1 decimal para evitar problemas de precisión
    const roundedValue = Math.round(newValue * 10) / 10;
    
    console.log(`${increment ? 'Incrementando' : 'Decrementando'} a ${roundedValue}%`);
    
    if (roundedValue >= 0 && roundedValue <= 50) {
      handlePorcentajeChange(index, roundedValue);
    }
  };

  const calculateTotalBruto = (previousTotal, porcentaje) => {
    return previousTotal * (1 + porcentaje / 100);
  };

  const formatCurrency = (amount) => {
    return "$" + amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

// Para IncrementoPresupuestoCardsWithContext.jsx

const handleSaveChanges = async () => {
  try {
    setSaving(true);
    
    // Preparar datos para enviar al servidor
    const dataToSend = incrementoData.map(item => ({
      id_presupuesto: item.id_presupuesto,
      id_esenario: item.id_esenario,
      id_año: item.id_año,
      ip_total_bruto: item.ip_total_bruto,
      ip_total_pre: item.ip_total_pre,
      ip_porcentaje: item.ip_porcentaje,
      ip_total_bruto_formatted: item.ip_total_bruto_formatted,
      ip_porcentaje_formatted: item.ip_porcentaje_formatted,
      a_numero_año: item.a_numero_año
    }));
    
    console.log("Datos a guardar:", dataToSend);
    
    // Configurar correctamente la petición AJAX para prevenir redirecciones
    const response = await axios.post(
      'http://localhost/proyecto_5/backend/incremento_presupuesto/updateIncrementoPresupuesto.php',
      { data: dataToSend },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // Indica que es una petición AJAX
        }
      }
    );
    
    if (response.data.success) {
      // Mostrar mensaje de éxito sin redireccionar
      setSuccessMessage('Datos de incremento guardados correctamente');
      setGlobalSuccessMessage('Datos de incremento de presupuesto guardados correctamente');
      setEdited(false);
      
      // Notificar a otros componentes que deben actualizar sus datos
      triggerRefresh();
      
      // Actualizar los datos locales sin redireccionar
      await fetchIncrementoData();
    } else {
      setError('Error al guardar los datos: ' + response.data.message);
      setGlobalError('Error al guardar incremento de presupuesto');
    }
    
    setSaving(false);
  } catch (error) {
    console.error('Error saving incremento data:', error);
    setError('Error de conexión al servidor');
    setGlobalError('Error de conexión al guardar incremento');
    setSaving(false);
  }
};

  if (loading) {
    return <div className="loading">Cargando datos de incremento...</div>;
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

  return (
    <div className="incremento-presupuesto-container">
      <h3><FaChartLine className="section-icon" /> Incremento de Presupuesto</h3>
      
      {successMessage && <div className="success">{successMessage}</div>}
      
      <div className="incremento-cards-container">
        {incrementoData.map((item, index) => (
          <div key={item.id_presupuesto} className="incremento-card">
            <div className="card-header">
              <div className="porcentaje">
                <FaPercentage className="percent-icon" /> {item.ip_porcentaje_formatted}
              </div>
              <div className="titulo">INCREMENTO <br/> PRESUPUESTO {item.a_numero_año}</div>
            </div>
            
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="50"
                step="0.1"
                value={item.ip_porcentaje}
                onChange={(e) => handleSliderChange(index, e)}
                className="porcentaje-slider"
              />
            </div>
            
            <div className="porcentaje-input-container">
              <div 
                className="btn-small btn-minus" 
                onClick={() => handleIncrementDecrement(index, false)}
                disabled={item.ip_porcentaje <= 0}
              >
                <FaMinus />
              </div>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={item.ip_porcentaje}
                onChange={(e) => handleInputChange(index, e)}
                className="porcentaje-input"
              />
              <div 
                className="btn-small btn-plus" 
                onClick={() => handleIncrementDecrement(index, true)}
                disabled={item.ip_porcentaje >= 50}
              >
                <FaPlus />
              </div>
            </div>
            
            <div className="card-info">
              <div className="info-row">
                <div className="info-label">Total<br/>Bruto:</div>
                <div className="info-value">{item.ip_total_bruto_formatted}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Total Pre:</div>
                <div className="info-value">{item.ip_total_pre_formatted}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {edited && (
        <div className="actions-container">
          <button 
            className="save-button active" 
            onClick={handleSaveChanges}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Guardando...' : 'Guardar Cambios de Incremento'}
          </button>
        </div>
      )}

      {/* Información de depuración (solo visible durante el desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <details>
            <summary>Debug Info</summary>
            <pre>{JSON.stringify(incrementoData, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};


export default IncrementoPresupuestoCardsWithContext;