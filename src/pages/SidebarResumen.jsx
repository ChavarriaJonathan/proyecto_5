import React, { useState, useEffect } from 'react';
import { FaSearch, FaChartLine, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import '../components/Sidebar.css';
import './SidebarResumen.css';
import { useEscenario } from './EscenarioContext';

// Este componente es una versión simplificada del SidebarWithContext
// que solo muestra la sección de escenarios para la página de Resumen
const SidebarResumen = () => {
  const {
    selectedEscenario,
    selectEscenario,
    refreshTrigger
  } = useEscenario();
  
  const [escenarios, setEscenarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [escenariosAccordionOpen, setEscenariosAccordionOpen] = useState(true); // Por defecto abierto

  useEffect(() => {
    fetchEscenarios();
  }, [refreshTrigger]);

  const fetchEscenarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost/proyecto_5/backend/sidebar/getEscenarios.php');
      
      if (response.data.success) {
        setEscenarios(response.data.data);
      } else {
        setError('Error al cargar escenarios');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching escenarios:', error);
      setError('Error de conexión al servidor');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEscenarios = escenarios.filter(escenario => 
    escenario.e_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEscenarioClick = (escenario) => {
    selectEscenario(escenario);
  };

  const toggleEscenariosAccordion = () => {
    setEscenariosAccordionOpen(!escenariosAccordionOpen);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaChartLine className="logo-icon" />
        <h2>Resumen Escenarios</h2>
      </div>
      
      <div className="sidebar-section">
        <h3><FaSearch /> Buscar Escenario</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar escenario..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="accordion-container">
          <div className="accordion-header" onClick={toggleEscenariosAccordion}>
            {escenariosAccordionOpen ? <FaChevronDown /> : <FaChevronRight />}
            <span>Mostrar Escenarios</span>
          </div>
          
          {escenariosAccordionOpen && (
            <div className="escenarios-list">
              {loading ? (
                <div className="loading-message">Cargando...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : filteredEscenarios.length > 0 ? (
                filteredEscenarios.map(escenario => (
                  <div 
                    key={escenario.id_escenario} 
                    className={`escenario-item ${selectedEscenario && selectedEscenario.id_escenario === escenario.id_escenario ? 'selected' : ''}`}
                    onClick={() => handleEscenarioClick(escenario)}
                  >
                    {escenario.e_nombre}
                  </div>
                ))
              ) : (
                <div className="no-results">No se encontraron escenarios</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="sidebar-footer">
        <p>Sistema de Tablero de Presión del Gasto</p>
      </div>
    </div>
  );
};

export default SidebarResumen;