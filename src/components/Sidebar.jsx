import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaChartLine, FaFilter, FaSortAlphaDown, FaSortAlphaUp, FaSort, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = ({ onEscenarioSelect, onConvocatoriaFilter, onSortChange }) => {
  const [escenarios, setEscenarios] = useState([]);
  const [convocatorias, setConvocatorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEscenario, setSelectedEscenario] = useState(null);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  const [sortOption, setSortOption] = useState('original');
  const [escenariosAccordionOpen, setEscenariosAccordionOpen] = useState(false);
  const [convocatoriasAccordionOpen, setConvocatoriasAccordionOpen] = useState(false);
  const [sortOptionsAccordionOpen, setSortOptionsAccordionOpen] = useState(false);

  useEffect(() => {
    fetchEscenarios();
  }, []);

  useEffect(() => {
    if (selectedEscenario) {
      fetchConvocatorias(selectedEscenario.id_escenario);
    } else {
      setConvocatorias([]);
    }
  }, [selectedEscenario]);

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

  const fetchConvocatorias = async (escenarioId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost/proyecto_5/backend/sidebar/getConvocatorias.php?id_escenario=${escenarioId}`);
      
      if (response.data.success) {
        setConvocatorias(response.data.data);
      } else {
        setError('Error al cargar convocatorias');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching convocatorias:', error);
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
    setSelectedEscenario(escenario);
    setSelectedConvocatoria(null); // Reset convocatoria filter when selecting new escenario
    onEscenarioSelect(escenario);
    onConvocatoriaFilter(null); // Reset convocatoria filter in parent component
    setEscenariosAccordionOpen(false); // Cerrar el acordeón al seleccionar un escenario
  };

  const handleConvocatoriaClick = (convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    onConvocatoriaFilter(convocatoria);
    setConvocatoriasAccordionOpen(false); // Cerrar el acordeón al seleccionar una convocatoria
  };

  const handleShowAllClick = () => {
    setSelectedConvocatoria(null);
    onConvocatoriaFilter(null);
    setConvocatoriasAccordionOpen(false); // Cerrar el acordeón al seleccionar "Mostrar todas"
  };
  
  const handleSortChange = (option) => {
    setSortOption(option);
    onSortChange(option);
    setSortOptionsAccordionOpen(false); // Cerrar el acordeón al seleccionar una opción de ordenamiento
  };

  const toggleEscenariosAccordion = () => {
    setEscenariosAccordionOpen(!escenariosAccordionOpen);
  };

  const toggleConvocatoriasAccordion = () => {
    setConvocatoriasAccordionOpen(!convocatoriasAccordionOpen);
  };

  const toggleSortOptionsAccordion = () => {
    setSortOptionsAccordionOpen(!sortOptionsAccordionOpen);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaChartLine className="logo-icon" />
        <h2>Presión Del Gasto</h2>
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
              {loading && !selectedEscenario ? (
                <div className="loading-message">Cargando...</div>
              ) : error && !selectedEscenario ? (
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
      
      {selectedEscenario && (
        <div className="sidebar-section">
          {/* Primero el acordeón de ordenamiento */}
          <h3><FaSort /> Ordenar Convocatorias</h3>
          <div className="accordion-container">
            <div className="accordion-header" onClick={toggleSortOptionsAccordion}>
              {sortOptionsAccordionOpen ? <FaChevronDown /> : <FaChevronRight />}
              <span>Ver Opciones de Orden</span>
            </div>
            
            {sortOptionsAccordionOpen && (
              <div className="sort-options">
                <div 
                  className={`sort-option ${sortOption === 'original' ? 'selected' : ''}`}
                  onClick={() => handleSortChange('original')}
                >
                  <FaSort /> Original (BD)
                </div>
                <div 
                  className={`sort-option ${sortOption === 'alphabetical' ? 'selected' : ''}`}
                  onClick={() => handleSortChange('alphabetical')}
                >
                  <FaSortAlphaDown /> Alfabético (A-Z)
                </div>
                <div 
                  className={`sort-option ${sortOption === 'alphabetical-desc' ? 'selected' : ''}`}
                  onClick={() => handleSortChange('alphabetical-desc')}
                >
                  <FaSortAlphaUp /> Alfabético (Z-A)
                </div>
              </div>
            )}
          </div>
          
          {/* Luego el acordeón de convocatorias */}
          <h3><FaFilter /> Filtrar por Convocatoria</h3>
          <div className="accordion-container">
            <div className="accordion-header" onClick={toggleConvocatoriasAccordion}>
              {convocatoriasAccordionOpen ? <FaChevronDown /> : <FaChevronRight />}
              <span>Ver Convocatorias</span>
            </div>
            
            {convocatoriasAccordionOpen && (
              <div className="convocatorias-list">
                <div 
                  className={`convocatoria-item ${selectedConvocatoria === null ? 'selected' : ''}`}
                  onClick={handleShowAllClick}
                >
                  Mostrar todas
                </div>
                
                {loading ? (
                  <div className="loading-message">Cargando...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : convocatorias.length > 0 ? (
                  convocatorias.map(convocatoria => (
                    <div 
                      key={convocatoria.id_convocatoria} 
                      className={`convocatoria-item ${selectedConvocatoria && selectedConvocatoria.id_convocatoria === convocatoria.id_convocatoria ? 'selected' : ''}`}
                      onClick={() => handleConvocatoriaClick(convocatoria)}
                    >
                      {convocatoria.c_nombre}
                    </div>
                  ))
                ) : (
                  <div className="no-results">No hay convocatorias disponibles</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="sidebar-section">
        <h3><FaPlus /> Agregar Escenario</h3>
        <button className="add-escenario-btn">
          <FaPlus /> Nuevo Escenario
        </button>
      </div>
      
      <div className="sidebar-footer">
        <p>Sistema de Tablero de Presión del Gasto</p>
      </div>
    </div>
  );
};

export default Sidebar;