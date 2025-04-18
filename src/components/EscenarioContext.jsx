import React, { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto
const EscenarioContext = createContext();

// Hook personalizado para usar el contexto
export const useEscenario = () => {
  return useContext(EscenarioContext);
};

// Proveedor del contexto
export const EscenarioProvider = ({ children }) => {
  // Estado para el escenario seleccionado
  const [selectedEscenario, setSelectedEscenario] = useState(null);
  // Estado para la convocatoria seleccionada
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  // Estado para la opción de ordenamiento
  const [sortOption, setSortOption] = useState('original');
  // Estado para controlar actualizaciones y recargas
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Estados para mensajes y edición
  const [globalSuccessMessage, setGlobalSuccessMessage] = useState('');
  const [globalError, setGlobalError] = useState('');
  
  // Función para seleccionar un escenario
  const selectEscenario = (escenario) => {
    setSelectedEscenario(escenario);
    // Al cambiar de escenario, resetear la convocatoria seleccionada
    setSelectedConvocatoria(null);
  };
  
  // Función para seleccionar una convocatoria
  const selectConvocatoria = (convocatoria) => {
    setSelectedConvocatoria(convocatoria);
  };
  
  // Función para cambiar la opción de ordenamiento
  const changeSortOption = (option) => {
    setSortOption(option);
  };
  
  // Función para actualizar los datos en todos los componentes
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Limpiar mensajes de éxito después de 1 segundos
  useEffect(() => {
    if (globalSuccessMessage) {
      const timer = setTimeout(() => {
        setGlobalSuccessMessage('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [globalSuccessMessage]);
  
  // Valores a proporcionar a través del contexto
  const value = {
    selectedEscenario,
    selectEscenario,
    selectedConvocatoria,
    selectConvocatoria,
    sortOption,
    changeSortOption,
    refreshTrigger,
    triggerRefresh,
    globalSuccessMessage,
    setGlobalSuccessMessage,
    globalError,
    setGlobalError
  };
  
  return (
    <EscenarioContext.Provider value={value}>
      {children}
    </EscenarioContext.Provider>
  );
};