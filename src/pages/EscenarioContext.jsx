import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner'; // Importar toast de sonner

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

    // Si el escenario seleccionado no es 'all' (mostrar todos), resetear la convocatoria
    if (escenario && escenario.id_escenario !== 'all') {
      // Al cambiar de escenario, resetear la convocatoria seleccionada
      setSelectedConvocatoria(null);
    }
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

  // Función para mostrar mensajes de éxito usando Sonner
  const showSuccessToast = (message) => {
    toast.success(message, {
      // Opciones opcionales específicas para este toast
      duration: 3000,
      icon: '✅',
    });
    setGlobalSuccessMessage(message); // Mantenemos el estado por compatibilidad
  };

  // Función para mostrar mensajes de error usando Sonner
  const showErrorToast = (message) => {
    toast.error(message, {
      duration: 4000, // Los errores permanecen más tiempo
      icon: '❌',
    });
    setGlobalError(message); // Mantenemos el estado por compatibilidad
  };

  // Efecto para mostrar notificaciones cuando cambien los mensajes de éxito o error
  useEffect(() => {
    if (globalSuccessMessage) {
      // Muestra una notificación toast cuando hay un mensaje de éxito
      toast.success(globalSuccessMessage);

      // Limpiar mensaje después de mostrarlo
      const timer = setTimeout(() => {
        setGlobalSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [globalSuccessMessage]);

  useEffect(() => {
    if (globalError) {
      // Muestra una notificación toast cuando hay un mensaje de error
      toast.error(globalError);

      // Limpiar mensaje después de mostrarlo
      const timer = setTimeout(() => {
        setGlobalError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [globalError]);

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
    setGlobalSuccessMessage: showSuccessToast, // Reemplazamos por la nueva función
    globalError,
    setGlobalError: showErrorToast // Reemplazamos por la nueva función
  };

  return (
    <EscenarioContext.Provider value={value}>
      {children}
    </EscenarioContext.Provider>
  );
};