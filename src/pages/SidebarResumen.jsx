import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaChartLine, FaListUl, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import '../components/Sidebar.css';
import './SidebarResumen.css';
import { useEscenario } from './EscenarioContext';

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
  
  // Estado para las sugerencias de búsqueda
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Referencia para el dropdown de sugerencias
  const suggestionsRef = useRef(null);

  useEffect(() => {
    fetchEscenarios();
    
    // Seleccionar "Resumen general" por defecto al cargar
    selectEscenario({ id_escenario: 'all', e_nombre: 'Resumen general' });
  }, [refreshTrigger]);

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

  const handleResumenGeneralClick = () => {
    // Seleccionar 'all' para indicar que se debe mostrar el resumen general
    selectEscenario({ id_escenario: 'all', e_nombre: 'Resumen general' });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaChartLine className="logo-icon" />
        <h2>Resumen Escenarios</h2>
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
            {/* Opción para resumen general (reemplazando "Mostrar todos los escenarios") */}
            <div 
              className={`escenario-item all-escenarios ${selectedEscenario && selectedEscenario.id_escenario === 'all' ? 'selected' : ''}`}
              onClick={handleResumenGeneralClick}
            >
              <FaListUl className="resumen-icon" />
              <span>Resumen general</span>
            </div>
            
            {/* Separador entre la opción "Resumen general" y el resto de escenarios */}
            <div className="escenarios-separator"></div>
            
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
        </div>
      </div>
      
      <div className="sidebar-footer">
        <p>Sistema de Tablero de Presión del Gasto</p>
      </div>
    </div>
  );
};

export default SidebarResumen;