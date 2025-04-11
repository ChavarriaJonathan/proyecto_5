import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaChevronRight, FaCheck } from 'react-icons/fa';
import './NewScenarioModal.css';
import { useEscenario } from '../pages/EscenarioContext';

const NewScenarioModal = ({ isOpen, onClose }) => {
  const { triggerRefresh } = useEscenario();
  const [currentStep, setCurrentStep] = useState(1);
  const [scenarioName, setScenarioName] = useState('');
  const [allConvocatorias, setAllConvocatorias] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [selectedConvocatorias, setSelectedConvocatorias] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newScenarioId, setNewScenarioId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllConvocatorias();
      fetchAllYears();
    } else {
      // Reset state on close
      setCurrentStep(1);
      setScenarioName('');
      setSelectedConvocatorias({});
      setError('');
      setSuccess('');
      setNewScenarioId(null);
    }
  }, [isOpen]);

  const fetchAllConvocatorias = async () => {
    try {
      setIsLoading(true);
      // Endpoint to get all convocatorias from the DB
      const response = await axios.get('http://localhost/proyecto_5/backend/sidebar/getAllConvocatorias.php');
      
      if (response.data.success) {
        setAllConvocatorias(response.data.data);
      } else {
        setError('Error al cargar convocatorias');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching convocatorias:', error);
      setError('Error de conexión al servidor');
      setIsLoading(false);
    }
  };

  const fetchAllYears = async () => {
    try {
      setIsLoading(true);
      // Endpoint to get all years from the DB
      const response = await axios.get('http://localhost/proyecto_5/backend/sidebar/getAllYears.php');
      
      if (response.data.success) {
        setAllYears(response.data.data);
      } else {
        setError('Error al cargar años');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching years:', error);
      setError('Error de conexión al servidor');
      setIsLoading(false);
    }
  };

  const handleCreateScenario = async () => {
    if (!scenarioName.trim()) {
      setError('El nombre del escenario no puede estar vacío');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Endpoint to create a new scenario
      const response = await axios.post('http://localhost/proyecto_5/backend/sidebar/createScenario.php', {
        name: scenarioName
      });
      
      if (response.data.success) {
        setNewScenarioId(response.data.id_escenario);
        setSuccess('Escenario creado correctamente');
        setCurrentStep(2);
      } else {
        setError(response.data.message || 'Error al crear el escenario');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating scenario:', error);
      setError('Error de conexión al servidor');
      setIsLoading(false);
    }
  };

  const handleConvocatoriaSelection = (convocatoriaId) => {
    setSelectedConvocatorias(prev => {
      const newState = { ...prev };
      if (newState[convocatoriaId]) {
        // If already selected, deselect it
        delete newState[convocatoriaId];
      } else {
        // Initialize with empty array of selected years
        newState[convocatoriaId] = [];
      }
      return newState;
    });
  };

  const handleYearSelection = (convocatoriaId, yearId) => {
    if (!selectedConvocatorias[convocatoriaId]) {
      return;
    }

    setSelectedConvocatorias(prev => {
      const newState = { ...prev };
      const currentYears = [...newState[convocatoriaId]];
      
      // Check if the year is already selected
      const yearIndex = currentYears.indexOf(yearId);
      
      if (yearIndex >= 0) {
        // If this year and all years after it should be removed
        newState[convocatoriaId] = currentYears.slice(0, yearIndex);
      } else {
        // Find where this year should be inserted in order
        const yearNumber = allYears.find(y => y.id_años === yearId)?.a_numero_año;
        const allYearsInOrder = allYears.map(y => y.id_años);
        
        // Find the current highest year index
        const maxSelectedYearIndex = Math.max(...currentYears.map(y => allYearsInOrder.indexOf(y)), -1);
        const thisYearIndex = allYearsInOrder.indexOf(yearId);
        
        // If selecting a year that's not consecutive, fill in the gaps
        if (thisYearIndex > maxSelectedYearIndex + 1) {
          // Fill in all years between the current max and this year
          for (let i = maxSelectedYearIndex + 1; i <= thisYearIndex; i++) {
            if (!currentYears.includes(allYearsInOrder[i])) {
              currentYears.push(allYearsInOrder[i]);
            }
          }
        } else {
          // Just add this year if it's the next in sequence
          currentYears.push(yearId);
        }
        
        // Sort years by their position in the allYearsInOrder array
        currentYears.sort((a, b) => allYearsInOrder.indexOf(a) - allYearsInOrder.indexOf(b));
        
        newState[convocatoriaId] = currentYears;
      }
      
      return newState;
    });
  };

  const handleSaveData = async () => {
    // Validate if at least one convocatoria is selected
    if (Object.keys(selectedConvocatorias).length === 0) {
      setError('Debes seleccionar al menos una convocatoria');
      return;
    }

    // Check if each selected convocatoria has at least one year selected
    const hasEmptyYears = Object.values(selectedConvocatorias).some(years => years.length === 0);
    if (hasEmptyYears) {
      setError('Debes seleccionar al menos un año para cada convocatoria');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Prepare data for the API
      const datosConvocatoria = [];
      
      Object.entries(selectedConvocatorias).forEach(([convocatoriaId, years]) => {
        years.forEach(yearId => {
          datosConvocatoria.push({
            id_convocatoria: parseInt(convocatoriaId),
            id_escenario: newScenarioId,
            id_año: yearId,
            nuevos_proyectos: 0,
            costo_x_proyecto: 0,
            subtotal: 0,
            porcentaje_x_año: 0
          });
        });
      });
      
      // Endpoint to save convocatoria data
      const response = await axios.post('http://localhost/proyecto_5/backend/sidebar/saveConvocatoriaData.php', {
        data: datosConvocatoria
      });
      
      if (response.data.success) {
        setSuccess('Datos guardados correctamente');
        triggerRefresh(); // Refresh data in the parent component
        setTimeout(() => {
          onClose();  // Close modal after a delay
        }, 2000);
      } else {
        setError(response.data.message || 'Error al guardar los datos');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Error de conexión al servidor');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Crear Nuevo Escenario</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Estás a punto de crear un nuevo Escenario. Como primer punto te pediremos crear el escenario 
            y posteriormente te pediremos seleccionar las convocatorias que necesites en este escenario. 
            Una vez señalada la convocatoria se te pedirá dar a conocer qué años necesitas para cada convocatoria.
          </p>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {/* Step 1: Create Scenario */}
          <div className="step-container">
            <div className="step-header">
              <div className={`step-number ${currentStep >= 1 ? 'active' : ''}`}>1</div>
              <h3>Datos del Escenario</h3>
            </div>
            
            <div className="step-content">
              <div className="form-group">
                <label htmlFor="scenarioName">Nombre del Nuevo Escenario:</label>
                <input
                  type="text"
                  id="scenarioName"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  disabled={currentStep > 1}
                  placeholder="Ingresa el nombre del escenario"
                />
              </div>
              
              {currentStep === 1 && (
                <div className="form-actions">
                  <button 
                    className="btn-primary"
                    onClick={handleCreateScenario}
                    disabled={isLoading || !scenarioName.trim()}
                  >
                    {isLoading ? 'Creando...' : 'Continuar'}
                    {!isLoading && <FaChevronRight className="btn-icon-right" />}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Step 2: Select Convocatorias and Years */}
          {currentStep === 2 && (
            <div className="step-container">
              <div className="step-header">
                <div className="step-number active">2</div>
                <h3>Seleccionar Convocatorias y Años</h3>
              </div>
              
              <div className="step-content">
                <div className="convocatorias-container">
                  {allConvocatorias.length > 0 ? (
                    allConvocatorias.map(conv => (
                      <div key={conv.id_convocatoria} className="convocatoria-item">
                        <div className="convocatoria-header">
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={!!selectedConvocatorias[conv.id_convocatoria]}
                              onChange={() => handleConvocatoriaSelection(conv.id_convocatoria)}
                            />
                            <span className="checkmark"></span>
                            {conv.c_nombre}
                          </label>
                        </div>
                        
                        {selectedConvocatorias[conv.id_convocatoria] && (
                          <div className="years-container">
                            <p className="years-label">Selecciona los años para esta convocatoria:</p>
                            <div className="years-grid">
                              {allYears.map(year => (
                                <label key={year.id_años} className="year-checkbox-container">
                                  <input
                                    type="checkbox"
                                    checked={selectedConvocatorias[conv.id_convocatoria].includes(year.id_años)}
                                    onChange={() => handleYearSelection(conv.id_convocatoria, year.id_años)}
                                  />
                                  <span className="year-checkmark"></span>
                                  {year.a_numero_año}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="loading-message">
                      {isLoading ? 'Cargando convocatorias...' : 'No hay convocatorias disponibles'}
                    </div>
                  )}
                </div>
                
                <div className="form-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setCurrentStep(1)}
                    disabled={isLoading}
                  >
                    Atrás
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleSaveData}
                    disabled={isLoading || Object.keys(selectedConvocatorias).length === 0}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                    {!isLoading && <FaCheck className="btn-icon-right" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewScenarioModal;