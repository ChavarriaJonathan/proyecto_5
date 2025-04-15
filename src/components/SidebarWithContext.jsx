import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPlus, FaChartLine, FaFilter, FaSortAlphaDown, FaSortAlphaUp, FaSort, FaChevronDown, FaChevronRight, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { useEscenario } from '../pages/EscenarioContext';
import './Sidebar.css';
import NewScenarioModal from './NewScenarioModal';

const SidebarWithContext = () => {
  const {
    selectedEscenario,
    selectEscenario,
    selectedConvocatoria,
    selectConvocatoria,
    sortOption,
    changeSortOption,
    refreshTrigger
  } = useEscenario();
  
  const [escenarios, setEscenarios] = useState([]);
  const [convocatorias, setConvocatorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOptionsAccordionOpen, setSortOptionsAccordionOpen] = useState(false);
  const [convocatoriasAccordionOpen, setConvocatoriasAccordionOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para las sugerencias de búsqueda
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Referencia para el dropdown de sugerencias
  const suggestionsRef = useRef(null);

  useEffect(() => {
    fetchEscenarios();
  }, [refreshTrigger]);

  useEffect(() => {
    if (selectedEscenario) {
      fetchConvocatorias(selectedEscenario.id_escenario);
    } else {
      setConvocatorias([]);
    }
  }, [selectedEscenario, refreshTrigger]);
  
  // Efecto para manejar clics fuera del dropdown de sugerencias
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim().length > 0) {
      // Filtrar escenarios que coinciden con el término de búsqueda
      const filteredSuggestions = escenarios.filter(escenario => 
        escenario.e_nombre.toLowerCase().includes(term.toLowerCase())
      );
      setSearchSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleSearchFocus = () => {
    if (searchTerm.trim().length > 0) {
      setShowSuggestions(true);
    }
  };
  
  const handleSuggestionClick = (escenario) => {
    setSearchTerm(escenario.e_nombre);
    setShowSuggestions(false);
    selectEscenario(escenario);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchSuggestions.length > 0) {
      // Seleccionar el primer escenario que coincide con la búsqueda
      selectEscenario(searchSuggestions[0]);
      setShowSuggestions(false);
    }
  };

  const filteredEscenarios = escenarios.filter(escenario => 
    escenario.e_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEscenarioClick = (escenario) => {
    selectEscenario(escenario);
  };

  const handleConvocatoriaClick = (convocatoria) => {
    selectConvocatoria(convocatoria);
    setConvocatoriasAccordionOpen(false);
  };

  const handleShowAllClick = () => {
    selectConvocatoria(null);
    setConvocatoriasAccordionOpen(false);
  };
  
  const handleSortChange = (option) => {
    changeSortOption(option);
    setSortOptionsAccordionOpen(false);
  };

  const toggleSortOptionsAccordion = () => {
    setSortOptionsAccordionOpen(!sortOptionsAccordionOpen);
  };

  const toggleConvocatoriasAccordion = () => {
    setConvocatoriasAccordionOpen(!convocatoriasAccordionOpen);
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <FaChartLine className="logo-icon" />
          <h2>Presión Del Gasto</h2>
        </div>
        
        <div className="sidebar-section">
          <h3><FaSearch /> Buscar Escenario</h3>
          <div className="search-container" ref={suggestionsRef}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Buscar escenario..."
                value={searchTerm}
                onChange={handleSearch}
                onFocus={handleSearchFocus}
                className="search-input"
              />
            </form>
            
            {/* Dropdown de sugerencias de búsqueda */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map(escenario => (
                  <div 
                    key={escenario.id_escenario} 
                    className="search-suggestion-item"
                    onClick={() => handleSuggestionClick(escenario)}
                  >
                    <span>{escenario.e_nombre}</span>
                    {selectedEscenario && selectedEscenario.id_escenario === escenario.id_escenario && (
                      <FaCheck className="selected-icon" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Lista de escenarios siempre visible (sin acordeón) */}
          <div className="escenarios-list-container">
            <h4 className="escenarios-list-title">Escenarios disponibles</h4>
            <div className="escenarios-list">
              {loading && escenarios.length === 0 ? (
                <div className="loading-message">Cargando...</div>
              ) : error && escenarios.length === 0 ? (
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
          <button className="add-escenario-btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Nuevo Escenario
          </button>
        </div>
        
        <div className="sidebar-footer">
          <p>Sistema de Tablero de Presión del Gasto</p>
        </div>
      </div>
      
      {/* Importar y usar el modal */}
      <NewScenarioModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SidebarWithContext;